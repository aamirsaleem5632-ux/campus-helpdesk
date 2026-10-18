import { useState } from 'react';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import AdminDashboard from './components/AdminDashboard';
import TicketTracker from './components/TicketTracker';
import TicketDetailModal from './components/TicketDetailModal';
import Toast from './components/Toast';
import { 
  loadTickets, 
  saveTickets, 
  resetTicketsToDefault 
} from './services/storage';
import './App.css';

export default function App() {
  // Use lazy initializer to read from localStorage without effect cascades
  const [tickets, setTickets] = useState(() => loadTickets());
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track' | 'admin'
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
  const [trackerLookupId, setTrackerLookupId] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleTicketCreated = (newTicket) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveTickets(updated);
    showToast(`Ticket ${newTicket.id} submitted successfully!`, 'success');
  };

  const handleUpdateStatus = (ticketId, newStatus) => {
    const nowIso = new Date().toISOString();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const timeline = [
          ...(t.timeline || []),
          {
            id: `t-${Date.now()}`,
            date: nowIso,
            action: `Status changed to ${newStatus}`,
            by: 'Helpdesk Admin',
            note: 'Status updated via Admin Dashboard'
          }
        ];
        return {
          ...t,
          status: newStatus,
          updatedAt: nowIso,
          timeline
        };
      }
      return t;
    });

    setTickets(updated);
    saveTickets(updated);

    if (selectedTicketForModal && selectedTicketForModal.id === ticketId) {
      setSelectedTicketForModal(updated.find(t => t.id === ticketId));
    }
  };

  const handleUpdateTicket = (updatedTicket) => {
    const updated = tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
    setTickets(updated);
    saveTickets(updated);
    setSelectedTicketForModal(updatedTicket);
    showToast(`Ticket ${updatedTicket.id} updated successfully!`, 'success');
  };

  const handleDeleteTicket = (ticketId) => {
    const updated = tickets.filter(t => t.id !== ticketId);
    setTickets(updated);
    saveTickets(updated);
    if (selectedTicketForModal && selectedTicketForModal.id === ticketId) {
      setSelectedTicketForModal(null);
    }
    showToast(`Ticket ${ticketId} deleted`, 'info');
  };

  const handleResetData = () => {
    const defaultData = resetTicketsToDefault();
    setTickets(defaultData);
    if (selectedTicketForModal) {
      setSelectedTicketForModal(null);
    }
  };

  const handleNavigateToTrack = (ticketId = '') => {
    setTrackerLookupId(ticketId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAdmin = (ticketId = '') => {
    setActiveTab('admin');
    if (ticketId) {
      const found = tickets.find(t => t.id === ticketId);
      if (found) {
        setSelectedTicketForModal(found);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTicketFromDashboard = (ticket) => {
    setSelectedTicketForModal(ticket);
  };

  return (
    <div className="campus-app-wrapper">
      {/* Toast Alert Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Primary Site Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tickets={tickets}
      />

      {/* Main Content Area */}
      <main className="main-content-viewport container">
        {activeTab === 'submit' && (
          <IssueForm
            onTicketCreated={handleTicketCreated}
            onNavigateToTrack={handleNavigateToTrack}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        )}

        {activeTab === 'track' && (
          <TicketTracker
            tickets={tickets}
            initialTicketId={trackerLookupId}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            tickets={tickets}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTicket={handleDeleteTicket}
            onSelectTicket={handleSelectTicketFromDashboard}
            onResetData={handleResetData}
            onNavigateToSubmit={() => {
              setActiveTab('submit');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Detailed Ticket Management Dialog */}
      {selectedTicketForModal && (
        <TicketDetailModal
          ticket={selectedTicketForModal}
          onClose={() => setSelectedTicketForModal(null)}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      )}

      {/* Campus Footer */}
      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-primary">CAMPUS</span>
              <span className="brand-accent">HELPDESK</span>
            </div>
            <p className="footer-tagline">
              Official University Student & Staff IT, Maintenance, and Administrative Support Desk.
            </p>
            <div className="footer-badge-pill">
              <span>Operational 24/7 for Emergency Incidents</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Support Services</h4>
            <ul>
              <li><button type="button" onClick={() => handleNavigateToTrack()} className="footer-link-btn">Check Ticket Status</button></li>
              <li><button type="button" onClick={() => { setActiveTab('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-link-btn">Report Wi-Fi Outage</button></li>
              <li><button type="button" onClick={() => { setActiveTab('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="footer-link-btn">Request Facilities Repair</button></li>
              <li><button type="button" onClick={() => handleNavigateToAdmin()} className="footer-link-btn">Staff Management Login</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Campus Desks</h4>
            <ul>
              <li><strong>Main IT Center:</strong> Library Ground Fl. (Room 102)</li>
              <li><strong>Facilities HQ:</strong> Service Building B</li>
              <li><strong>Student Housing:</strong> Central Quad Hall</li>
              <li><strong>Emergency Phone:</strong> (555) 019-4357</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container footer-bottom-inner">
            <p>© {new Date().getFullYear()} Campus Helpdesk Services. All rights reserved.</p>
            <div className="footer-bottom-links">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
