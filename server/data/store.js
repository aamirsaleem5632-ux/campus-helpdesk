import crypto from 'crypto';

/**
 * In-Memory & File-Synchronized University Data Store
 * Preserves all pre-existing tickets, student profiles, and audit records.
 */

export const INITIAL_STUDENTS = [
  {
    studentId: 'STU-94021',
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@campus.edu',
    role: 'Undergraduate Student',
    department: 'Computer Science',
    token: 'token-sarah-jenkins-stu94021'
  },
  {
    studentId: 'STU-65823',
    fullName: 'Liam Patterson',
    email: 'l.patterson@campus.edu',
    role: 'Undergraduate Student',
    department: 'Business Administration',
    token: 'token-liam-patterson-stu65823'
  },
  {
    studentId: 'STU-2026-8002',
    fullName: 'Alex Morgan',
    email: 'alex@campus.edu',
    role: 'Undergraduate Student',
    department: 'Mechanical Engineering',
    token: 'token-alex-morgan-stu8002'
  },
  {
    studentId: 'STU-78210',
    fullName: 'Maya Patel',
    email: 'm.patel@campus.edu',
    role: 'Undergraduate Student',
    department: 'Environmental Science',
    token: 'token-maya-patel-stu78210'
  },
  {
    studentId: 'STU-51209',
    fullName: 'Kevin Zhao',
    email: 'k.zhao@campus.edu',
    role: 'Graduate Student',
    department: 'Chemistry',
    token: 'token-kevin-zhao-stu51209'
  },
  {
    studentId: 'FAC-4102',
    fullName: 'Dr. Robert Martinez',
    email: 'r.martinez@campus.edu',
    role: 'Faculty Member',
    department: 'Chemistry & Biochemistry',
    token: 'token-robert-martinez-fac4102'
  },
  {
    studentId: 'ADMIN-001',
    fullName: 'Campus Helpdesk Supervisor',
    email: 'admin@campus.edu',
    role: 'Campus Staff',
    department: 'IT Operations',
    token: 'token-admin-supervisor-001'
  }
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'CHD-2026-1001',
    title: 'Wi-Fi disconnecting intermittently in Library 2nd Floor',
    description: 'Students on the north side of the 2nd-floor library experience frequent dropped connections to campus Wi-Fi every 10 minutes while streaming lectures.',
    category: 'IT & Network Support',
    priority: 'High',
    status: 'In Progress',
    department: 'IT & Network Support',
    assignedTo: 'Marcus Chen (Network Infrastructure)',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sarah.j@campus.edu',
    requesterRole: 'Undergraduate Student',
    studentId: 'STU-94021',
    location: 'Main Library, 2nd Floor North Study Area',
    createdAt: '2026-10-15T09:15:00.000Z',
    updatedAt: '2026-10-16T11:30:00.000Z',
    resolutionNotes: 'Technician dispatched to replace the wireless access point AP-L2-N. Channel interference also addressed.',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-15T09:15:00.000Z',
        action: 'Ticket Created',
        by: 'Sarah Jenkins',
        note: 'Issue reported online via student portal'
      },
      {
        id: 't-2',
        date: '2026-10-15T10:45:00.000Z',
        action: 'Status changed to In Progress',
        by: 'IT Dispatch',
        note: 'Assigned to Network Infrastructure team'
      }
    ]
  },
  {
    id: 'CHD-2026-1002',
    title: 'Water leak under sink in Science Hall Room 304',
    description: 'Constant dripping water under chemistry lab sink #3. Basin is filling up with water and could cause floor water damage if not repaired quickly.',
    category: 'Facilities & Maintenance',
    priority: 'Urgent',
    status: 'Pending',
    department: 'Facilities & Maintenance',
    assignedTo: 'Unassigned',
    requesterName: 'Dr. Robert Martinez',
    requesterEmail: 'r.martinez@campus.edu',
    requesterRole: 'Faculty Member',
    studentId: 'FAC-4102',
    location: 'Science Hall, Room 304 (Organic Chem Lab)',
    createdAt: '2026-10-17T08:20:00.000Z',
    updatedAt: '2026-10-17T08:20:00.000Z',
    resolutionNotes: '',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-17T08:20:00.000Z',
        action: 'Ticket Created',
        by: 'Dr. Robert Martinez',
        note: 'High priority plumbing ticket submitted'
      }
    ]
  },
  {
    id: 'CHD-2026-1003',
    title: 'Transcript request not updating on Student Portal',
    description: 'Submitted graduation transcript order last Tuesday but status remains in processing with no tracking number generated.',
    category: 'Academic & Registrar',
    priority: 'Medium',
    status: 'Resolved',
    department: 'Academic & Registrar',
    assignedTo: 'Elena Rostova (Registrar Office)',
    requesterName: 'Liam Patterson',
    requesterEmail: 'l.patterson@campus.edu',
    requesterRole: 'Undergraduate Student',
    studentId: 'STU-65823',
    location: 'Administration Building / Online',
    createdAt: '2026-10-12T14:00:00.000Z',
    updatedAt: '2026-10-14T16:45:00.000Z',
    resolutionNotes: 'Order cleared manual hold. Electronic certified transcript dispatched to requested recipient email on Oct 14.',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-12T14:00:00.000Z',
        action: 'Ticket Created',
        by: 'Liam Patterson',
        note: 'Inquiry submitted'
      },
      {
        id: 't-2',
        date: '2026-10-14T16:45:00.000Z',
        action: 'Status changed to Resolved',
        by: 'Elena Rostova',
        note: 'Transcript dispatched'
      }
    ]
  }
];

