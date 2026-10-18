import { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  MapPin, 
  Tag, 
  Calendar, 
  Paperclip, 
  Trash2, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { 
  TICKET_STATUSES, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG 
} from '../constants/ticketData';

export default function TicketDetailModal({ 
  ticket, 
  onClose, 
  onUpdateTicket, 
  onDeleteTicket 
}) {
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || TICKET_STATUSES.PENDING);
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || '');
  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes || '');
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Staff Admin');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [resolutionError, setResolutionError] = useState('');

  if (!ticket) return null;

  const currentStatusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG[TICKET_STATUSES.PENDING];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.Low;

  const handleSaveStatusAndNotes = (e) => {
    e.preventDefault();

    // Skill criterion: When transitioning to Resolved, prompt for resolution summary & technician
    if (selectedStatus === TICKET_STATUSES.RESOLVED && !resolutionNotes.trim()) {
      setResolutionError('A resolution summary is required to mark this ticket as Resolved.');
      return;
    }
    setResolutionError('');

    const nowIso = new Date().toISOString();
    const updatedTimeline = [...(ticket.timeline || [])];

    // If status changed, add an event
    if (selectedStatus !== ticket.status) {
      updatedTimeline.push({
        id: `t-${Date.now()}`,
        date: nowIso,
        action: `Status changed to ${selectedStatus}`,
        by: commentAuthor.trim() || 'Staff Admin',
        note: resolutionNotes.trim() ? `Note: ${resolutionNotes.trim()}` : 'Status updated from admin panel'
      });
    } else if (resolutionNotes.trim() && resolutionNotes.trim() !== ticket.resolutionNotes) {
      updatedTimeline.push({
        id: `t-${Date.now()}`,
        date: nowIso,
        action: 'Resolution details updated',
        by: commentAuthor.trim() || 'Staff Admin',
        note: resolutionNotes.trim()
      });
    }

    const updated = {
      ...ticket,
      status: selectedStatus,
      assignedTo: assignedTo.trim() || 'Unassigned',
      resolutionNotes: resolutionNotes.trim(),
      updatedAt: nowIso,
      timeline: updatedTimeline
    };

    onUpdateTicket(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2200);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const nowIso = new Date().toISOString();
    const updatedTimeline = [
      ...(ticket.timeline || []),
      {
        id: `t-${Date.now()}`,
        date: nowIso,
        action: 'Staff Note Added',
        by: commentAuthor.trim() || 'Support Staff',
        note: newComment.trim()
      }
    ];

    const updated = {
      ...ticket,
      updatedAt: nowIso,
      timeline: updatedTimeline
    };

    onUpdateTicket(updated);
    setNewComment('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-title-row">
              <span className="modal-ticket-id">{ticket.id}</span>
              <span className={`badge ${currentStatusConfig.badgeClass}`}>
                <span className="badge-dot"></span>
                {ticket.status}
              </span>
              <span className={`badge ${priorityConfig.badgeClass}`}>
                {ticket.priority} Priority
              </span>
            </div>
            <h2 id="modal-title" className="modal-ticket-title">{ticket.title}</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="modal-grid">
            {/* Left Column: Details & Status Controls */}
            <div className="modal-left-col">
              {/* Status Update Card */}
              <div className="modal-section-box status-changer-box">
                <h3 className="section-subtitle">
                  <ShieldCheck size={18} />
                  <span>Update Ticket Status & Assignment</span>
                </h3>

                <form onSubmit={handleSaveStatusAndNotes} className="status-update-form">
                  <div className="form-group">
                    <label className="form-label">Workflow Status</label>
                    <div className="status-buttons-row" role="radiogroup" aria-label="Workflow Status">
                      {Object.values(TICKET_STATUSES).map((status) => {
                        const isCurrent = selectedStatus === status;
                        const config = STATUS_CONFIG[status];
                        return (
                          <button
                            key={status}
                            type="button"
                            role="radio"
                            aria-checked={isCurrent}
                            onClick={() => {
                              setSelectedStatus(status);
                              if (resolutionError && status !== TICKET_STATUSES.RESOLVED) {
                                setResolutionError('');
                              }
                            }}
                            className={`status-choice-btn ${config.badgeClass} ${isCurrent ? 'active' : ''}`}
                          >
                            {status === TICKET_STATUSES.PENDING && <Clock size={15} />}
                            {status === TICKET_STATUSES.IN_PROGRESS && <AlertCircle size={15} />}
                            {status === TICKET_STATUSES.RESOLVED && <CheckCircle2 size={15} />}
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="assignedTo" className="form-label">Assigned Technician</label>
                      <input
                        type="text"
                        id="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="e.g. Marcus Chen (Network)"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="commentAuthor" className="form-label">Updated By (Staff Name)</label>
                      <input
                        type="text"
                        id="commentAuthor"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="Admin name"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="resolutionNotes" className="form-label">
                      Resolution Summary / Technical Notes
                      {selectedStatus === TICKET_STATUSES.RESOLVED && (
                        <span className="required-star"> * (Required for closure)</span>
                      )}
                    </label>
                    <textarea
                      id="resolutionNotes"
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => {
                        setResolutionNotes(e.target.value);
                        if (resolutionError) setResolutionError('');
                      }}
                      placeholder="Describe what steps were taken to resolve or what actions are currently underway..."
                      aria-invalid={!!resolutionError}
                      aria-describedby={resolutionError ? "resolution-error" : undefined}
                      className={`form-textarea ${resolutionError ? 'form-input-error' : ''}`}
                    ></textarea>
                    {resolutionError && (
                      <span id="resolution-error" className="field-error-text" role="alert">
                        {resolutionError}
                      </span>
                    )}
                  </div>

                  <div className="modal-save-row">
                    <button type="submit" className="btn btn-primary btn-sm">
                      {isSavedRecently ? (
                        <>
                          <Check size={16} />
                          <span>Saved Changes!</span>
                        </>
                      ) : (
                        <span>Save Status & Notes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Requester & Location Info */}
              <div className="modal-section-box">
                <h3 className="section-subtitle">
                  <User size={18} />
                  <span>Requester & Incident Location</span>
                </h3>

                <div className="detail-meta-grid">
                  <div className="meta-card">
                    <User size={16} className="meta-icon" />
                    <div>
                      <span className="meta-label">Requester</span>
                      <strong className="meta-value">{ticket.requesterName}</strong>
                      <span className="meta-sub">({ticket.requesterRole})</span>
                    </div>
                  </div>

                  <div className="meta-card">
                    <Mail size={16} className="meta-icon" />
                    <div>
                      <span className="meta-label">Campus Email</span>
                      <a href={`mailto:${ticket.requesterEmail}`} className="meta-link">
                        {ticket.requesterEmail}
                      </a>
                    </div>
                  </div>

                  <div className="meta-card">
                    <MapPin size={16} className="meta-icon" />
                    <div>
                      <span className="meta-label">Location / Room</span>
                      <strong className="meta-value">{ticket.location}</strong>
                    </div>
                  </div>

                  <div className="meta-card">
                    <Tag size={16} className="meta-icon" />
                    <div>
                      <span className="meta-label">Category / Student ID</span>
                      <strong className="meta-value">{ticket.category}</strong>
                      <span className="meta-sub">ID: {ticket.studentId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Description Box */}
              <div className="modal-section-box">
                <h3 className="section-subtitle">
                  <MessageSquare size={18} />
                  <span>Full Problem Description</span>
                </h3>
                <div className="description-text-card">
                  <p>{ticket.description}</p>
                </div>

                {ticket.attachment && (
                  <div className="ticket-attachment-badge">
                    <Paperclip size={16} />
                    <span>Attached Asset: <strong>{ticket.attachment}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Activity Timeline & Note Adder */}
            <div className="modal-right-col">
              <div className="modal-section-box timeline-section-box">
                <h3 className="section-subtitle">
                  <Calendar size={18} />
                  <span>Incident Timeline & History</span>
                </h3>

                <div className="timeline-stepper">
                  {ticket.timeline && ticket.timeline.length > 0 ? (
                    ticket.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="timeline-step-item">
                        <div className="timeline-point-marker"></div>
                        <div className="timeline-step-content">
                          <div className="timeline-step-header">
                            <strong className="timeline-action-title">{event.action}</strong>
                            <span className="timeline-date">
                              {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="timeline-author">By: {event.by}</span>
                          {event.note && (
                            <p className="timeline-step-note">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-timeline-text">No activity logged yet.</p>
                  )}
                </div>

                {/* Add Follow-Up Note */}
                <form onSubmit={handleAddComment} className="add-note-subform">
                  <label htmlFor="newComment" className="form-label">Add Internal Log Note</label>
                  <div className="note-input-row">
                    <input
                      type="text"
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add an update or note..."
                      className="form-input"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="btn btn-secondary btn-icon-only"
                      title="Post note"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone: Delete Ticket */}
              <div className="modal-danger-box">
                {isConfirmingDelete ? (
                  <div className="confirm-delete-block">
                    <p>Are you sure you want to permanently delete ticket <strong>{ticket.id}</strong>?</p>
                    <div className="confirm-buttons-row">
                      <button
                        type="button"
                        onClick={() => onDeleteTicket(ticket.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Yes, Delete Permanently
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="btn btn-outline-danger btn-sm w-full"
                  >
                    <Trash2 size={15} />
                    <span>Delete Ticket Record</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-left-timestamps">
            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
            {ticket.updatedAt && (
              <span className="dot-divider">• Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
