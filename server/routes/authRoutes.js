import { Router } from 'express';
import { db } from '../data/store.js';
import { requireStudentAuth } from '../middleware/auth.js';

const router = Router();

// List available student profiles
router.get('/students', (req, res) => {
  res.json({
    students: db.getAllStudents()
  });
});

// Authenticate student by email or ID
router.post('/login', (req, res) => {
  const { email, studentId } = req.body;
  let student = null;

  if (email) {
    student = db.findStudentByEmail(email);
  } else if (studentId) {
    student = db.students.find(s => s.studentId === studentId);
  }

  if (!student) {
    return res.status(404).json({
      error: 'STUDENT_NOT_FOUND',
      message: 'Student record not found. Please check your university email or student ID.'
    });
  }

  res.json({
    message: 'Authentication successful',
    student: {
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      department: student.department
    },
    token: student.token
  });
});

// Current user profile
router.get('/me', requireStudentAuth, (req, res) => {
  res.json({
    student: req.student
  });
});

export default router;

