import { BaseAgent } from './baseAgent.js';
import { UNIVERSITY_DEPARTMENTS } from '../data/universityKB.js';

const SYSTEM_INSTRUCTION = `You are the University Department Routing Agent.
Your responsibility is to route student issues to the exact campus department and specialist support team.

OFFICIAL CAMPUS DEPARTMENTS:
${JSON.stringify(UNIVERSITY_DEPARTMENTS, null, 2)}

Instructions:
1. Match the classified nature and location to the single most appropriate department.
2. Select the specific support team (e.g. Network Infrastructure, Physical Plant, Registrar Records, Residence Life Maintenance).
3. State the official response SLA in hours.
4. Provide the contact email, building location, and escalation pathway.`;

const SCHEMA = `{
  "departmentName": "Official Department Name",
  "supportTeam": "Specialist Support Team",
  "building": "Campus Building & Room",
  "contactEmail": "department@campus.edu",
  "contactPhone": "(555) 019-XXXX",
  "slaHours": 4,
  "escalationContact": "Official Title"
}`;

export class RoutingAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Routing Agent',
      role: 'Campus Department & Dispatch Router',
      systemInstruction: SYSTEM_INSTRUCTION,
      schemaDescription: SCHEMA
    });
  }

  async run(input, context = {}) {
    const enrichedInput = {
      studentIssue: input,
      officialDepartments: UNIVERSITY_DEPARTMENTS
    };
    return super.run(enrichedInput, context);
  }

  async fallbackRuleEngine(input, context) {
    const raw = typeof input === 'string' ? input : (input.studentIssue || input.problemDescription || input.description || input.title || '');
    const text = (typeof raw === 'string' ? raw : JSON.stringify(raw)).toLowerCase();

    // Check context from classification agent if available
    const category = context?.classification?.category;

    let matchedDept = null;

    if (category) {
      matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.category.toLowerCase() === category.toLowerCase());
    }

    if (!matchedDept) {
      if (text.includes('wifi') || text.includes('network') || text.includes('projector') || text.includes('printer') || text.includes('portal')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'it-support');
      } else if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('flood') || text.includes('light')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'facilities-maintenance');
      } else if (text.includes('dorm') || text.includes('hvac') || text.includes('room') || text.includes('ac')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'housing-reslife');
      } else if (text.includes('transcript') || text.includes('grade') || text.includes('registrar')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'academic-registrar');
      } else if (text.includes('tuition') || text.includes('aid') || text.includes('fee') || text.includes('bursar')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'financial-aid');
      } else if (text.includes('card') || text.includes('safety') || text.includes('lock') || text.includes('rfid')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'campus-safety');
      } else if (text.includes('library') || text.includes('study')) {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'library-spaces');
      } else {
        matchedDept = UNIVERSITY_DEPARTMENTS.find(d => d.id === 'general-inquiry');
      }
    }

    return {
      departmentName: matchedDept.name,
      supportTeam: matchedDept.team,
      building: matchedDept.building,
      contactEmail: matchedDept.email,
      contactPhone: matchedDept.phone,
      slaHours: matchedDept.slaHours,
      escalationContact: matchedDept.escalationContact
    };
  }
}

