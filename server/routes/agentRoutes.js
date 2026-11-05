import { Router } from 'express';
import { orchestrator } from '../orchestrator/multiAgentWorkflow.js';
import { db } from '../data/store.js';
import { gemini } from '../config/gemini.js';
import { requireStudentAuth } from '../middleware/auth.js';
import { sanitizeAndProtect } from '../middleware/security.js';

const router = Router();

// Analyze student problem through Multi-Agent Workflow
router.post('/analyze', requireStudentAuth, sanitizeAndProtect, async (req, res) => {
  const { problemDescription, location, title } = req.body;

  if (!problemDescription || problemDescription.trim().length < 5) {
    return res.status(400).json({
      error: 'DESCRIPTION_TOO_SHORT',
      message: 'Please provide at least 5 characters describing the issue.'
    });
  }

  try {
    const workflowResult = await orchestrator.executeWorkflow({
      problemDescription,
      studentProfile: req.student,
      location,
      title
    });

    res.json({
      success: true,
      ...workflowResult
    });
  } catch (err) {
    console.error('Multi-agent workflow error:', err);
    res.status(500).json({
      error: 'WORKFLOW_ERROR',
      message: err.message
    });
  }
});

// Consequential Action Gate: Student confirms creation of the official complaint
router.post('/confirm-and-create', requireStudentAuth, (req, res) => {
  const { studentConfirmed, complaintDraft } = req.body;

  if (!studentConfirmed) {
    return res.status(400).json({
      error: 'CONFIRMATION_REQUIRED',
      message: 'Student confirmation is mandatory before creating a formal complaint.'
    });
  }

  if (!complaintDraft || !complaintDraft.title || !complaintDraft.description) {
    return res.status(400).json({
      error: 'INVALID_DRAFT',
      message: 'Valid complaint draft payload is required.'
    });
  }

  try {
    const createdComplaint = db.createComplaint({
      title: complaintDraft.title,
      description: complaintDraft.description,
      category: complaintDraft.category,
      priority: complaintDraft.priority,
      department: complaintDraft.department,
      location: complaintDraft.location,
      requesterName: req.student.fullName,
      requesterEmail: req.student.email,
      requesterRole: req.student.role,
      studentId: req.student.studentId,
      aiAnalysisRef: complaintDraft.aiAnalysisRef
    });

    res.status(201).json({
      success: true,
      message: 'Official university complaint created following AI assessment and student confirmation.',
      complaintId: createdComplaint.id,
      complaint: createdComplaint
    });
  } catch (err) {
    if (err.message.startsWith('DUPLICATE_SUBMISSION')) {
      return res.status(409).json({
        error: 'DUPLICATE_SUBMISSION',
        message: err.message
      });
    }
    res.status(500).json({
      error: 'SUBMISSION_FAILED',
      message: err.message
    });
  }
});

// Live Agent Activity & Health
router.get('/status', (req, res) => {
  res.json({
    agents: orchestrator.getAgentsStatus(),
    geminiMetrics: gemini.getMetrics(),
    timestamp: new Date().toISOString()
  });
});

// Real workflow execution history
router.get('/workflows', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  res.json({
    workflows: db.getWorkflowTraces(limit)
  });
});

// Security & Action Audit Logs
router.get('/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  res.json({
    auditLogs: db.getAuditLogs(limit)
  });
});

export default router;

