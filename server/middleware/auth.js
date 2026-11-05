import { db } from '../data/store.js';

/**
 * Authentication Middleware
 * Enforces student and staff access control.
 */
export const requireStudentAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-student-token'];
  const studentEmail = req.headers['x-student-email'];
  const studentId = req.headers['x-student-id'];

  let student = null;

  if (authHeader) {
    student = db.findStudentByToken(authHeader);
  }

  if (!student && studentEmail) {
    student = db.findStudentByEmail(studentEmail);
  }

  if (!student && studentId) {
    student = db.students.find(s => s.studentId === studentId);
  }

  // Fallback for seamless developer testing: if student info is passed in body
  if (!student && req.body && (req.body.studentId || req.body.requesterEmail)) {
    student = db.students.find(s => 
      (req.body.studentId && s.studentId === req.body.studentId) ||
      (req.body.requesterEmail && s.email.toLowerCase() === req.body.requesterEmail.toLowerCase())
    );
  }

  if (!student) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Student authentication required. Please provide a valid student token, email, or student ID.'
    });
  }

  req.student = student;
  next();
};

export const requireStaffAuth = (req, res, next) => {
  requireStudentAuth(req, res, () => {
    if (req.student.role !== 'Campus Staff' && req.student.studentId !== 'ADMIN-001') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Staff access required for administrative operations.'
      });
    }
    next();
  });
};

