import { BaseAgent } from './baseAgent.js';
import { VERIFIED_FAQS } from '../data/universityKB.js';

const SYSTEM_INSTRUCTION = `You are the University Resolution & Troubleshooting Agent.
Your responsibility is to suggest verified, step-by-step troubleshooting solutions grounded strictly in verified university IT runbooks, facility protocols, and student policies.

CRITICAL RULES:
- NEVER invent or hallucinate university hotlines, procedures, or software.
- ONLY cite verified steps and policies from the university knowledge base.
- If an issue requires licensed technicians (e.g. plumbing repairs, electrical work, high-voltage projector ceiling mounts), clearly instruct the student NOT to attempt physical disassembly.
- State whether the student can likely resolve this themselves or if technician intervention is mandatory.`;

const SCHEMA = `{
  "troubleshootingSteps": ["Step 1...", "Step 2...", "Step 3..."],
  "canSelfResolve": true,
  "estimatedSelfResolutionMinutes": 5,
  "officialPolicyReference": "Official university policy statement",
  "technicianInterventionRequired": false,
  "safetyWarning": "string or null"
}`;

export class ResolutionAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Resolution Agent',
      role: 'Verified Knowledge Base & Troubleshooting Specialist',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  async run(input, context = {}) {
    // Inject verified knowledge base into the prompt context for Gemini
    const enrichedInput = {
      studentIssue: input,
      verifiedKnowledgeBase: VERIFIED_FAQS
    };
    return super.run(enrichedInput, context);
  }

  async fallbackRuleEngine(input) {
    const raw = typeof input === 'string' ? input : (input.studentIssue || input.problemDescription || input.description || input.title || '');
    const text = (typeof raw === 'string' ? raw : JSON.stringify(raw)).toLowerCase();

    // Match best FAQ from VERIFIED_FAQS
    let bestFaq = null;
    let highestScore = 0;

    for (const faq of VERIFIED_FAQS) {
      let score = 0;
      for (const kw of faq.keywords) {
        if (text.includes(kw)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaq) {
      return {
        troubleshootingSteps: bestFaq.verifiedSteps,
        canSelfResolve: bestFaq.canSelfResolve,
        estimatedSelfResolutionMinutes: bestFaq.canSelfResolve ? 10 : 0,
        officialPolicyReference: bestFaq.officialPolicy,
        technicianInterventionRequired: !bestFaq.canSelfResolve,
        safetyWarning: !bestFaq.canSelfResolve ? 'Do not attempt to open ceiling panels, modify pipe valves under pressure, or alter electrical breaker panels.' : null
      };
    }

    // Default safe response
    return {
      troubleshootingSteps: [
        'Check your student portal account for any active service alerts or campus-wide maintenance notices.',
        'Document the exact building name, room number, and time the issue was observed.',
        'Submit a formal helpdesk ticket so the appropriate campus support team can be dispatched.'
      ],
      canSelfResolve: false,
      estimatedSelfResolutionMinutes: 0,
      officialPolicyReference: 'Campus Helpdesk guarantees standard response within designated departmental SLAs.',
      technicianInterventionRequired: true,
      safetyWarning: null
    };
  }
}

