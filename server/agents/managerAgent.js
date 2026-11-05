import { BaseAgent } from './baseAgent.js';

const SYSTEM_INSTRUCTION = `You are the Lead University Helpdesk Manager Agent.
Your responsibility is to orchestrate the resolution of student complaints, delegate work to specialist sub-agents, and synthesize their verified outputs into an actionable, professional student advisory report.

You control the workflow execution:
1. Receive and understand the student's problem.
2. Outline the specialist task plan.
3. Review and combine the outputs from Classification, Priority, Resolution, Routing, and Validation agents.
4. Prepare a comprehensive response providing immediate troubleshooting guidance while preparing a draft official ticket if technician help is needed.`;

const SCHEMA = `{
  "executiveSummary": "Concise understanding of the student's situation",
  "taskPlan": [
    "1. Categorize problem domain",
    "2. Determine urgency and exam/deadline impact",
    "3. Retrieve verified campus troubleshooting steps",
    "4. Determine correct handling department & SLA",
    "5. Quality audit and cross-verification"
  ],
  "studentActionPlan": {
    "immediateSteps": ["Step 1...", "Step 2..."],
    "canSelfResolve": true,
    "warningNote": "Safety or policy warning if applicable"
  },
  "recommendedTicketDraft": {
    "suggestedTitle": "Professional ticket title",
    "category": "Official category",
    "priority": "Low | Medium | High | Critical",
    "department": "Target campus department",
    "targetTeam": "Specific team",
    "slaHours": 4
  },
  "confirmationRequired": true,
  "confirmationPrompt": "Confirmation message asking the student if they wish to submit the official ticket"
}`;

export class ManagerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Manager / Orchestrator Agent',
      role: 'Master Task Planner & Specialist Coordinator',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  /**
   * Synthesize final report from the parallel specialist results
   */
  async synthesize({ studentIssue, studentProfile, classification, priority, resolution, routing, validation }) {
    const contextPrompt = {
      studentIssue,
      studentProfile,
      specialistOutputs: {
        classification: classification.data,
        priority: priority.data,
        resolution: resolution.data,
        routing: routing.data,
        validation: validation.data
      }
    };

    return this.run(contextPrompt, { isSynthesis: true });
  }

  async fallbackRuleEngine(input, context) {
    const raw = typeof input === 'string' ? input : (input.studentIssue || input.problemDescription || '');
    const issueText = typeof raw === 'string' ? raw : (raw.title || raw.description || JSON.stringify(raw));

    const specialists = input?.specialistOutputs || context?.specialistOutputs || {};
    const cls = specialists.classification || {};
    const pri = specialists.priority || {};
    const res = specialists.resolution || {};
    const rtg = specialists.routing || {};

    const category = cls.category || 'General Inquiry';
    const priorityLevel = pri.priority || 'Medium';
    const department = rtg.departmentName || category;
    const steps = res.troubleshootingSteps || ['Check student portal for service status updates.'];

    return {
      executiveSummary: `Analysis completed for: "${issueText.substring(0, 100)}..."`,
      taskPlan: [
        '1. Classification Agent identified category and domain nature',
        '2. Priority Agent evaluated time sensitivity and academic/facility risk',
        '3. Resolution Agent retrieved grounded troubleshooting runbooks',
        '4. Routing Agent matched campus department and dispatch SLA',
        '5. Validation Agent performed consistency and policy audit'
      ],
      studentActionPlan: {
        immediateSteps: steps,
        canSelfResolve: Boolean(res.canSelfResolve),
        warningNote: res.safetyWarning || null
      },
      recommendedTicketDraft: {
        suggestedTitle: (input?.studentIssue?.title || issueText.substring(0, 70)).trim(),
        category,
        priority: priorityLevel,
        department,
        targetTeam: rtg.supportTeam || 'Campus Helpdesk Dispatch',
        slaHours: rtg.slaHours || 24
      },
      confirmationRequired: true,
      confirmationPrompt: `Would you like us to submit an official ${priorityLevel}-priority ticket to ${department} (${rtg.supportTeam || 'Dispatch'})?`
    };
  }
}

