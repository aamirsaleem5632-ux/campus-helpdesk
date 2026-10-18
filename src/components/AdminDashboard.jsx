import { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Download, 
  RotateCcw, 
  Eye, 
  Trash2, 
  MapPin, 
  Tag, 
  Plus, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  TICKET_STATUSES, 
  STATUS_CONFIG, 
  TICKET_PRIORITIES, 
  PRIORITY_CONFIG, 
  TICKET_CATEGORIES 
} from '../constants/ticketData';
import { exportTicketsToCSV, exportTicketsToJSON } from '../services/storage';

export default function AdminDashboard({ 
  tickets = [], 
  onUpdateStatus, 
  onDeleteTicket, 
  onSelectTicket, 
  onResetData, 
  onNavigateToSubmit,
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === TICKET_STATUSES.PENDING).length;
    const inProgress = tickets.filter(t => t.status === TICKET_STATUSES.IN_PROGRESS).length;
    const resolved = tickets.filter(t => t.status === TICKET_STATUSES.RESOLVED).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const urgentCount = tickets.filter(t => t.priority === TICKET_PRIORITIES.URGENT && t.status !== TICKET_STATUSES.RESOLVED).length;

    // Category breakdown
    const categoryCounts = {};
    TICKET_CATEGORIES.forEach(cat => {
      categoryCounts[cat] = tickets.filter(t => t.category === cat).length;
    });

    // Priority breakdown
    const priorityCounts = {};
    Object.values(TICKET_PRIORITIES).forEach(p => {
      priorityCounts[p] = tickets.filter(t => t.priority === p).length;
    });

    return {
      total,
      pending,
      inProgress,
      resolved,
      resolutionRate,
      urgentCount,
      categoryCounts,
      priorityCounts
    };
  }, [tickets]);

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Status filter
      if (selectedStatusTab !== 'ALL' && ticket.status !== selectedStatusTab) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = ticket.id.toLowerCase().includes(q);
        const matchesTitle = ticket.title.toLowerCase().includes(q);
        const matchesDesc = ticket.description.toLowerCase().includes(q);
        const matchesRequester = ticket.requesterName.toLowerCase().includes(q);
        const matchesLocation = ticket.location.toLowerCase().includes(q);
        const matchesEmail = ticket.requesterEmail.toLowerCase().includes(q);

        if (!matchesId && !matchesTitle && !matchesDesc && !matchesRequester && !matchesLocation && !matchesEmail) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority') {
        const priorityWeight = {
          [TICKET_PRIORITIES.URGENT]: 4,
          [TICKET_PRIORITIES.HIGH]: 3,
          [TICKET_PRIORITIES.MEDIUM]: 2,
          [TICKET_PRIORITIES.LOW]: 1
        };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tickets, selectedStatusTab, categoryFilter, priorityFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const success = exportTicketsToCSV(tickets);
    if (success && showToast) {
      showToast('Exported CSV report successfully!', 'success');
    }
  };

  const handleExportJSON = () => {
    const success = exportTicketsToJSON(tickets);
    if (success && showToast) {
      showToast('Exported JSON dataset successfully!', 'success');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset tickets to default university sample dataset? Current changes will be overwritten.')) {
      onResetData();
      if (showToast) {
        showToast('Reset tickets to initial sample data.', 'info');
      }
    }
  };

  // Skill criterion: When transitioning to Resolved, prompt for resolution notes if missing
  const handleQuickStatusChange = (ticketId, newStatus) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (newStatus === TICKET_STATUSES.RESOLVED && targetTicket && !targetTicket.resolutionNotes) {
      onSelectTicket({ ...targetTicket, status: newStatus });
      if (showToast) {
        showToast('Please provide a resolution note to complete resolving this ticket.', 'info');
      }
      return;
    }

    onUpdateStatus(ticketId, newStatus);
    if (showToast) {
      showToast(`Ticket status updated to ${newStatus}`, 'success');
    }
  };

  const isFiltersActive = searchQuery.trim() || selectedStatusTab !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatusTab('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
  };

  return (
    <div className="admin-dashboard-container">
      {/* Top Banner and Quick Actions */}
      <div className="dashboard-header-row">
        <div>
          <div className="dashboard-title-pill">
            <LayoutDashboard size={14} />
            <span>Staff Administration Center</span>
          </div>
          <h1 className="dashboard-main-title">Campus Helpdesk Operations</h1>
          <p className="dashboard-main-subtitle">
            Manage dispatch queues, track resolution metrics, and update incident statuses across all campus departments.
          </p>
        </div>

        <div className="dashboard-quick-actions">
          <button
            type="button"
            onClick={onNavigateToSubmit}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            title="Download CSV report"
            aria-label="Export report as CSV"
          >
            <Download size={15} />
            <span className="hide-mobile">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="btn btn-outline btn-sm"
            title="Download JSON data"
            aria-label="Export dataset as JSON"
          >
            <Download size={15} />
            <span className="hide-mobile">JSON</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-sm"
            title="Reset to default sample dataset"
            aria-label="Reset tickets to initial sample dataset"
          >
            <RotateCcw size={15} />
            <span className="hide-mobile">Reset Data</span>
          </button>
        </div>
      </div>

      {/* KPI Statistics Cards Grid */}
      <div className="stats-cards-grid" role="region" aria-label="Key Performance Statistics">
        {/* Total Tickets */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Tickets</span>
            <div className="stat-icon-wrap total">
              <LayoutDashboard size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-hint">All recorded incidents</span>
          </div>
        </div>

        {/* Pending Tickets */}
        <div className="stat-card stat-pending">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending</span>
            <div className="stat-icon-wrap pending">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-number text-amber">{stats.pending}</span>
            <span className="stat-hint">Awaiting review & triage</span>
          </div>
        </div>

        {/* In Progress Tickets */}
        <div className="stat-card stat-inprogress">
          <div className="stat-card-header">
            <span className="stat-card-title">In Progress</span>
            <div className="stat-icon-wrap inprogress">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-number text-blue">{stats.inProgress}</span>
            <span className="stat-hint">Under active investigation</span>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="stat-card stat-resolved">
          <div className="stat-card-header">
            <span className="stat-card-title">Resolved</span>
            <div className="stat-icon-wrap resolved">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-number text-green">{stats.resolved}</span>
            <span className="stat-hint">Successfully completed</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Resolution Rate</span>
            <div className="stat-icon-wrap rate">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <div className="stat-rate-row">
              <span className="stat-number">{stats.resolutionRate}%</span>
              <div className="rate-mini-bar" role="progressbar" aria-valuenow={stats.resolutionRate} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className="rate-fill" 
                  style={{ width: `${stats.resolutionRate}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-hint">{stats.resolved} of {stats.total} tickets resolved</span>
          </div>
        </div>

        {/* Urgent Open Tickets */}
        <div className="stat-card stat-urgent">
          <div className="stat-card-header">
            <span className="stat-card-title">Urgent Active</span>
            <div className="stat-icon-wrap urgent">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-card-body">
            <span className={`stat-number ${stats.urgentCount > 0 ? 'text-rose' : 'text-slate'}`}>
              {stats.urgentCount}
            </span>
            <span className="stat-hint">High priority & unresolved</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown Section */}
      <div className="analytics-breakdown-grid">
        {/* Category Breakdown */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <Tag size={16} />
            <span>Incident Volume by Category</span>
          </h3>
          <div className="category-bars-list">
            {TICKET_CATEGORIES.map(category => {
              const count = stats.categoryCounts[category] || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={category} className="cat-bar-row">
                  <div className="cat-bar-labels">
                    <span className="cat-name">{category}</span>
                    <span className="cat-count">{count} ({pct}%)</span>
                  </div>
                  <div className="cat-track">
                    <div 
                      className="cat-fill" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <SlidersHorizontal size={16} />
            <span>Priority & Status Health</span>
          </h3>

          <div className="priority-distribution-block">
            <span className="distribution-subtitle">Priority Breakdown</span>
            <div className="priority-chips-row">
              {Object.values(TICKET_PRIORITIES).map(p => {
                const count = stats.priorityCounts[p] || 0;
                const config = PRIORITY_CONFIG[p];
                return (
                  <div key={p} className={`priority-stat-pill ${config.badgeClass}`}>
                    <span className="p-pill-name">{p}</span>
                    <strong className="p-pill-count">{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="status-progress-composite">
            <span className="distribution-subtitle">Status Distribution</span>
            <div className="composite-bar">
              <div 
                className="comp-segment pending" 
                style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                title={`Pending: ${stats.pending}`}
              ></div>
              <div 
                className="comp-segment inprogress" 
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                title={`In Progress: ${stats.inProgress}`}
              ></div>
              <div 
                className="comp-segment resolved" 
                style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                title={`Resolved: ${stats.resolved}`}
              ></div>
            </div>
            <div className="composite-legend">
              <span className="legend-item"><span className="legend-dot pending"></span> Pending ({stats.pending})</span>
              <span className="legend-item"><span className="legend-dot inprogress"></span> In Progress ({stats.inProgress})</span>
              <span className="legend-item"><span className="legend-dot resolved"></span> Resolved ({stats.resolved})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List Section with Toolbar */}
      <div className="ticket-management-section">
        <div className="management-toolbar">
          {/* Status Tabs */}
          <div className="status-filter-tabs" role="tablist" aria-label="Filter tickets by status">
            <button
              type="button"
              role="tab"
              aria-selected={selectedStatusTab === 'ALL'}
              className={`status-tab ${selectedStatusTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab('ALL')}
            >
              <span>All Tickets</span>
              <span className="tab-count">{tickets.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedStatusTab === TICKET_STATUSES.PENDING}
              className={`status-tab tab-pending ${selectedStatusTab === TICKET_STATUSES.PENDING ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab(TICKET_STATUSES.PENDING)}
            >
              <Clock size={14} />
              <span>Pending</span>
              <span className="tab-count">{stats.pending}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedStatusTab === TICKET_STATUSES.IN_PROGRESS}
              className={`status-tab tab-inprogress ${selectedStatusTab === TICKET_STATUSES.IN_PROGRESS ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab(TICKET_STATUSES.IN_PROGRESS)}
            >
              <AlertCircle size={14} />
              <span>In Progress</span>
              <span className="tab-count">{stats.inProgress}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedStatusTab === TICKET_STATUSES.RESOLVED}
              className={`status-tab tab-resolved ${selectedStatusTab === TICKET_STATUSES.RESOLVED ? 'active' : ''}`}
              onClick={() => setSelectedStatusTab(TICKET_STATUSES.RESOLVED)}
            >
              <CheckCircle2 size={14} />
              <span>Resolved</span>
              <span className="tab-count">{stats.resolved}</span>
            </button>
          </div>

          {/* Search and Secondary Filter Row */}
          <div className="toolbar-controls-row">
            {/* Search Input */}
            <div className="search-box-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, requester, or location..."
                aria-label="Search tickets"
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="search-clear-btn"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="select-filter-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by department category"
                className="toolbar-select"
              >
                <option value="ALL">All Categories</option>
                {TICKET_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="select-filter-wrap">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority level"
                className="toolbar-select"
              >
                <option value="ALL">All Priorities</option>
                {Object.values(TICKET_PRIORITIES).map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="select-filter-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tickets list"
                className="toolbar-select"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="priority">Sort: Highest Priority</option>
                <option value="title">Sort: Title A-Z</option>
              </select>
            </div>

            {isFiltersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline btn-sm clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tickets Results Info Bar */}
        <div className="results-count-bar">
          <span>Showing <strong>{filteredTickets.length}</strong> of {tickets.length} tickets</span>
        </div>

        {/* Tickets Table / List */}
        {filteredTickets.length > 0 ? (
          <div className="table-responsive-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Ticket ID</th>
                  <th style={{ minWidth: '220px' }}>Issue & Location</th>
                  <th style={{ width: '160px' }}>Category</th>
                  <th style={{ width: '150px' }}>Requester</th>
                  <th style={{ width: '100px' }}>Priority</th>
                  <th style={{ width: '160px' }}>Status</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => {
                  const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG[TICKET_STATUSES.PENDING];
                  const priorityConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.Low;

                  return (
                    <tr key={ticket.id} className="ticket-table-row">
                      {/* Ticket ID */}
                      <td>
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket)}
                          className="table-ticket-id-btn"
                          title="View Ticket Details"
                          aria-label={`View ticket ${ticket.id}`}
                        >
                          {ticket.id}
                        </button>
                        <div className="table-time-sub">
                          {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Title & Location */}
                      <td>
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket)}
                          className="table-title-link"
                          aria-label={`Open details for ${ticket.title}`}
                        >
                          {ticket.title}
                        </button>
                        <div className="table-location-sub">
                          <MapPin size={12} />
                          <span>{ticket.location}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-pill-tag">{ticket.category}</span>
                      </td>

                      {/* Requester */}
                      <td>
                        <div className="requester-name-cell">{ticket.requesterName}</div>
                        <div className="requester-role-sub">{ticket.requesterRole}</div>
                      </td>

                      {/* Priority */}
                      <td>
                        <span className={`badge ${priorityConf.badgeClass}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <div className="status-select-wrap">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value)}
                            aria-label={`Update status for ticket ${ticket.id}`}
                            className={`table-status-select ${statusConf.badgeClass}`}
                          >
                            <option value={TICKET_STATUSES.PENDING}>Pending</option>
                            <option value={TICKET_STATUSES.IN_PROGRESS}>In Progress</option>
                            <option value={TICKET_STATUSES.RESOLVED}>Resolved</option>
                          </select>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            onClick={() => onSelectTicket(ticket)}
                            className="action-icon-btn"
                            title="View / Edit Ticket"
                            aria-label={`View details for ticket ${ticket.id}`}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ticket ${ticket.id}?`)) {
                                onDeleteTicket(ticket.id);
                              }
                            }}
                            className="action-icon-btn danger"
                            title="Delete Ticket"
                            aria-label={`Delete ticket ${ticket.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : tickets.length === 0 ? (
          <div className="no-tickets-found-box">
            <LayoutDashboard size={40} className="empty-search-icon" />
            <h3>No Helpdesk Tickets Recorded</h3>
            <p>Your ticket database is currently empty. You can submit a new ticket or restore sample data.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onResetData}
                className="btn btn-primary btn-sm"
              >
                Load Sample Tickets
              </button>
              <button
                type="button"
                onClick={onNavigateToSubmit}
                className="btn btn-outline btn-sm"
              >
                Create New Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="no-tickets-found-box">
            <Search size={40} className="empty-search-icon" />
            <h3>No Tickets Match Your Criteria</h3>
            <p>Try adjusting your status filter, category, or search keywords.</p>
            {isFiltersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
