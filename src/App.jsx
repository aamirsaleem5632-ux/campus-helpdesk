import { useState, useEffect, useCallback } from 'react';
import AIAssistantModal from './components/AIAssistantModal';
import AgentActivitySection from './components/AgentActivitySection';
import { apiClient } from './services/api';

const DEMO_STUDENTS = [
  { studentId: 'STU-94021', fullName: 'Sarah Jenkins', email: 'sarah.j@campus.edu', role: 'Undergraduate Student', department: 'Computer Science', token: 'token-sarah-jenkins-stu94021' },
  { studentId: 'STU-65823', fullName: 'Liam Patterson', email: 'l.patterson@campus.edu', role: 'Undergraduate Student', department: 'Business Admin', token: 'token-liam-patterson-stu65823' },
  { studentId: 'STU-2026-8002', fullName: 'Alex Morgan', email: 'alex@campus.edu', role: 'Undergraduate Student', department: 'Mechanical Engineering', token: 'token-alex-morgan-stu8002' },
  { studentId: 'STU-78210', fullName: 'Maya Patel', email: 'm.patel@campus.edu', role: 'Undergraduate Student', department: 'Environmental Science', token: 'token-maya-patel-stu78210' },
  { studentId: 'FAC-4102', fullName: 'Dr. Robert Martinez', email: 'r.martinez@campus.edu', role: 'Faculty Member', department: 'Chemistry', token: 'token-robert-martinez-fac4102' },
  { studentId: 'ADMIN-001', fullName: 'Campus Helpdesk Supervisor', email: 'admin@campus.edu', role: 'Campus Staff', department: 'IT Operations', token: 'token-admin-supervisor-001' }
];

