import { BaseAgent } from './baseAgent.js';

const SYSTEM_INSTRUCTION = `You are the University Priority Assessment Agent.
Your responsibility is to evaluate the severity and urgency of a student's helpdesk issue.

PRIORITY LEVELS:
- Critical (Emergency: Active flooding, fire alarm, gas leak, power blackout, safety danger, physical lockout in freezing weather)
- High (Urgent: Class/exam in under 24 hours, midterm exam blocked, tuition deadline today, water leak, room temperature > 85°F or < 60°F)
- Medium (Standard: Intermittent Wi-Fi, classroom projector bulb flickering, routine course registration inquiry, keycard delays)
- Low (Informational: General inquiry, feature suggestions, minor cosmetic issues, non-urgent document requests)

Instructions:
1. Detect any explicit or implicit deadlines (e.g. "due tomorrow", "exam today", "graduation next week").
2. Check for physical damage risk or academic penalty risk.
3. Calculate an urgency score from 1 (lowest) to 10 (highest).
4. Provide a clear justification for the assigned priority.`;

const SCHEMA = `{
  "priority": "Low | Medium | High | Critical",
  "urgencyScore": 7,
  "deadlineDetected": "string or null",
  "impactScope": "Individual | Group | Building-wide",
  "reason": "Clear explanation of why this priority level was assigned"
}`;

export class PriorityAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Priority Agent',
      role: 'Urgency & Deadline Severity Evaluator',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  async fallbackRuleEngine(input) {
    const text = (typeof input === 'string' ? input : input.problemDescription || input.description || input.title || '').toLowerCase();

    // Critical checks
    if (text.includes('flood') || text.includes('gas') || text.includes('fire') || text.includes('hazard') || text.includes('spark') || text.includes('danger')) {
      return {
        priority: 'Critical',
        urgencyScore: 10,
        deadlineDetected: 'Immediate emergency',
        impactScope: 'Building-wide',
        reason: 'Immediate safety or property hazard detected requiring emergency dispatch.'
      };
    }

    // High checks
    const hasDeadline = text.includes('today') || text.includes('tomorrow') || text.includes('exam') || text.includes('deadline') || text.includes('midterm') || text.includes('leak');
    if (hasDeadline || text.includes('urgent') || text.includes('freezing') || text.includes('82°f') || text.includes('85°f')) {
      return {
        priority: 'High',
        urgencyScore: 8,
        deadlineDetected: hasDeadline ? 'Time-sensitive deadline or active environmental issue' : null,
        impactScope: text.includes('library') || text.includes('hall') ? 'Group' : 'Individual',
        reason: 'Time-sensitive deadline, academic examination impact, or active leak/temperature failure identified.'
      };
    }

    // Low checks
    if (text.includes('general') || text.includes('how to') || text.includes('question') || text.includes('suggestion') || text.includes('hours') || text.includes('inquiry')) {
      return {
        priority: 'Low',
        urgencyScore: 2,
        deadlineDetected: null,
        impactScope: 'Individual',
        reason: 'General inquiry or standard administrative question without critical time dependencies.'
      };
    }

    // Default Medium
    return {
      priority: 'Medium',
      urgencyScore: 5,
      deadlineDetected: null,
      impactScope: 'Individual',
      reason: 'Standard university service request with normal resolution timeline.'
    };
  }
}