class UniversityStore {
  constructor() {
    this.students = [...INITIAL_STUDENTS];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.workflowTraces = [];
    this.auditLogs = [];
    this.recentSubmissionHashes = new Map(); // hash -> timestamp
  }

  // Auth & Student Lookup
  findStudentByToken(token) {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return this.students.find(s => s.token === cleanToken || s.email === cleanToken) || null;
  }

  findStudentByEmail(email) {
    if (!email) return null;
    return this.students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getAllStudents() {
    return this.students.map(({ token: _token, ...rest }) => rest);
  }

  // Complaint Management
  getComplaintsForStudent(student) {
    if (!student) return [];
    if (student.role === 'Campus Staff' || student.studentId === 'ADMIN-001') {
      return [...this.complaints];
    }
    return this.complaints.filter(c => 
      c.studentId === student.studentId || 
      c.requesterEmail.toLowerCase() === student.email.toLowerCase()
    );
  }

  getComplaintById(id, student) {
    const complaint = this.complaints.find(c => c.id.toLowerCase() === (id || '').toLowerCase());
    if (!complaint) return null;

    // Security check: Student can only view their own complaint unless admin
    if (student && student.role !== 'Campus Staff' && student.studentId !== 'ADMIN-001') {
      if (complaint.studentId !== student.studentId && 
          complaint.requesterEmail.toLowerCase() !== student.email.toLowerCase()) {
        return { error: 'FORBIDDEN', message: 'You do not have permission to access this complaint.' };
      }
    }
    return complaint;
  }

  // Duplicate Check
  isDuplicateSubmission(studentId, title, location) {
    const raw = `${studentId}:${(title || '').trim().toLowerCase()}:${(location || '').trim().toLowerCase()}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const now = Date.now();
    const existingTime = this.recentSubmissionHashes.get(hash);

    if (existingTime && (now - existingTime < 5 * 60 * 1000)) { // 5-minute guard
      return true;
    }
    this.recentSubmissionHashes.set(hash, now);
    return false;
  }

  // Create Complaint
  createComplaint({
    title,
    description,
    category,
    priority,
    department,
    location,
    requesterName,
    requesterEmail,
    requesterRole,
    studentId,
    aiAnalysisRef = null
  }) {
    if (this.isDuplicateSubmission(studentId, title, location)) {
      throw new Error('DUPLICATE_SUBMISSION: An identical ticket was already submitted in the last 5 minutes.');
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `CHD-${currentYear}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const newComplaint = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      status: 'Pending',
      department: department || category || 'General Inquiry',
      assignedTo: 'Unassigned',
      requesterName: requesterName.trim(),
      requesterEmail: requesterEmail.trim(),
      requesterRole: requesterRole || 'Undergraduate Student',
      studentId: studentId.trim(),
      location: (location || 'Campus').trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
      resolutionNotes: '',
      aiAnalysisRef,
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: nowIso,
          action: 'Ticket Created',
          by: requesterName,
          note: aiAnalysisRef ? 'Created via AI Multi-Agent Assisted Workflow' : 'Direct student portal submission'
        }
      ]
    };

    this.complaints.unshift(newComplaint);

    this.logAudit({
      action: 'COMPLAINT_CREATED',
      actor: requesterEmail,
      targetId: newId,
      details: { title, priority, department, aiAssisted: !!aiAnalysisRef }
    });

    return newComplaint;
  }

  // Update Status
  updateComplaintStatus(id, newStatus, staffName = 'Helpdesk Admin', notes = '') {
    const complaint = this.complaints.find(c => c.id.toLowerCase() === id.toLowerCase());
    if (!complaint) return null;

    const nowIso = new Date().toISOString();
    complaint.status = newStatus;
    complaint.updatedAt = nowIso;
    if (notes) {
      complaint.resolutionNotes = notes;
    }

    complaint.timeline.push({
      id: `t-${Date.now()}`,
      date: nowIso,
      action: `Status changed to ${newStatus}`,
      by: staffName,
      note: notes || `Status updated via Admin Dashboard`
    });

    this.logAudit({
      action: 'STATUS_UPDATED',
      actor: staffName,
      targetId: id,
      details: { newStatus, notes }
    });

    return complaint;
  }

  // Workflow Tracing for Multi-Agent Dashboard
  recordWorkflowTrace(trace) {
    const enrichedTrace = {
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...trace
    };
    this.workflowTraces.unshift(enrichedTrace);
    if (this.workflowTraces.length > 50) {
      this.workflowTraces.pop(); // keep last 50 traces
    }
    return enrichedTrace;
  }

  getWorkflowTraces(limit = 20) {
    return this.workflowTraces.slice(0, limit);
  }

  // Audit Logging
  logAudit({ action, actor, targetId, details }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      targetId,
      details
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return entry;
  }

  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
}

export const db = new UniversityStore();
