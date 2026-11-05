import { Router } from 'express';
import { db } from '../data/store.js';
import { requireStudentAuth, requireStaffAuth } from '../middleware/auth.js';
import { sanitizeAndProtect } from '../middleware/security.js';

const router = Router();

// Retrieve authenticated student complaint history
router.get('/', requireStudentAuth, (req, res) => {
  const complaints = db.getComplaintsForStudent(req.student);
  res.json({
    student: req.student.fullName,
    total: complaints.length,
    complaints
  });
});

// Check complaint status by ID (with student authorization check)
router.get('/:id', requireStudentAuth, (req, res) => {
  const result = db.getComplaintById(req.params.id, req.student);
  if (!result) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: `Complaint ticket "${req.params.id}" not found.`
    });
  }

  if (result.error === 'FORBIDDEN') {
    return res.status(403).json(result);
  }

  res.json({ complaint: result });
});

// Create a new complaint (with duplicate check & input sanitization)
router.post('/', requireStudentAuth, sanitizeAndProtect, (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    department,
    location,
    aiAnalysisRef
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: 'VALIDATION_FAILED',
      message: 'Title and detailed description are required fields.'
    });
  }

  try {
    const newComplaint = db.createComplaint({
      title,
      description,
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      department: department || category || 'General Inquiry',
      location: location || 'Campus',
      requesterName: req.student.fullName,
      requesterEmail: req.student.email,
      requesterRole: req.student.role,
      studentId: req.student.studentId,
      aiAnalysisRef
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintId: newComplaint.id,
      complaint: newComplaint
    });
  } catch (err) {
    if (err.message.startsWith('DUPLICATE_SUBMISSION')) {
      return res.status(409).json({
        error: 'DUPLICATE_SUBMISSION',
        message: err.message
      });
    }
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: err.message
    });
  }
});

// Update complaint status (Staff only)
router.patch('/:id/status', requireStaffAuth, (req, res) => {
  const { status, notes } = req.body;
  if (!status) {
    return res.status(400).json({
      error: 'MISSING_STATUS',
      message: 'New status is required.'
    });
  }

  const updated = db.updateComplaintStatus(req.params.id, status, req.student.fullName, notes);
  if (!updated) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: `Complaint ticket "${req.params.id}" not found.`
    });
  }

  res.json({
    message: `Ticket ${req.params.id} updated to ${status}`,
    complaint: updated
  });
});

export default router;

