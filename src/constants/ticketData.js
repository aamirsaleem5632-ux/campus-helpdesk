export const TICKET_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
};

export const STATUS_CONFIG = {
  [TICKET_STATUSES.PENDING]: {
    label: 'Pending',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
    badgeClass: 'badge-pending',
    description: 'Awaiting triage and assignment'
  },
  [TICKET_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#2563eb',
    bgColor: '#dbeafe',
    borderColor: '#bfdbfe',
    badgeClass: 'badge-inprogress',
    description: 'Technician actively investigating'
  },
  [TICKET_STATUSES.RESOLVED]: {
    label: 'Resolved',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
    badgeClass: 'badge-resolved',
    description: 'Issue successfully addressed and closed'
  }
};

export const TICKET_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

export const PRIORITY_CONFIG = {
  [TICKET_PRIORITIES.LOW]: {
    label: 'Low',
    color: '#475569',
    bgColor: '#f1f5f9',
    badgeClass: 'priority-low'
  },
  [TICKET_PRIORITIES.MEDIUM]: {
    label: 'Medium',
    color: '#b45309',
    bgColor: '#fef3c7',
    badgeClass: 'priority-medium'
  },
  [TICKET_PRIORITIES.HIGH]: {
    label: 'High',
    color: '#c2410c',
    bgColor: '#ffedd5',
    badgeClass: 'priority-high'
  },
  [TICKET_PRIORITIES.URGENT]: {
    label: 'Urgent',
    color: '#be123c',
    bgColor: '#ffe4e6',
    badgeClass: 'priority-urgent'
  }
};

export const TICKET_CATEGORIES = [
  'IT & Network Support',
  'Facilities & Maintenance',
  'Academic & Registrar',
  'Dormitory & Housing',
  'Library & Study Spaces',
  'Campus Safety & Security',
  'Financial Aid & Billing',
  'General Inquiry'
];

export const USER_ROLES = [
  'Undergraduate Student',
  'Graduate Student',
  'Faculty Member',
  'Campus Staff',
  'Campus Visitor / Guest'
];

