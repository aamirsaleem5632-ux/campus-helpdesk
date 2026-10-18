import { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Paperclip, 
  X, 
  HelpCircle, 
  MapPin, 
  User, 
  Mail, 
  Tag, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  TICKET_CATEGORIES, 
  TICKET_PRIORITIES, 
  PRIORITY_CONFIG, 
  USER_ROLES, 
  TICKET_STATUSES 
} from '../constants/ticketData';
import { generateTicketId } from '../services/storage';

export default function IssueForm({ onTicketCreated, onNavigateToTrack, onNavigateToAdmin }) {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    studentId: '',
    requesterRole: USER_ROLES[0],
    category: TICKET_CATEGORIES[0],
    priority: TICKET_PRIORITIES.MEDIUM,
    location: '',
    title: '',
    description: '',
    attachment: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.requesterName.trim()) {
      newErrors.requesterName = 'Full name is required';
    }

    if (!formData.requesterEmail.trim()) {
      newErrors.requesterEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requesterEmail.trim())) {
      newErrors.requesterEmail = 'Please provide a valid campus email address (e.g., student@campus.edu)';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Campus location or room number is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Issue summary/title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Detailed description is required';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Please provide at least 15 characters of detail for troubleshooting';
    }

    setErrors(newErrors);

    const firstInvalidField = Object.keys(newErrors)[0];
    if (firstInvalidField) {
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstInvalidField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 50);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, attachment: 'File size must be under 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, attachment: file.name }));
      setErrors(prev => ({ ...prev, attachment: null }));
    }
  };

  const handleRemoveAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newTicketId = generateTicketId();
      const nowIso = new Date().toISOString();

      const newTicket = {
        id: newTicketId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: TICKET_STATUSES.PENDING,
        requesterName: formData.requesterName.trim(),
        requesterEmail: formData.requesterEmail.trim().toLowerCase(),
        requesterRole: formData.requesterRole,
        studentId: formData.studentId.trim() || 'N/A',
        location: formData.location.trim(),
        createdAt: nowIso,
        updatedAt: nowIso,
        assignedTo: 'Unassigned',
        resolutionNotes: '',
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: nowIso,
            action: 'Ticket Created',
            by: formData.requesterName.trim(),
            note: 'Issue submitted via Campus Helpdesk online portal'
          }
        ],
        attachment: formData.attachment
      };

      onTicketCreated(newTicket);
      setCreatedTicket(newTicket);
      setIsSubmitting(false);
    }, 400);
  };

  const handleCopyId = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetForm = () => {
    setFormData({
      requesterName: '',
      requesterEmail: '',
      studentId: '',
      requesterRole: USER_ROLES[0],
      category: TICKET_CATEGORIES[0],
      priority: TICKET_PRIORITIES.MEDIUM,
      location: '',
      title: '',
      description: '',
      attachment: null
    });
    setErrors({});
    setCreatedTicket(null);
  };

  // Success Confirmation View
  if (createdTicket) {
    return (
      <div className="submission-success-wrapper" role="region" aria-label="Ticket Submission Successful">
        <div className="success-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={48} className="success-check-icon" />
          </div>

          <h2 className="success-title">Helpdesk Ticket Submitted!</h2>
          <p className="success-subtitle">
            Your issue has been recorded and placed into our support dispatch queue.
          </p>

          <div className="ticket-id-display-box">
            <span className="ticket-id-label">YOUR TRACKING ID</span>
            <div className="ticket-id-code-row">
              <span className="ticket-id-code">{createdTicket.id}</span>
              <button 
                type="button" 
                onClick={handleCopyId} 
                className="copy-id-btn"
                title="Copy Ticket ID"
                aria-label="Copy ticket reference code"
              >
                {copiedId ? <Check size={18} className="copied-icon" /> : <Copy size={18} />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="success-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Category</span>
              <span className="summary-value">{createdTicket.category}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Priority</span>
              <span className={`summary-value priority-text-${createdTicket.priority.toLowerCase()}`}>
                {createdTicket.priority}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span className="badge badge-pending">
                <span className="badge-dot"></span>
                {createdTicket.status}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Location</span>
              <span className="summary-value">{createdTicket.location}</span>
            </div>
          </div>

          <div className="success-next-steps">
            <h4>What happens next?</h4>
            <ul>
              <li>Our technical operations team will review and assign your ticket.</li>
              <li>Estimated initial triage response time is currently under <strong>2 hours</strong>.</li>
              <li>You can view real-time progress anytime on the <strong>Track Ticket</strong> page.</li>
            </ul>
          </div>

          <div className="success-action-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateToTrack(createdTicket.id)}
            >
              <span>Track This Ticket</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigateToAdmin(createdTicket.id)}
            >
              <span>View in Admin Dashboard</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleResetForm}
            >
              <span>Submit Another Issue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="issue-form-container">
      {/* Page Title & Hero */}
      <div className="form-hero-banner">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Campus Incident & Request Form</span>
          </div>
          <h1 className="hero-title">Report an Issue or Request Support</h1>
          <p className="hero-description">
            Need assistance with campus Wi-Fi, classroom equipment, facility repairs, housing, or academic services?
            Submit your request below and our team will get on it.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="campus-form" noValidate>
        {/* Section 1: Requester Details */}
        <div className="form-card">
          <div className="card-header-bar">
            <div className="card-header-icon user-icon">
              <User size={19} />
            </div>
            <div>
              <h2 className="card-section-title">Requester Information</h2>
              <p className="card-section-desc">Who should we contact regarding updates for this issue?</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="requesterName" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="requesterName"
                  name="requesterName"
                  value={formData.requesterName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  aria-invalid={!!errors.requesterName}
                  aria-describedby={errors.requesterName ? "requesterName-error" : undefined}
                  className={`form-input ${errors.requesterName ? 'form-input-error' : ''}`}
                />
              </div>
              {errors.requesterName && (
                <span id="requesterName-error" className="field-error-text" role="alert">
                  {errors.requesterName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="requesterEmail" className="form-label">
                Campus Email <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="requesterEmail"
                  name="requesterEmail"
                  value={formData.requesterEmail}
                  onChange={handleChange}
                  placeholder="e.g. a.morgan@campus.edu"
                  aria-invalid={!!errors.requesterEmail}
                  aria-describedby={errors.requesterEmail ? "requesterEmail-error" : undefined}
                  className={`form-input ${errors.requesterEmail ? 'form-input-error' : ''}`}
                />
              </div>
              {errors.requesterEmail && (
                <span id="requesterEmail-error" className="field-error-text" role="alert">
                  {errors.requesterEmail}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="requesterRole" className="form-label">
                University Role <span className="required-star">*</span>
              </label>
              <select
                id="requesterRole"
                name="requesterRole"
                value={formData.requesterRole}
                onChange={handleChange}
                className="form-select"
              >
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="studentId" className="form-label">
                Student / Employee ID <span className="optional-tag">(Optional)</span>
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. STU-84920 or EMP-104"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Issue Details */}
        <div className="form-card">
          <div className="card-header-bar">
            <div className="card-header-icon alert-icon">
              <AlertTriangle size={19} />
            </div>
            <div>
              <h2 className="card-section-title">Incident Details & Location</h2>
              <p className="card-section-desc">Specify what went wrong and where it occurred.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Issue Summary / Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Projector in Science Hall 201 not turning on"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              maxLength={120}
            />
            {errors.title && (
              <span id="title-error" className="field-error-text" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Service Category <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon" />
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {TICKET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Campus Location & Room <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Library 3rd Floor, Quiet Zone"
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? "location-error" : undefined}
                  className={`form-input ${errors.location ? 'form-input-error' : ''}`}
                />
              </div>
              {errors.location && (
                <span id="location-error" className="field-error-text" role="alert">
                  {errors.location}
                </span>
              )}
            </div>
          </div>

          {/* Priority Level Selector */}
          <div className="form-group priority-selection-group">
            <label className="form-label">
              Priority Level <span className="required-star">*</span>
            </label>
            <div className="priority-options-grid" role="radiogroup" aria-label="Priority level">
              {Object.values(TICKET_PRIORITIES).map(p => {
                const isSelected = formData.priority === p;
                const config = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handlePrioritySelect(p)}
                    className={`priority-pill-btn ${config.badgeClass} ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="priority-radio-circle"></span>
                    <div className="priority-label-block">
                      <span className="priority-name">{p}</span>
                      <span className="priority-desc">
                        {p === 'Low' && 'Routine question or cosmetic issue'}
                        {p === 'Medium' && 'Affects single user or minor inconvenience'}
                        {p === 'High' && 'Disrupts class, lab, or office work'}
                        {p === 'Urgent' && 'Safety hazard or campus-wide outage'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <div className="label-with-counter">
              <label htmlFor="description" className="form-label">
                Detailed Description <span className="required-star">*</span>
              </label>
              <span className="char-counter">{formData.description.length} characters</span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide steps to reproduce, error codes, specific equipment labels, or any context that helps us resolve it faster..."
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
            ></textarea>
            {errors.description && (
              <span id="description-error" className="field-error-text" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          {/* Attachment upload */}
          <div className="form-group attachment-section">
            <label className="form-label">
              Attach Screenshot or Photo <span className="optional-tag">(Optional, max 5MB)</span>
            </label>
            {formData.attachment ? (
              <div className="attachment-file-pill">
                <Paperclip size={16} />
                <span className="attachment-name">{formData.attachment}</span>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="remove-attachment-btn"
                  aria-label="Remove attachment"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="attachment-dropzone">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="visually-hidden-file-input"
                />
                <Paperclip size={20} className="dropzone-icon" />
                <span className="dropzone-text">
                  <strong>Click to upload</strong> or drag and drop a file
                </span>
                <span className="dropzone-subtext">PNG, JPG, PDF up to 5MB</span>
              </label>
            )}
            {errors.attachment && (
              <span className="field-error-text" role="alert">{errors.attachment}</span>
            )}
          </div>
        </div>

        {/* Form Submission Actions */}
        <div className="form-actions-card">
          <div className="form-security-note">
            <HelpCircle size={17} />
            <span>
              By submitting, your request will be triaged according to the campus service SLA.
              You will receive a ticket ID to track progress in real time.
            </span>
          </div>

          <div className="form-buttons-row">
            <button
              type="button"
              onClick={handleResetForm}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Clear Form
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-submit-ticket"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
