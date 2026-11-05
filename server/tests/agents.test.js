import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { ManagerAgent } from '../agents/managerAgent.js';
import { ClassificationAgent } from '../agents/classificationAgent.js';
import { PriorityAgent } from '../agents/priorityAgent.js';
import { ResolutionAgent } from '../agents/resolutionAgent.js';
import { RoutingAgent } from '../agents/routingAgent.js';
import { ValidationAgent } from '../agents/validationAgent.js';

describe('Specialized University Helpdesk Agents', () => {

  test('1. Classification Agent accurately categorizes Wi-Fi vs Water Leak', async () => {
    const agent = new ClassificationAgent();

    // Test IT Wi-Fi classification
    const wifiResult = await agent.run({
      problemDescription: 'Wi-Fi keeps dropping connection in Library 2nd floor eduroam',
      location: 'Library'
    });
    assert.equal(wifiResult.status, 'SUCCESS');
    assert.equal(wifiResult.data.category, 'IT & Network Support');
    assert.equal(wifiResult.data.nature, 'Technical');

    // Test Plumbing Leak classification
    const leakResult = await agent.run({
      problemDescription: 'Active water leak dripping from pipe under lab sink',
      location: 'Science Hall 304'
    });
    assert.equal(leakResult.status, 'SUCCESS');
    assert.equal(leakResult.data.category, 'Facilities & Maintenance');
    assert.equal(leakResult.data.nature, 'Facility');
  });

  test('2. Priority Agent evaluates emergency vs normal urgency with reasoning', async () => {
    const agent = new PriorityAgent();

    // Test Urgent / Critical priority
    const emergencyResult = await agent.run({
      problemDescription: 'Severe water flooding in chemistry lab with electrical wires nearby!'
    });
    assert.equal(emergencyResult.status, 'SUCCESS');
    assert.ok(['High', 'Critical'].includes(emergencyResult.data.priority));
    assert.ok(emergencyResult.data.reason.length > 5);

    // Test Low priority
    const generalResult = await agent.run({
      problemDescription: 'General question about campus dining hall hours on weekends'
    });
    assert.equal(generalResult.status, 'SUCCESS');
    assert.equal(generalResult.data.priority, 'Low');
  });

  test('3. Resolution Agent provides grounded troubleshooting from University KB without hallucination', async () => {
    const agent = new ResolutionAgent();

    const result = await agent.run({
      problemDescription: 'Campus Wi-Fi disconnecting frequently on my laptop'
    });
    assert.equal(result.status, 'SUCCESS');
    assert.ok(Array.isArray(result.data.troubleshootingSteps));
    assert.ok(result.data.troubleshootingSteps.length >= 2);
    assert.ok(result.data.officialPolicyReference.length > 0);
  });

  test('4. Routing Agent assigns official University department, support team, and SLA', async () => {
    const agent = new RoutingAgent();

    const result = await agent.run({
      problemDescription: 'Projector bulb flickering in Auditorium B'
    }, {
      classification: { category: 'IT & Network Support' }
    });
    assert.equal(result.status, 'SUCCESS');
    assert.equal(result.data.departmentName, 'IT & Network Support');
    assert.ok(result.data.supportTeam.length > 0);
    assert.ok(typeof result.data.slaHours === 'number');
    assert.ok(result.data.contactEmail.includes('@campus.edu'));
  });

  test('5. Validation Agent checks consistency and detects contradictions', async () => {
    const agent = new ValidationAgent();

    // Coherent context
    const validCheck = await agent.run('Wi-Fi issue', {
      classification: { category: 'IT & Network Support' },
      priority: { priority: 'High' },
      resolution: { troubleshootingSteps: ['Forget eduroam network and reconnect'] },
      routing: { departmentName: 'IT & Network Support' }
    });
    assert.equal(validCheck.status, 'SUCCESS');
    assert.equal(validCheck.data.isValid, true);
    assert.equal(validCheck.data.status, 'APPROVED');

    // Mismatched context (Wi-Fi classified but routed to Facilities)
    const mismatchCheck = await agent.run('Wi-Fi issue', {
      classification: { category: 'IT & Network Support' },
      priority: { priority: 'Low' },
      resolution: { troubleshootingSteps: ['Reset Wi-Fi'] },
      routing: { departmentName: 'Facilities & Maintenance' }
    });
    assert.equal(mismatchCheck.status, 'SUCCESS');
    assert.ok(mismatchCheck.data.issuesDetected.length > 0);
  });

  test('6. Manager Agent plans tasks and synthesizes student advisory', async () => {
    const manager = new ManagerAgent();

    const plan = await manager.run({
      action: 'INITIATE_PLAN',
      studentIssue: { description: 'Transcript order hold not cleared' }
    });
    assert.equal(plan.status, 'SUCCESS');
    assert.ok(Array.isArray(plan.data.taskPlan));
    assert.ok(plan.data.taskPlan.length >= 3);
  });
});

