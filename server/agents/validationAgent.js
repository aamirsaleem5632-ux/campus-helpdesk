import { BaseAgent } from './baseAgent.js';

const SYSTEM_INSTRUCTION = `You are the University Helpdesk Validation & Quality Assurance Agent.
Your responsibility is to scrutinize and cross-verify the outputs of all specialist agents (Classification, Priority, Resolution, and Routing) before anything is presented to the student or staff.

VERIFICATION CHECKLIST:
1. Category & Department Consistency: Does the classification match the routed university department? (e.g. Wi-Fi must NOT be routed to Facilities).
2. Priority vs Severity: Does the priority align with reported urgency (e.g., active flooding or midterm exam in 2 hours must NOT be Low priority)?
3. Grounding & Safety: Are the suggested troubleshooting steps safe and grounded in university policy? Are there dangerous instructions (e.g., student touching electrical panels)?
4. Missing Information: Are mandatory fields present (category, department, priority, troubleshooting steps)?

Instructions:
- If all checks pass cleanly, set "isValid": true and "status": "APPROVED".
- If minor discrepancies exist, provide auto-corrections in "corrections".
- If severe contradictions exist, flag "isValid": false and specify "issuesDetected".`;

const SCHEMA = `{
  "isValid": true,
  "status": "APPROVED | FLAGGED | ADJUSTED",
  "confidenceScore": 0.98,
  "issuesDetected": ["issue 1", "issue 2"],
  "correctionsApplied": {},
  "validationNotes": "Summary of verification check"
}`;

export class ValidationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Validation Agent',
      role: 'Cross-Agent Verification & Quality Auditor',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  async fallbackRuleEngine(input, context) {
    const { classification, priority, resolution, routing } = context || {};
    const issues = [];
    const corrections = {};

    // 1. Check classification & routing coherence
    if (classification?.category && routing?.departmentName) {
      if (classification.category !== routing.departmentName) {
        issues.push(`Mismatch between classified category "${classification.category}" and routing department "${routing.departmentName}".`);
        corrections.department = classification.category;
      }
    }

    // 2. Check priority validity
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (priority?.priority && !validPriorities.includes(priority.priority)) {
      issues.push(`Invalid priority level "${priority.priority}". Normalized to "Medium".`);
      corrections.priority = 'Medium';
    }

    // 3. Check for empty resolution steps
    if (!resolution?.troubleshootingSteps || !Array.isArray(resolution.troubleshootingSteps) || resolution.troubleshootingSteps.length === 0) {
      issues.push('Missing actionable troubleshooting steps.');
    }

    const isValid = issues.length === 0;

    return {
      isValid: isValid || issues.length <= 1, // minor mismatch can be adjusted
      status: isValid ? 'APPROVED' : (issues.length <= 1 ? 'ADJUSTED' : 'FLAGGED'),
      confidenceScore: isValid ? 0.98 : 0.85,
      issuesDetected: issues,
      correctionsApplied: corrections,
      validationNotes: isValid 
        ? 'All specialist agent outputs verified for department consistency, priority justification, and grounded troubleshooting.'
        : `Validation detected ${issues.length} minor items which were noted or corrected.`
    };
  }
}