export default function App() {
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState('dark');
  
  // Active tab: 'submit', 'track', 'admin'
  const [activeTab, setActiveTab] = useState('submit');

  // Authenticated Student State
  const [currentUser, setCurrentUser] = useState(DEMO_STUDENTS[0]);

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Initial demo tickets matching reference
  const initialTickets = [
    { id: 'CHD-2026-1001', title: 'Wi-Fi disconnecting intermittently in Library 2nd Floor', fullName: 'Sarah Jenkins', name: 'Sarah Jenkins', studentId: 'STU-94021', email: 'sarah.j@campus.edu', category: 'IT & Network Support', priority: 'High', location: 'Library 2nd Floor', details: 'Wi-Fi keeps dropping connection every 10 minutes.', status: 'In Progress', date: '2026-10-26 14:10' },
    { id: 'CHD-2026-1002', title: 'Water leak under sink in Science Hall Room 304', fullName: 'Dr. Robert Martinez', name: 'Dr. Robert Martinez', studentId: 'FAC-4102', email: 'r.martinez@campus.edu', category: 'Facilities & Maintenance', priority: 'Urgent', location: 'Science Hall 304', details: 'Constant dripping water under chemistry lab sink.', status: 'Pending', date: '2026-10-26 12:30' },
    { id: 'CHD-2026-1003', title: 'Transcript request not updating on Student Portal', fullName: 'Liam Patterson', name: 'Liam Patterson', studentId: 'STU-65823', email: 'l.patterson@campus.edu', category: 'Academic & Registrar', priority: 'Medium', location: 'Administration Hall', details: 'Transcript order placed on hold.', status: 'Resolved', date: '2026-10-25 09:15' }
  ];

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('campus_tickets');
    if (!saved) return initialTickets;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return initialTickets;
    } catch {
      return initialTickets;
    }
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    studentId: currentUser.studentId,
    email: currentUser.email,
    phone: '',
    category: 'IT & Network Support',
    priority: 'Medium',
    location: '',
    details: ''
  });

  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch complaints from backend API on student switch
  const loadBackendComplaints = useCallback(async (user) => {
    try {
      const res = await apiClient.getComplaints(user.token, user.email, user.studentId);
      if (res?.complaints && Array.isArray(res.complaints)) {
        const normalized = res.complaints.map(c => ({
          ...c,
          fullName: c.requesterName || c.fullName,
          name: c.requesterName || c.name,
          details: c.description || c.details,
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.date
        }));
        setTickets(normalized);
      }
    } catch (err) {
      console.warn('Backend server complaints unavailable, using local cache:', err.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiClient.getComplaints(currentUser.token, currentUser.email, currentUser.studentId)
      .then(res => {
        if (active && res?.complaints && Array.isArray(res.complaints)) {
          const normalized = res.complaints.map(c => ({
            ...c,
            fullName: c.requesterName || c.fullName,
            name: c.requesterName || c.name,
            details: c.description || c.details,
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.date
          }));
          setTickets(normalized);
        }
      })
      .catch(err => {
        console.warn('Backend server complaints unavailable, using local cache:', err.message);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('campus_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStudentSwitch = (studentId) => {
    const found = DEMO_STUDENTS.find(s => s.studentId === studentId);
    if (found) {
      setCurrentUser(found);
      setFormData(prev => ({
        ...prev,
        fullName: found.fullName,
        studentId: found.studentId,
        email: found.email
      }));
    }
  };

  // Direct manual submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentId || !formData.details) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const res = await apiClient.createComplaint({
        title: formData.details.substring(0, 60),
        description: formData.details,
        category: formData.category,
        priority: formData.priority,
        department: formData.category,
        location: formData.location || 'Campus'
      }, currentUser.token, currentUser.email, currentUser.studentId);

      const createdTicket = {
        ...res.complaint,
        fullName: res.complaint.requesterName,
        details: res.complaint.description,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setTickets([createdTicket, ...tickets]);
      setSubmitSuccess(`Ticket successfully created! Tracking ID: ${createdTicket.id}`);
    } catch {
      // Local fallback
      const currentYear = new Date().getFullYear();
      const newTicket = {
        id: `CHD-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        name: formData.fullName,
        status: 'Pending',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setTickets([newTicket, ...tickets]);
      setSubmitSuccess(`Ticket successfully submitted! Your Tracking ID is ${newTicket.id}`);
    }

    setFormData({
      fullName: currentUser.fullName,
      studentId: currentUser.studentId,
      email: currentUser.email,
      phone: '',
      category: 'IT & Network Support',
      priority: 'Medium',
      location: '',
      details: ''
    });
    setTimeout(() => setSubmitSuccess(''), 7000);
  };

  // Called when AI Assistant confirms ticket creation
  const handleAiComplaintCreated = (createdComplaint) => {
    const normalized = {
      ...createdComplaint,
      fullName: createdComplaint.requesterName,
      name: createdComplaint.requesterName,
      details: createdComplaint.description,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTickets(prev => [normalized, ...prev]);
    setSubmitSuccess(`AI-Assisted Ticket created successfully! Tracking ID: ${createdComplaint.id}`);
    setFormData(prev => ({ ...prev, details: '', location: '' }));
    setIsAiModalOpen(false);
    setActiveTab('track');
    setTimeout(() => setSubmitSuccess(''), 7000);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo tickets to default?')) {
      setTickets(initialTickets);
      localStorage.setItem('campus_tickets', JSON.stringify(initialTickets));
      alert('Demo data reset successfully!');
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      await apiClient.updateComplaintStatus(id, newStatus, 'Helpdesk Admin', currentUser.token, currentUser.email);
    } catch (err) {
      console.warn('Backend update skipped, updating locally:', err.message);
    }
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTicket = (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
      color: isDark ? '#f3f4f6' : '#1f2937',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'all 0.2s ease'
    }}>
      {/* Top Header Navbar */}
      <header style={{
        backgroundColor: isDark ? '#111827' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            🎓 CampusDesk
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0, color: isDark ? '#ffffff' : '#111827' }}>
              University Helpdesk Portal
            </h1>
            <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
              Multi-Agent AI Triage & Support System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: isDark ? '#1f2937' : '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'submit' ? '#2563eb' : 'transparent',
              color: activeTab === 'submit' ? '#ffffff' : (isDark ? '#9ca3af' : '#4b5563')
            }}
          >
            + Submit Issue
          </button>
          <button
            onClick={() => setActiveTab('track')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'track' ? '#2563eb' : 'transparent',
              color: activeTab === 'track' ? '#ffffff' : (isDark ? '#9ca3af' : '#4b5563')
            }}
          >
            🔍 Track & Browse ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: activeTab === 'admin' ? '#2563eb' : 'transparent',
              color: activeTab === 'admin' ? '#ffffff' : (isDark ? '#9ca3af' : '#4b5563')
            }}
          >
            ⚙️ Admin Dashboard
          </button>
        </div>

        {/* Student Auth Switcher & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Authenticated Student Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`
          }}>
            <span style={{ fontSize: '13px' }}>👤</span>
            <select
              value={currentUser.studentId}
              onChange={(e) => handleStudentSwitch(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isDark ? '#ffffff' : '#111827',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Switch authenticated user to verify student complaint isolation"
            >
              {DEMO_STUDENTS.map(s => (
                <option key={s.studentId} value={s.studentId} style={{ backgroundColor: isDark ? '#111827' : '#ffffff', color: isDark ? '#ffffff' : '#000000' }}>
                  {s.fullName} ({s.role.includes('Staff') ? 'Staff' : s.studentId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetDemo}
            style={{
              backgroundColor: isDark ? '#374151' : '#e2e8f0',
              color: isDark ? '#f3f4f6' : '#1f2937',
              border: 'none',
              padding: '7px 12px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Reset demo data to default"
          >
            🔄 Reset
          </button>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
              backgroundColor: isDark ? '#1f2937' : '#e2e8f0',
              color: isDark ? '#fbbf24' : '#1f2937',
              border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px'
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '28px auto', padding: '0 20px' }}>
        
        {/* TAB 1: SUBMIT ISSUE */}
        {activeTab === 'submit' && (
          <div style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ borderBottom: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`, paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#2563eb22', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  CAMPUS HELP & SUPPORT
                </span>
                <span style={{ backgroundColor: '#7c3aed22', color: '#a78bfa', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  🤖 MULTI-AGENT ASSISTED
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px', color: isDark ? '#ffffff' : '#111827' }}>
                Submit a Support Request
              </h2>
              <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                Describe your issue below. You can choose to analyze it with our 6 specialized AI agents for instant grounded troubleshooting and automated routing, or submit manually.
              </p>
            </div>

            {submitSuccess && (
              <div style={{ backgroundColor: '#065f46', color: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section 1 */}
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                👤 1. Authenticated Student Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Student / Staff ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. STU-94021"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Campus Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@campus.edu"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Campus Physical Location / Room
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Science Hall Room 304 or Library 2nd Floor"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Section 2 */}
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                📝 2. Problem Description
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                  Detailed Description *
                </label>
                <textarea
                  name="details"
                  rows="4"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Describe your issue clearly (e.g. Wi-Fi dropping during midterm exam, water leaking under sink, dorm heating stopped)..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                    backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    fontSize: '14px'
                  }}
                ></textarea>
              </div>

              {/* Dual Action Buttons: AI-Assisted Multi-Agent vs Direct Manual */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.details || formData.details.trim().length < 5) {
                      alert('Please provide a description in the Detailed Description box first.');
                      return;
                    }
                    setIsAiModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <span>🤖 Analyze with Multi-Agent AI (Gemini)</span>
                </button>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Direct Manual Submit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: TRACK & BROWSE */}
        {activeTab === 'track' && (
          <div style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', color: isDark ? '#ffffff' : '#111827' }}>
                  🔍 Track & Browse Tickets
                </h2>
                <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '13px', margin: 0 }}>
                  Showing support requests for <strong>{currentUser.fullName}</strong> ({currentUser.email}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadBackendComplaints(currentUser)}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                  border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                  color: isDark ? '#ffffff' : '#111827',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔄 Refresh Tickets
              </button>
            </div>

            {tickets.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                No active tickets found for this account. Click "+ Submit Issue" or switch student profile in the header.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {tickets.map((t) => (
                  <div key={t.id} style={{
                    backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
                    border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{t.id}</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          backgroundColor: t.status === 'Open' || t.status === 'Pending' ? '#d9770633' : t.status === 'In Progress' ? '#2563eb33' : '#05966933',
                          color: t.status === 'Open' || t.status === 'Pending' ? '#fbbf24' : t.status === 'In Progress' ? '#60a5fa' : '#34d399'
                        }}>
                          {t.status}
                        </span>
                        <span style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                          Priority: <strong>{t.priority}</strong>
                        </span>
                        {t.department && (
                          <span style={{ fontSize: '11px', color: '#a78bfa' }}>
                            Dept: {t.department}
                          </span>
                        )}
                        {t.aiAnalysisRef && (
                          <span style={{ fontSize: '10px', backgroundColor: '#7c3aed22', color: '#c4b5fd', padding: '1px 6px', borderRadius: '4px' }}>
                            🤖 AI Assessed
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0', color: isDark ? '#ffffff' : '#111827' }}>
                        {t.title || t.category} — <span style={{ fontWeight: 'normal', fontSize: '13px' }}>{t.location}</span>
                      </h4>
                      <p style={{ fontSize: '13px', color: isDark ? '#d1d5db' : '#4b5563', margin: '4px 0' }}>
                        {t.details || t.description}
                      </p>
                      <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '6px' }}>
                        Submitted by <strong>{t.fullName || t.name}</strong> ({t.studentId}) on {t.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <div style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: isDark ? '#ffffff' : '#111827' }}>
              ⚙️ Admin Dashboard & Incident Triage
            </h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Manage ticket statuses, review AI agent activity, and inspect workflow traces.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Total Tickets</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{tickets.length}</div>
              </div>
              <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Pending / In Progress</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
                  {tickets.filter(t => t.status !== 'Resolved').length}
                </div>
              </div>
              <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Resolved</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {tickets.filter(t => t.status === 'Resolved').length}
                </div>
              </div>
            </div>

            {/* Ticket Management Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {tickets.map((t) => (
                <div key={t.id} style={{
                  backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
                  border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{t.id}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#ffffff' : '#111827' }}>
                        {t.category || t.department} ({t.location})
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
                      Student: {t.fullName || t.name} | Status: <strong>{t.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={t.status}
                      onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                        backgroundColor: isDark ? '#111827' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => deleteTicket(t.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* REAL AI AGENT ACTIVITY & TELEMETRY SECTION */}
            <AgentActivitySection isDark={isDark} />
          </div>
        )}

      </main>

      {/* AI Multi-Agent Triage & Consequential Action Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        problemDescription={formData.details}
        location={formData.location}
        title={formData.details ? formData.details.substring(0, 60) : 'Campus Helpdesk Issue'}
        currentUser={currentUser}
        onComplaintCreated={handleAiComplaintCreated}
        isDark={isDark}
      />
    </div>
  );
}