export const INITIAL_TICKETS = [
  {
    id: 'CHD-2026-1001',
    title: 'Wi-Fi disconnecting intermittently in Library 2nd Floor',
    description: 'Students on the north side of the 2nd-floor library experience frequent dropped connections to campus Wi-Fi every 10 minutes while streaming lectures.',
    category: 'IT & Network Support',
    priority: 'High',
    status: 'In Progress',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sarah.j@campus.edu',
    requesterRole: 'Undergraduate Student',
    studentId: 'STU-94021',
    location: 'Main Library, 2nd Floor North Study Area',
    createdAt: '2026-10-15T09:15:00.000Z',
    updatedAt: '2026-10-16T11:30:00.000Z',
    assignedTo: 'Marcus Chen (Network Infrastructure)',
    resolutionNotes: 'Technician dispatched to replace the wireless access point AP-L2-N. Channel interference also addressed.',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-15T09:15:00.000Z',
        action: 'Ticket Created',
        by: 'Sarah Jenkins',
        note: 'Issue reported online via student portal'
      },
      {
        id: 't-2',
        date: '2026-10-15T10:45:00.000Z',
        action: 'Status changed to In Progress',
        by: 'IT Dispatch',
        note: 'Assigned to Network Infrastructure team'
      },
      {
        id: 't-3',
        date: '2026-10-16T11:30:00.000Z',
        action: 'Note Added',
        by: 'Marcus Chen',
        note: 'Replacing faulty AP hardware on ceiling mount'
      }
    ],
    attachment: 'wifi_speed_screenshot.png'
  },
  {
    id: 'CHD-2026-1002',
    title: 'Water leak under sink in Science Hall Room 304',
    description: 'Constant dripping water under chemistry lab sink #3. Basin is filling up with water and could cause floor water damage if not repaired quickly.',
    category: 'Facilities & Maintenance',
    priority: 'Urgent',
    status: 'Pending',
    requesterName: 'Dr. Robert Martinez',
    requesterEmail: 'r.martinez@campus.edu',
    requesterRole: 'Faculty Member',
    studentId: 'FAC-4102',
    location: 'Science Hall, Room 304 (Organic Chem Lab)',
    createdAt: '2026-10-17T08:20:00.000Z',
    updatedAt: '2026-10-17T08:20:00.000Z',
    assignedTo: 'Unassigned',
    resolutionNotes: '',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-17T08:20:00.000Z',
        action: 'Ticket Created',
        by: 'Dr. Robert Martinez',
        note: 'High priority plumbing ticket submitted'
      }
    ],
    attachment: null
  },
  {
    id: 'CHD-2026-1003',
    title: 'Transcript request not updating on Student Portal',
    description: 'Submitted graduation transcript order last Tuesday but status remains in processing with no tracking number generated.',
    category: 'Academic & Registrar',
    priority: 'Medium',
    status: 'Resolved',
    requesterName: 'Liam Patterson',
    requesterEmail: 'l.patterson@campus.edu',
    requesterRole: 'Undergraduate Student',
    studentId: 'STU-65823',
    location: 'Administration Building / Online',
    createdAt: '2026-10-12T14:00:00.000Z',
    updatedAt: '2026-10-14T16:45:00.000Z',
    assignedTo: 'Elena Rostova (Registrar Office)',
    resolutionNotes: 'Order cleared manual hold. Electronic certified transcript dispatched to requested recipient email on Oct 14.',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-12T14:00:00.000Z',
        action: 'Ticket Created',
        by: 'Liam Patterson',
        note: 'Inquiry submitted'
      },
      {
        id: 't-2',
        date: '2026-10-13T10:00:00.000Z',
        action: 'Status changed to In Progress',
        by: 'Elena Rostova',
        note: 'Reviewing registrar records hold queue'
      },
      {
        id: 't-3',
        date: '2026-10-14T16:45:00.000Z',
        action: 'Status changed to Resolved',
        by: 'Elena Rostova',
        note: 'Transcript dispatched and verification email sent to student'
      }
    ],
    attachment: null
  },
  {
    id: 'CHD-2026-1004',
    title: 'AC unit blowing warm air in Oak Hall Dorm Room 212',
    description: 'Room thermostat is set to 70°F but the AC unit only blows room temperature air. Room temperature has reached 82°F today.',
    category: 'Dormitory & Housing',
    priority: 'High',
    status: 'Pending',
    requesterName: 'Chloe Bennett',
    requesterEmail: 'c.bennett@campus.edu',
    requesterRole: 'Undergraduate Student',
    studentId: 'STU-71934',
    location: 'Oak Hall Residence, Room 212',
    createdAt: '2026-10-16T18:10:00.000Z',
    updatedAt: '2026-10-16T18:10:00.000Z',
    assignedTo: 'Unassigned',
    resolutionNotes: '',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-16T18:10:00.000Z',
        action: 'Ticket Created',
        by: 'Chloe Bennett',
        note: 'HVAC repair requested'
      }
    ],
    attachment: null
  },
  {
    id: 'CHD-2026-1005',
    title: 'RFID student card scanner not recognizing cards at West Gate',
    description: 'Card reader turns red for every student trying to enter through West Pedestrian Gate. Security officer had to manually buzz students in.',
    category: 'Campus Safety & Security',
    priority: 'Urgent',
    status: 'In Progress',
    requesterName: 'Officer Jamal Vance',
    requesterEmail: 'j.vance@campus.edu',
    requesterRole: 'Campus Staff',
    studentId: 'STF-1029',
    location: 'West Campus Pedestrian Gate',
    createdAt: '2026-10-17T07:15:00.000Z',
    updatedAt: '2026-10-17T08:45:00.000Z',
    assignedTo: 'Campus Security Tech Services',
    resolutionNotes: '',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-17T07:15:00.000Z',
        action: 'Ticket Created',
        by: 'Officer Jamal Vance',
        note: 'Access gate malfunction reported'
      },
      {
        id: 't-2',
        date: '2026-10-17T08:45:00.000Z',
        action: 'Status changed to In Progress',
        by: 'Security Operations',
        note: 'Card reader sync daemon restarting'
      }
    ],
    attachment: null
  },
  {
    id: 'CHD-2026-1006',
    title: 'High-speed printer paper jam & toner empty in Student Union Lab',
    description: 'Printer B in Student Union 2nd floor media center is displaying error #042 paper jam and low toner message.',
    category: 'IT & Network Support',
    priority: 'Low',
    status: 'Resolved',
    requesterName: 'Kevin Zhao',
    requesterEmail: 'k.zhao@campus.edu',
    requesterRole: 'Graduate Student',
    studentId: 'STU-51209',
    location: 'Student Union, Room 204 Computer Lab',
    createdAt: '2026-10-14T11:20:00.000Z',
    updatedAt: '2026-10-14T13:10:00.000Z',
    assignedTo: 'Student Tech Assistants',
    resolutionNotes: 'Removed stuck sheet from feeder rollers and installed fresh HP Black High-Yield toner cartridge.',
    timeline: [
      {
        id: 't-1',
        date: '2026-10-14T11:20:00.000Z',
        action: 'Ticket Created',
        by: 'Kevin Zhao',
        note: 'Reported during midterm week'
      },
      {
        id: 't-2',
        date: '2026-10-14T13:10:00.000Z',
        action: 'Status changed to Resolved',
        by: 'Student Tech Assistant Alex',
        note: 'Paper jam cleared, toner replaced, test page printed successfully'
      }
    ],
    attachment: null
  }
];
