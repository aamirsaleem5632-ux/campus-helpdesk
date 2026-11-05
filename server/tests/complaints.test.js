import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../data/store.js';

describe('University Helpdesk Data Store & Security', () => {

  test('Student isolation: Students can only view their own complaints', () => {
    const studentSarah = db.findStudentByEmail('sarah.j@campus.edu');
    const studentLiam = db.findStudentByEmail('l.patterson@campus.edu');

    // Sarah's complaints
    const sarahComplaints = db.getComplaintsForStudent(studentSarah);
    for (const c of sarahComplaints) {
      assert.equal(c.studentId, studentSarah.studentId);
    }

    // Liam trying to access Sarah's ticket directly
    const unauthorizedAccess = db.getComplaintById('CHD-2026-1001', studentLiam);
    assert.equal(unauthorizedAccess.error, 'FORBIDDEN');

    // Sarah accessing her own ticket
    const authorizedAccess = db.getComplaintById('CHD-2026-1001', studentSarah);
    assert.equal(authorizedAccess.id, 'CHD-2026-1001');
  });

  test('Complaint creation generates valid CHD-YYYY-XXXX ticket ID and audit log', () => {
    const complaint = db.createComplaint({
      title: 'Lab computer #4 mouse not responding',
      description: 'Optical mouse optical laser is unlit and unresponsive on PC 4',
      category: 'IT & Network Support',
      priority: 'Low',
      department: 'IT & Network Support',
      location: 'Science Hall 101',
      requesterName: 'Sarah Jenkins',
      requesterEmail: 'sarah.j@campus.edu',
      requesterRole: 'Undergraduate Student',
      studentId: 'STU-94021'
    });

    assert.ok(complaint.id.startsWith(`CHD-${new Date().getFullYear()}-`));
    assert.equal(complaint.status, 'Pending');

    // Check audit trail
    const auditLogs = db.getAuditLogs(5);
    const found = auditLogs.find(a => a.targetId === complaint.id);
    assert.ok(found);
    assert.equal(found.action, 'COMPLAINT_CREATED');
  });

  test('Duplicate submission prevention blocks identical submission within 5 minutes', () => {
    // Attempt duplicate of the same title, location, and student
    assert.throws(() => {
      db.createComplaint({
        title: 'Lab computer #4 mouse not responding',
        description: 'Trying to submit again immediately',
        category: 'IT & Network Support',
        priority: 'Low',
        department: 'IT & Network Support',
        location: 'Science Hall 101',
        requesterName: 'Sarah Jenkins',
        requesterEmail: 'sarah.j@campus.edu',
        requesterRole: 'Undergraduate Student',
        studentId: 'STU-94021'
      });
    }, /DUPLICATE_SUBMISSION/);
  });
});

