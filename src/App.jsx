import { useState, useEffect } from 'react';

export default function App() {
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState('dark');
  
  // Active tab: 'submit', 'track', 'admin'
  const [activeTab, setActiveTab] = useState('submit');

  // Initial demo tickets matching reference
  const initialTickets = [
    { id: 'TICK-1001', fullName: 'Alex Morgan', name: 'Alex Morgan', studentId: 'STU-2026-8002', email: 'alex@campus.edu', category: 'IT & Campus Wi-Fi', priority: 'High', location: 'Library 2nd Floor', details: 'Wi-Fi keeps dropping connection every 5 minutes.', status: 'Open', date: '2026-10-26 14:10' },
    { id: 'TICK-1002', fullName: 'Sarah Jenkins', name: 'Sarah Jenkins', studentId: 'STU-2026-4412', email: 'sarah@campus.edu', category: 'Classroom AV / Projector', priority: 'Medium', location: 'Auditorium Hall B', details: 'Projector bulb is flickering and dim.', status: 'In Progress', date: '2026-10-26 12:30' },
    { id: 'TICK-1003', fullName: 'David Miller', name: 'David Miller', studentId: 'STU-2026-9104', email: 'david@campus.edu', category: 'Maintenance & Facilities', priority: 'Low', location: 'Student Center Cafeteria', details: 'Leaking water tap near the washbasin area.', status: 'Resolved', date: '2026-10-25 09:15' }
  ];

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('campus_tickets');
    if (!saved) return initialTickets;

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Unable to parse saved campus tickets; using demo data instead.', error);
      return initialTickets;
    }
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    category: 'IT & Campus Wi-Fi',
    priority: 'Medium',
    location: '',
    details: ''
  });

  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('campus_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.studentId || !formData.details) {
      alert('Please fill out all required fields.');
      return;
    }
    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: 'Open',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTickets([newTicket, ...tickets]);
    setSubmitSuccess(`Ticket successfully submitted! Your Tracking ID is ${newTicket.id}`);
    setFormData({
      fullName: '',
      studentId: '',
      email: '',
      phone: '',
      category: 'IT & Campus Wi-Fi',
      priority: 'Medium',
      location: '',
      details: ''
    });
    setTimeout(() => setSubmitSuccess(''), 6000);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo tickets to default?')) {
      setTickets(initialTickets);
      localStorage.setItem('campus_tickets', JSON.stringify(initialTickets));
      alert('Demo data reset successfully!');
    }
  };

  const updateTicketStatus = (id, newStatus) => {
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
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: isDark ? '#ffffff' : '#111827' }}>
              Campus Helpdesk Portal
            </h1>
            <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', margin: 0 }}>
              Students & Staff Helpdesk
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

        {/* Right Controls: Reset Demo & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleResetDemo}
            style={{
              backgroundColor: isDark ? '#374151' : '#e2e8f0',
              color: isDark ? '#f3f4f6' : '#1f2937',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px'
            }}
            title="Reset demo data to default"
          >
            🔄 Reset Demo
          </button>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
              backgroundColor: isDark ? '#1f2937' : '#e2e8f0',
              color: isDark ? '#fbbf24' : '#1f2937',
              border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 20px' }}>
        
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
              <span style={{ backgroundColor: '#2563eb22', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                CAMPUS SUPPORT PORTAL
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px', color: isDark ? '#ffffff' : '#111827' }}>
                Submit a New Helpdesk Ticket
              </h2>
              <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                Need assistance with campus Wi-Fi, housing facilities, lab equipment, or portals? Fill out the details below to notify campus staff.
              </p>
            </div>

            {submitSuccess && (
              <div style={{ backgroundColor: '#065f46', color: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section 1 */}
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                👤 1. Student & Contact Information
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
                    placeholder="e.g. Alex Morgan"
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
                    Student / Employee ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. STU/2026-8002"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    University Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@campus.edu"
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
                    Phone / Mobile (Optional)
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
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
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                📍 2. Issue Classification & Location
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  >
                    <option value="IT & Campus Wi-Fi">IT & Campus Wi-Fi</option>
                    <option value="Classroom AV / Projector">Classroom AV / Projector</option>
                    <option value="Maintenance & Facilities">Maintenance & Facilities</option>
                    <option value="Library & Lab Equipment">Library & Lab Equipment</option>
                    <option value="Student Portal / LMS Issue">Student Portal / LMS Issue</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Priority Level *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#374151' : '#cbd5e1'}`,
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Campus Location / Building *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Science Block 3rd Flr"
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

              {/* Section 3 */}
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                📝 3. Problem Description
              </h3>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
                  Detailed Description *
                </label>
                <textarea
                  name="details"
                  rows="4"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Describe the issue clearly so technicians can resolve it quickly..."
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

              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🚀 Submit Helpdesk Ticket
              </button>
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
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: isDark ? '#ffffff' : '#111827' }}>
              🔍 Track & Browse Tickets
            </h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              View all submitted support requests across campus and their current status.
            </p>

            {tickets.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                No active tickets found. Click "+ Submit Issue" to add one!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tickets.map((t) => (
                  <div key={t.id} style={{
                    backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
                    border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{t.id}</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          backgroundColor: t.status === 'Open' ? '#d9770633' : t.status === 'In Progress' ? '#2563eb33' : '#05966933',
                          color: t.status === 'Open' ? '#fbbf24' : t.status === 'In Progress' ? '#60a5fa' : '#34d399'
                        }}>
                          {t.status}
                        </span>
                        <span style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                          Priority: {t.priority}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0', color: isDark ? '#ffffff' : '#111827' }}>
                        {t.category} — <span style={{ fontWeight: 'normal', fontSize: '13px' }}>{t.location}</span>
                      </h4>
                      <p style={{ fontSize: '13px', color: isDark ? '#d1d5db' : '#4b5563', margin: '4px 0' }}>
                        {t.details}
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
              ⚙️ Admin Dashboard & Ticket Management
            </h2>
            <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Manage ticket statuses, resolve issues, or remove invalid requests.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Total Tickets</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{tickets.length}</div>
              </div>
              <div style={{ backgroundColor: isDark ? '#0b0f19' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Open / In Progress</div>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tickets.map((t) => (
                <div key={t.id} style={{
                  backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
                  border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{t.id}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#ffffff' : '#111827' }}>
                        {t.category} ({t.location})
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
                        fontWeight: '600'
                      }}
                    >
                      <option value="Open">Open</option>
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
          </div>
        )}

      </main>
    </div>
  );
}