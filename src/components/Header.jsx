import { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  LayoutDashboard, 
  Phone, 
  Menu, 
  X,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { TICKET_STATUSES } from '../constants/ticketData';

export default function Header({ activeTab, setActiveTab, tickets = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = tickets.filter(t => t.status === TICKET_STATUSES.PENDING).length;
  const inProgressCount = tickets.filter(t => t.status === TICKET_STATUSES.IN_PROGRESS).length;

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      {/* Top University Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="container announcement-inner">
          <div className="announcement-left">
            <span className="live-status-pill">
              <span className="status-dot"></span>
              All Campus Systems Operational
            </span>
            <span className="announcement-text hide-mobile">
              Fall Semester Helpdesk Services: Mon-Fri 7:30 AM – 9:00 PM | Sat 9:00 AM – 5:00 PM
            </span>
          </div>
          <div className="announcement-right">
            <span className="emergency-hotline">
              <Phone size={13} />
              <span>Campus Hotline: <strong>(555) 019-HELP</strong> (Ext 4357)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="main-navbar">
        <div className="container nav-container">
          <div 
            className="logo-brand" 
            onClick={() => handleTabClick('submit')} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick('submit');
              }
            }}
            role="button" 
            tabIndex={0}
            aria-label="Campus Helpdesk Home - Submit Issue"
          >
            <div className="logo-icon-wrapper">
              <Building2 size={24} className="logo-icon" />
              <ShieldCheck size={14} className="logo-subicon" />
            </div>
            <div className="logo-text">
              <div className="logo-title-row">
                <span className="logo-title">CAMPUS</span>
                <span className="logo-highlight">HELPDESK</span>
              </div>
              <span className="logo-tagline">Integrated Student & Staff Support Portal</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-link ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => handleTabClick('submit')}
            >
              <PlusCircle size={17} />
              <span>Submit Issue</span>
            </button>

            <button
              type="button"
              className={`nav-link ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => handleTabClick('track')}
            >
              <Search size={17} />
              <span>Track Ticket</span>
            </button>

            <button
              type="button"
              className={`nav-link admin-nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabClick('admin')}
            >
              <LayoutDashboard size={17} />
              <span>Admin Dashboard</span>
              {(pendingCount > 0 || inProgressCount > 0) && (
                <span className="nav-badge" title={`${pendingCount} pending, ${inProgressCount} in progress`}>
                  {pendingCount + inProgressCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-nav-links">
            <button
              type="button"
              className={`mobile-nav-link ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => handleTabClick('submit')}
            >
              <PlusCircle size={20} />
              <span>Submit New Issue</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-link ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => handleTabClick('track')}
            >
              <Search size={20} />
              <span>Track Your Ticket</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabClick('admin')}
            >
              <LayoutDashboard size={20} />
              <span>Staff & Admin Dashboard</span>
              {(pendingCount > 0 || inProgressCount > 0) && (
                <span className="mobile-nav-badge">
                  {pendingCount + inProgressCount} active
                </span>
              )}
            </button>
          </div>

          <div className="mobile-drawer-footer">
            <div className="mobile-emergency-card">
              <LifeBuoy size={18} />
              <div>
                <strong>Need immediate assistance?</strong>
                <p>Call campus facilities or security dispatch at (555) 019-4357</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
