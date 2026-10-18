import { INITIAL_TICKETS } from '../constants/ticketData';

const STORAGE_KEY = 'campus_helpdesk_tickets_v2';

export const loadTickets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
    return INITIAL_TICKETS;
  } catch (error) {
    console.error('Failed to load tickets from localStorage:', error);
    return INITIAL_TICKETS;
  }
};

export const saveTickets = (tickets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error('Failed to save tickets to localStorage:', error);
  }
};

export const resetTicketsToDefault = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
    return [...INITIAL_TICKETS];
  } catch (error) {
    console.error('Failed to reset tickets:', error);
    return INITIAL_TICKETS;
  }
};

export const generateTicketId = () => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CHD-${currentYear}-${randomSuffix}`;
};

export const exportTicketsToJSON = (tickets) => {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `campus-helpdesk-tickets-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
};

export const exportTicketsToCSV = (tickets) => {
  try {
    const headers = [
      'Ticket ID',
      'Title',
      'Status',
      'Priority',
      'Category',
      'Requester Name',
      'Email',
      'Role',
      'Location',
      'Created Date',
      'Assigned To',
      'Resolution Notes'
    ];

    const rows = tickets.map(t => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.category}"`,
      `"${(t.requesterName || '').replace(/"/g, '""')}"`,
      `"${t.requesterEmail || ''}"`,
      `"${t.requesterRole || ''}"`,
      `"${(t.location || '').replace(/"/g, '""')}"`,
      `"${new Date(t.createdAt).toLocaleDateString()}"`,
      `"${(t.assignedTo || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `campus-helpdesk-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (err) {
    console.error('CSV export failed:', err);
    return false;
  }
};
