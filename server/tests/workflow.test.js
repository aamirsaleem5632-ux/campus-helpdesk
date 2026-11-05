import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { orchestrator } from '../orchestrator/multiAgentWorkflow.js';
import { db } from '../data/store.js';

describe('Multi-Agent Workflow Orchestrator', () => {

  test('Runs complete pipeline with parallel execution for independent agents', async () => {
    const student = {
      studentId: 'STU-94021',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@campus.edu',
      role: 'Undergraduate Student'
    };

    const result = await orchestrator.executeWorkflow({
      title: 'Eduroam Wi-Fi dropping connection',
      problemDescription: 'Wi-Fi keeps dropping connection every 10 minutes in Library 2nd floor',
      location: 'Main Library 2nd Floor',
      studentProfile: student
    });

    // Check workflow outputs
    assert.ok(result.workflowId.startsWith('trace-'));
    assert.equal(result.requiresStudentConfirmation, true);
    assert.equal(result.parallelExecution.enabled, true);

    // Verify all 6 agents contributed
    assert.ok(result.analysis.manager);
    assert.ok(result.analysis.classification);
    assert.ok(result.analysis.priority);
    assert.ok(result.analysis.resolution);
    assert.ok(result.analysis.routing);
    assert.ok(result.analysis.validation);

    // Check draft complaint attributes
    assert.equal(result.pendingComplaintDraft.category, 'IT & Network Support');
    assert.equal(result.pendingComplaintDraft.requesterEmail, 'sarah.j@campus.edu');

    // Verify trace is stored in database for Dashboard
    const traces = db.getWorkflowTraces(5);
    const foundTrace = traces.find(t => t.id === result.workflowId);
    assert.ok(foundTrace);
    assert.equal(foundTrace.steps.length, 7); // Planning + 4 Parallel Specialists + Validation + Synthesis
  });
});
