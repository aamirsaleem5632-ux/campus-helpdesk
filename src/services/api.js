/**
 * University Helpdesk API Client
 * Connects frontend to the Node.js multi-agent backend.
 */

const API_BASE = '/api';

export const apiClient = {
  // Auth
  async getStudents() {
    try {
      const res = await fetch(`${API_BASE}/auth/students`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return await res.json();
    } catch (err) {
      console.warn('API getStudents offline, fallback to local', err);
      return null;
    }
  },

  async login(emailOrId) {
    const payload = emailOrId.includes('@') ? { email: emailOrId } : { studentId: emailOrId };
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Authentication failed');
    }
    return await res.json();
  },

  // Complaints
  async getComplaints(studentToken, studentEmail, studentId) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;
    if (studentId) headers['x-student-id'] = studentId;

    const res = await fetch(`${API_BASE}/complaints`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch complaints: ${res.statusText}`);
    return await res.json();
  },

  async getComplaintById(id, studentToken, studentEmail, studentId) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;
    if (studentId) headers['x-student-id'] = studentId;

    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve complaint');
    }
    return await res.json();
  },

  async createComplaint(payload, studentToken, studentEmail, studentId) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;
    if (studentId) headers['x-student-id'] = studentId;

    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create complaint');
    }
    return await res.json();
  },

  async updateComplaintStatus(id, status, notes, studentToken, studentEmail) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;

    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update complaint status');
    }
    return await res.json();
  },

  // Multi-Agent System
  async analyzeWithAgents({ problemDescription, location, title, studentToken, studentEmail, studentId }) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;
    if (studentId) headers['x-student-id'] = studentId;

    const res = await fetch(`${API_BASE}/agents/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ problemDescription, location, title })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Agent analysis request failed');
    }
    return await res.json();
  },

  async confirmAndCreateComplaint({ complaintDraft, studentToken, studentEmail, studentId }) {
    const headers = { 'Content-Type': 'application/json' };
    if (studentToken) headers['Authorization'] = `Bearer ${studentToken}`;
    if (studentEmail) headers['x-student-email'] = studentEmail;
    if (studentId) headers['x-student-id'] = studentId;

    const res = await fetch(`${API_BASE}/agents/confirm-and-create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studentConfirmed: true,
        complaintDraft
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to confirm and create complaint');
    }
    return await res.json();
  },

  async getAgentStatus() {
    const res = await fetch(`${API_BASE}/agents/status`);
    if (!res.ok) throw new Error('Failed to fetch agent status');
    return await res.json();
  },

  async getWorkflowTraces(limit = 20) {
    const res = await fetch(`${API_BASE}/agents/workflows?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch workflow traces');
    return await res.json();
  },

  async getAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/agents/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  }
};

