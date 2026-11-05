import { BaseAgent } from './baseAgent.js';

const SYSTEM_INSTRUCTION = `You are the University Classification Agent.
Your responsibility is to analyze a student's helpdesk request and classify it accurately into the university's official complaint taxonomy.

OFFICIAL CATEGORIES:
- IT & Network Support (Wi-Fi, eduroam, campus portals, LMS, email, passwords, classroom AV, printers)
- Facilities & Maintenance (leaks, plumbing, lighting, power outages, elevators, HVAC in academic buildings)
- Academic & Registrar (grades, course registration, transcripts, holds, degree audits, graduation)
- Dormitory & Housing (dorm room repairs, room temperature, furniture, roommate conflicts, dorm facilities)
- Library & Study Spaces (study room bookings, quiet floors, library computers, book loans, noise)
- Campus Safety & Security (lost & found, suspicious activity, emergency escorts, door locks, access badges)
- Financial Aid & Billing (tuition fees, FAFSA, scholarship disbursements, late fee appeals)
- General Inquiry (campus events, dining hall hours, parking permits, visitor info)

PRIMARY NATURES:
- Technical
- Academic
- Financial
- Facility
- Administrative

Instructions:
1. Examine the user's issue text and location.
2. Pick the single best category and primary nature.
3. Determine if it constitutes an immediate emergency (e.g., active flooding, electrical hazards, gas smell, physical danger).
4. Return structured JSON only.`;

const SCHEMA = `{
  "category": "One of the 8 official categories",
  "nature": "Technical | Academic | Financial | Facility | Administrative",
  "subCategory": "Specific sub-domain (e.g. Wi-Fi Outage, Transcript Hold, AC Repair)",
  "isEmergency": false,
  "confidence": 0.95,
  "summary": "One sentence summary of the issue"
}`;

export class ClassificationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Classification Agent',
      role: 'Complaint Categorization & Nature Classifier',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  async fallbackRuleEngine(input) {
    const text = (typeof input === 'string' ? input : input.problemDescription || input.description || input.title || '').toLowerCase();

    if (text.includes('wifi') || text.includes('wi-fi') || text.includes('network') || text.includes('internet') || text.includes('login') || text.includes('projector') || text.includes('printer')) {
      return {
        category: 'IT & Network Support',
        nature: 'Technical',
        subCategory: text.includes('wifi') || text.includes('internet') ? 'Campus Wi-Fi Connectivity' : 'Hardware & AV Support',
        isEmergency: false,
        confidence: 0.94,
        summary: 'Student experiencing IT network or hardware difficulties.'
      };
    }

    if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('sink') || text.includes('drain') || text.includes('flood') || text.includes('electric') || text.includes('light')) {
      return {
        category: 'Facilities & Maintenance',
        nature: 'Facility',
        subCategory: 'Plumbing & Physical Plant',
        isEmergency: text.includes('flood') || text.includes('overflow') || text.includes('spark'),
        confidence: 0.96,
        summary: 'Facility maintenance incident regarding plumbing or physical infrastructure.'
      };
    }

    if (text.includes('dorm') || text.includes('room') || text.includes('hvac') || text.includes('ac') || text.includes('heater') || text.includes('housing') || text.includes('residence')) {
      return {
        category: 'Dormitory & Housing',
        nature: 'Facility',
        subCategory: 'Dorm Room Climate & Living Spaces',
        isEmergency: false,
        confidence: 0.92,
        summary: 'Housing and residence hall environmental comfort issue.'
      };
    }

    if (text.includes('transcript') || text.includes('grade') || text.includes('class') || text.includes('course') || text.includes('registrar') || text.includes('graduate')) {
      return {
        category: 'Academic & Registrar',
        nature: 'Academic',
        subCategory: 'Registrar Records & Transcripts',
        isEmergency: false,
        confidence: 0.95,
        summary: 'Academic records or registrar processing request.'
      };
    }

    if (text.includes('tuition') || text.includes('fee') || text.includes('financial aid') || text.includes('scholarship') || text.includes('billing') || text.includes('bursar') || text.includes('fafsa')) {
      return {
        category: 'Financial Aid & Billing',
        nature: 'Financial',
        subCategory: 'Tuition Billing & Financial Aid',
        isEmergency: false,
        confidence: 0.93,
        summary: 'Student billing or financial aid disbursement inquiry.'
      };
    }

    if (text.includes('safety') || text.includes('card') || text.includes('badge') || text.includes('rfid') || text.includes('stolen') || text.includes('lock') || text.includes('locked')) {
      return {
        category: 'Campus Safety & Security',
        nature: 'Administrative',
        subCategory: 'Access Control & Campus Security',
        isEmergency: text.includes('danger') || text.includes('assault'),
        confidence: 0.91,
        summary: 'Campus security or physical access control issue.'
      };
    }

    if (text.includes('library') || text.includes('study') || text.includes('book') || text.includes('quiet')) {
      return {
        category: 'Library & Study Spaces',
        nature: 'Facility',
        subCategory: 'Library Facilities & Study Areas',
        isEmergency: false,
        confidence: 0.90,
        summary: 'Library facility or study reservation issue.'
      };
    }

    return {
      category: 'General Inquiry',
      nature: 'Administrative',
      subCategory: 'General Student Support',
      isEmergency: false,
      confidence: 0.80,
      summary: 'General campus inquiry requiring triage.'
    };
  }
}
