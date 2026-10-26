import { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  User, 
  Send, 
  MessageCircle, 
  HelpCircle, 
  PhoneCall, 
  ArrowRight, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { 
  TICKET_STATUSES, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG 
} from '../constants/ticketData';

export default function TicketTracker({ 
  tickets = [], 
  initialTicketId = '', 
  onUpdateTicket 
}) {
  const [searchQuery, setSearchQuery] = useState(initialTicketId || '');
  const [searchedId, setSearchedId] = useState(initialTicketId || '');
  const [prevInitialId, setPrevInitialId] = useState(initialTicketId);
  const [activeSelectedId, setActiveSelectedId] = useState('');
  const [studentReply, setStudentReply] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  // Sync state if initialTicketId prop updates during render
  if (initialTicketId && initialTicketId !== prevInitialId) {
    setPrevInitialId(initialTicketId);
    setSearchQuery(initialTicketId);
    setSearchedId(initialTicketId);
    setActiveSelectedId('');
  }

  // Derive matched tickets directly from props and query without cascading setState
  const { selectedTicket, matchedEmailTickets } = useMemo(() => {
    const q = (searchedId || '').trim().toLowerCase();
    if (!q) {
      return { selectedTicket: null, matchedEmailTickets: [] };
    }

    // 1. Exact match on Ticket ID
    const exactMatch = tickets.find(t => (t.id || '').toLowerCase() === q);
    if (exactMatch) {
      return { selectedTicket: exactMatch, matchedEmailTickets: [] };
    }

    // 2. Email query match
    if (q.includes('@')) {
      const emailMatches = tickets.filter(t => (t.requesterEmail || '').toLowerCase() === q);
      if (emailMatches.length > 0) {
        const current = activeSelectedId 
          ? (emailMatches.find(t => (t.id || '').toLowerCase() === activeSelectedId.toLowerCase()) || emailMatches[0])
          : emailMatches[0];
        return { selectedTicket: current, matchedEmailTickets: emailMatches };
      }
    }

    // 3. Partial Ticket ID match
    const partialMatch = tickets.find(t => t.id.toLowerCase().includes(q));
    if (partialMatch) {
      return { selectedTicket: partialMatch, matchedEmailTickets: [] };
    }

    return { selectedTicket: null, matchedEmailTickets: [] };
  }, [searchedId, tickets, activeSelectedId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchedId(searchQuery.trim());
    setActiveSelectedId('');
    setReplySuccess(false);
  };

  const handleSelectSample = (sampleId) => {
    setSearchQuery(sampleId);
    setSearchedId(sampleId);
    setActiveSelectedId('');
    setReplySuccess(false);
  };

  const handleSelectEmailTicket = (ticketItem) => {
    setActiveSelectedId(ticketItem.id);
  };

  const handlePostStudentComment = (e) => {
    e.preventDefault();
    if (!studentReply.trim() || !selectedTicket) return;

    const nowIso = new Date().toISOString();
    const updatedTimeline = [
      ...(selectedTicket.timeline || []),
      {
        id: `t-${Date.now()}`,
        date: nowIso,
        action: 'Requester Update Added',
        by: selectedTicket.requesterName || 'Student',
        note: studentReply.trim()
      }
    ];

    const updated = {
      ...selectedTicket,
      updatedAt: nowIso,
      timeline: updatedTimeline
    };

    onUpdateTicket(updated);
    setStudentReply('');
    setReplySuccess(true);
    setTimeout(() => setReplySuccess(false), 3000);
  };

  // Determine stage index for progress stepper
  const getStageIndex = (status) => {
    if (status === TICKET_STATUSES.RESOLVED) return 3;
    if (status === TICKET_STATUSES.IN_PROGRESS) return 2;
    return 1;
  };

  return (
    <div className="tracker-page-container">
      {/* Search Header Banner */}
      <div className="tracker-hero-banner">
        <h1 className="tracker-title">Track Ticket Status & Updates</h1>
        <p className="tracker-subtitle">
          Enter your Ticket Reference ID (e.g., <code>CHD-2026-1001</code>) or your campus email to review resolution progress.
        </p>

        <form onSubmit={handleSearchSubmit} className="tracker-search-form" role="search" aria-label="Ticket lookup search">
          <div className="tracker-search-input-wrap">
            <Search size={20} className="tracker-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Ticket ID (CHD-...) or student email..."
              aria-label="Ticket Reference ID or Email"
              className="tracker-input"
            />
          </div>
          <button type="submit" className="btn btn-primary tracker-submit-btn">
            <span>Check Status</span>
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Quick sample ticket buttons for convenience */}
        <div className="quick-tickets-chips">
          <span className="chips-label">Try sample:</span>
          {tickets.slice(0, 3).map(sample => (
            <button
              key={sample.id}
              type="button"
              className="chip-btn"
              onClick={() => handleSelectSample(sample.id)}
              aria-label={`Load sample ticket ${sample.id}`}
            >
              {sample.id} ({sample.status})
            </button>
          ))}
        </div>
      </div>

      <div className="tracker-content-layout">
        {/* Main Result Column */}
        <div className="tracker-main-col">
          {/* If multiple tickets found under email */}
          {matchedEmailTickets.length > 1 && (
            <div className="email-matches-card">
              <h3 className="email-matches-title">
                Found {matchedEmailTickets.length} tickets for <code>{searchedId}</code>
              </h3>
              <div className="email-tickets-list">
                {matchedEmailTickets.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectEmailTicket(item)}
                    className={`email-ticket-item ${selectedTicket?.id === item.id ? 'active' : ''}`}
                    aria-label={`Select ticket ${item.id}: ${item.title}`}
                  >
                    <div className="email-item-header">
                      <span className="email-ticket-id">{item.id}</span>
                      <span className={`badge ${STATUS_CONFIG[item.status]?.badgeClass}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="email-ticket-title">{item.title}</p>
                    <span className="email-ticket-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTicket ? (
            <div className="tracker-card" role="region" aria-label={`Details for ticket ${selectedTicket.id}`}>
              {/* Ticket Head */}
              <div className="tracker-card-header">
                <div className="tracker-card-title-group">
                  <div className="tracker-id-badge-row">
                    <span className="tracker-ref-code">{selectedTicket.id}</span>
                    <span className={`badge ${STATUS_CONFIG[selectedTicket.status]?.badgeClass}`}>
                      <span className="badge-dot"></span>
                      {selectedTicket.status}
                    </span>
                    <span className={`badge ${PRIORITY_CONFIG[selectedTicket.priority]?.badgeClass}`}>
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <h2 className="tracker-ticket-heading">{selectedTicket.title}</h2>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="ticket-stepper-wrapper" aria-label="Resolution progress stepper">
                <div className="stepper-track">
                  {/* Step 1: Pending / Submitted */}
                  <div className={`step-node ${getStageIndex(selectedTicket.status) >= 1 ? 'completed' : ''}`}>
                    <div className="node-icon">
                      <Clock size={18} />
                    </div>
                    <span className="node-label">1. Submitted</span>
                    <span className="node-sub">Logged in system</span>
                  </div>

                  <div className={`step-connector ${getStageIndex(selectedTicket.status) >= 2 ? 'filled' : ''}`}></div>

                  {/* Step 2: In Progress */}
                  <div className={`step-node ${getStageIndex(selectedTicket.status) >= 2 ? 'completed' : ''} ${selectedTicket.status === TICKET_STATUSES.IN_PROGRESS ? 'active' : ''}`}>
                    <div className="node-icon">
                      <AlertCircle size={18} />
                    </div>
                    <span className="node-label">2. In Progress</span>
                    <span className="node-sub">Staff assigned</span>
                  </div>

                  <div className={`step-connector ${getStageIndex(selectedTicket.status) >= 3 ? 'filled' : ''}`}></div>

                  {/* Step 3: Resolved */}
                  <div className={`step-node ${getStageIndex(selectedTicket.status) >= 3 ? 'completed' : ''}`}>
                    <div className="node-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="node-label">3. Resolved</span>
                    <span className="node-sub">Closed & solved</span>
                  </div>
                </div>
              </div>

              {/* Resolution Banner if Resolved */}
              {selectedTicket.status === TICKET_STATUSES.RESOLVED && (
                <div className="resolution-highlight-banner" role="status">
                  <div className="resolution-highlight-icon">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="resolution-highlight-body">
                    <h4>Resolution Confirmed</h4>
                    <p>{selectedTicket.resolutionNotes || 'This issue has been successfully resolved and tested by our support team.'}</p>
                    {selectedTicket.assignedTo && (
                      <span className="technician-tag">Resolved by: {selectedTicket.assignedTo}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Ticket Information Overview */}
              <div className="tracker-details-grid">
                <div className="tracker-detail-box">
                  <span className="tracker-label">Category</span>
                  <span className="tracker-val">{selectedTicket.category}</span>
                </div>

                <div className="tracker-detail-box">
                  <span className="tracker-label">Location / Room</span>
                  <div className="tracker-val-with-icon">
                    <MapPin size={15} />
                    <span>{selectedTicket.location}</span>
                  </div>
                </div>

                <div className="tracker-detail-box">
                  <span className="tracker-label">Requester</span>
                  <div className="tracker-val-with-icon">
                    <User size={15} />
                    <span>{selectedTicket.requesterName} ({selectedTicket.requesterRole})</span>
                  </div>
                </div>

                <div className="tracker-detail-box">
                  <span className="tracker-label">Submitted On</span>
                  <div className="tracker-val-with-icon">
                    <Calendar size={15} />
                    <span>{new Date(selectedTicket.createdAt).toLocaleDateString()} at {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="tracker-section-block">
                <h4 className="tracker-subhead">Reported Issue Description</h4>
                <div className="tracker-desc-content">
                  <p>{selectedTicket.description}</p>
                </div>
              </div>

              {/* History Timeline */}
              <div className="tracker-section-block">
                <h4 className="tracker-subhead">Update Log & Activity Feed</h4>
                <div className="tracker-timeline-list">
                  {selectedTicket.timeline?.map((evt, i) => (
                    <div key={evt.id || i} className="tracker-timeline-item">
                      <div className="tracker-timeline-bullet"></div>
                      <div className="tracker-timeline-info">
                        <div className="tracker-timeline-top">
                          <strong>{evt.action}</strong>
                          <span className="tracker-timeline-time">
                            {new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="tracker-timeline-actor">From: {evt.by}</span>
                        {evt.note && <p className="tracker-timeline-text">{evt.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Follow-Up / Message Box */}
              <div className="tracker-reply-box">
                <h4 className="tracker-subhead">
                  <MessageCircle size={17} />
                  <span>Send Additional Note or Clarification</span>
                </h4>
                <p className="tracker-reply-desc">
                  Need to provide extra details, photos, or check on progress? Your message will be appended directly to the ticket log for the technician.
                </p>

                {replySuccess && (
                  <div className="reply-success-alert" role="status">
                    <CheckCircle2 size={16} />
                    <span>Your note has been posted to the ticket timeline!</span>
                  </div>
                )}

                <form onSubmit={handlePostStudentComment} className="reply-form">
                  <textarea
                    rows={3}
                    value={studentReply}
                    onChange={(e) => setStudentReply(e.target.value)}
                    placeholder="Type your message or clarification here..."
                    aria-label="Add additional clarification message"
                    className="form-textarea"
                  ></textarea>

                  <div className="reply-form-actions">
                    <button
                      type="submit"
                      disabled={!studentReply.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      <Send size={15} />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : searchedId ? (
            <div className="no-ticket-found-card" role="status">
              <HelpCircle size={44} className="no-result-icon" />
              <h3>No Ticket Found for "{searchedId}"</h3>
              <p>
                Please verify your Ticket ID (e.g., <code>CHD-2026-1001</code>) or the campus email address used when submitting the issue.
              </p>
              <div className="no-result-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchedId('');
                  }}
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="tracker-empty-state">
              <div className="empty-state-graphic">
                <ShieldCheck size={48} className="shield-icon" />
              </div>
              <h3>Search for your Ticket Above</h3>
              <p>
                Enter the reference code you received upon submission to see which department is handling your request and its current status.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info & Campus Hotline */}
        <aside className="tracker-sidebar">
          <div className="sidebar-card hotline-card">
            <div className="sidebar-card-header">
              <PhoneCall size={20} className="hotline-icon" />
              <h3>Immediate Help Hotlines</h3>
            </div>
            <p className="sidebar-sub">For urgent or emergency campus disruptions:</p>
            <ul className="hotline-list">
              <li>
                <strong>Campus IT Helpdesk:</strong>
                <span>(555) 019-4357 (Ext 4357)</span>
              </li>
              <li>
                <strong>Facilities & Maintenance:</strong>
                <span>(555) 019-7200 (Ext 7200)</span>
              </li>
              <li>
                <strong>Campus Police / Escort:</strong>
                <span>(555) 019-9111</span>
              </li>
              <li>
                <strong>Housing & Residential Life:</strong>
                <span>(555) 019-3300</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-card faq-card">
            <h3>Frequently Asked</h3>
            <div className="faq-item">
              <strong>How long does resolution take?</strong>
              <p>Most network and facility tickets are resolved within 24–48 hours. Urgent issues are responded to within 1 hour.</p>
            </div>
            <div className="faq-item">
              <strong>Can I update my ticket?</strong>
              <p>Yes! Use the message box above to post additional room numbers or clarifications at any time.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
