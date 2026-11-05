/**
 * University Helpdesk Knowledge Base & Department Directory
 * Verified reference data for Resolution and Routing agents.
 */

export const UNIVERSITY_DEPARTMENTS = [
  {
    id: 'it-support',
    name: 'IT & Network Support',
    category: 'IT & Network Support',
    team: 'Network Infrastructure & End-User Support',
    building: 'Library Ground Floor, Room 102',
    email: 'helpdesk@campus.edu',
    phone: '(555) 019-4357',
    slaHours: 4,
    escalationContact: 'Network Ops Director'
  },
  {
    id: 'facilities-maintenance',
    name: 'Facilities & Maintenance',
    category: 'Facilities & Maintenance',
    team: 'Physical Plant & Trade Services',
    building: 'Service Building B, Suite 100',
    email: 'facilities@campus.edu',
    phone: '(555) 019-3224',
    slaHours: 6,
    escalationContact: 'Campus Facilities Manager'
  },
  {
    id: 'academic-registrar',
    name: 'Academic & Registrar',
    category: 'Academic & Registrar',
    team: 'Office of the Registrar & Student Records',
    building: 'Administration Hall, 1st Floor',
    email: 'registrar@campus.edu',
    phone: '(555) 019-7100',
    slaHours: 24,
    escalationContact: 'Associate Registrar'
  },
  {
    id: 'housing-reslife',
    name: 'Dormitory & Housing',
    category: 'Dormitory & Housing',
    team: 'Residence Life Facilities & Maintenance',
    building: 'Central Quad Hall, Office 10',
    email: 'housing@campus.edu',
    phone: '(555) 019-2180',
    slaHours: 8,
    escalationContact: 'Director of Residence Life'
  },
  {
    id: 'library-spaces',
    name: 'Library & Study Spaces',
    category: 'Library & Study Spaces',
    team: 'University Libraries User Services',
    building: 'Main Library, 1st Floor Circulation Desk',
    email: 'library@campus.edu',
    phone: '(555) 019-5500',
    slaHours: 12,
    escalationContact: 'Head of Access Services'
  },
  {
    id: 'campus-safety',
    name: 'Campus Safety & Security',
    category: 'Campus Safety & Security',
    team: 'Department of Public Safety & Dispatch',
    building: 'Public Safety Center, North Entrance',
    email: 'safety@campus.edu',
    phone: '(555) 019-9111',
    slaHours: 1,
    escalationContact: 'Captain of Public Safety'
  },
  {
    id: 'financial-aid',
    name: 'Financial Aid & Billing',
    category: 'Financial Aid & Billing',
    team: 'Bursar & Student Financial Services',
    building: 'Student Services Center, Suite 200',
    email: 'financialaid@campus.edu',
    phone: '(555) 019-8400',
    slaHours: 24,
    escalationContact: 'Bursar Lead Officer'
  },
  {
    id: 'general-inquiry',
    name: 'General Inquiry',
    category: 'General Inquiry',
    team: 'Student Affairs Information Center',
    building: 'Campus Center Atrium',
    email: 'info@campus.edu',
    phone: '(555) 019-1000',
    slaHours: 48,
    escalationContact: 'Student Affairs Coordinator'
  }
];

export const VERIFIED_FAQS = [
  {
    id: 'faq-wifi-drop',
    category: 'IT & Network Support',
    keywords: ['wifi', 'wi-fi', 'connection', 'internet', 'disconnecting', 'network', 'eduroam'],
    problem: 'Campus Wi-Fi (eduroam / Campus-Secure) dropping connection intermittently or cannot authenticate.',
    verifiedSteps: [
      'Forget the network "Campus-Secure" or "eduroam" in your device Wi-Fi settings.',
      'Ensure you enter your full university email (e.g., student@campus.edu), not just your username.',
      'Check if the campus certificate "CampusRootCA2026" is trusted on your device.',
      'Renew DHCP Lease in device network settings to obtain a fresh IP address.',
      'If in a classroom or library with multiple users, note the room number and report AP channel congestion.'
    ],
    officialPolicy: 'Campus IT guarantees coverage in academic buildings and dorms. Known maintenance occurs Tuesdays 3:00 AM - 5:00 AM.',
    canSelfResolve: true
  },
  {
    id: 'faq-projector-av',
    category: 'IT & Network Support',
    keywords: ['projector', 'av', 'hdmi', 'flickering', 'screen', 'audio', 'auditorium', 'classroom'],
    problem: 'Classroom projector or AV system is flickering, dim, or not recognizing laptop input.',
    verifiedSteps: [
      'Verify HDMI/USB-C cable is firmly seated into both the podium input panel and your laptop.',
      'Press Windows + P (or Mac Display Settings) and verify "Duplicate" or "Mirror" display mode is active.',
      'Check the Crestron / Extron wall touchscreen and cycle the input source between Laptop and Podium PC.',
      'If the lamp warning LED is blinking amber/red, do not attempt to open the ceiling mount.'
    ],
    officialPolicy: 'Immediate technician dispatch available for ongoing scheduled classes by calling hotkey #5 on podium phone.',
    canSelfResolve: false
  },
  {
    id: 'faq-water-leak',
    category: 'Facilities & Maintenance',
    keywords: ['water', 'leak', 'pipe', 'sink', 'plumbing', 'flood', 'drain', 'lab', 'washbasin'],
    problem: 'Water leak or pooling under sinks, ceilings, or laboratory basins.',
    verifiedSteps: [
      'Locate and turn clockwise the local shutoff valve under the basin if safe and accessible.',
      'Place a waste container or bucket under the drip to contain floor saturation.',
      'Keep electrical cords and power strips away from standing water.',
      'Vacate the immediate area if chemical storage or high voltage electrical panels are nearby.'
    ],
    officialPolicy: 'Plumbing and water leaks are treated as Priority High/Urgent to avoid structural damage or mold growth.',
    canSelfResolve: false
  },
  {
    id: 'faq-dorm-hvac',
    category: 'Dormitory & Housing',
    keywords: ['ac', 'hvac', 'heat', 'heating', 'cold', 'warm', 'thermostat', 'dorm', 'room', 'temperature'],
    problem: 'Dorm room air conditioning or heating unit blowing room temperature air or thermostat not responding.',
    verifiedSteps: [
      'Ensure room windows and exterior doors are fully latched; building HVAC automatic sensors disable cooling when windows are open.',
      'Verify the intake vent underneath the unit is not blocked by laundry, rugs, or furniture (maintain 18-inch clearance).',
      'Toggle the thermostat mode switch firmly from Off to Auto/Cool.',
      'Check if building-wide seasonal changeover is in progress (Facilities announces spring/fall switchover dates).'
    ],
    officialPolicy: 'Housing policy permits temporary portable fans/heaters provided by Residence Life when room temperature exceeds 80°F or drops below 65°F.',
    canSelfResolve: true
  },
  {
    id: 'faq-transcript-hold',
    category: 'Academic & Registrar',
    keywords: ['transcript', 'hold', 'registrar', 'grades', 'records', 'graduation', 'diploma'],
    problem: 'Transcript order placed on hold or status not updating on student portal.',
    verifiedSteps: [
      'Log into the Student Information System (SIS) and check the "Holds & Alerts" tab.',
      'Verify there are no outstanding library fines, parking tickets, or health immunization holds.',
      'Confirm billing balance is settled with the Bursar Office.',
      'Electronic certified PDF transcripts are dispatched within 1-2 business days once all administrative holds clear.'
    ],
    officialPolicy: 'The Registrar cannot manually release official transcripts while a financial or academic integrity hold is active.',
    canSelfResolve: true
  },
  {
    id: 'faq-rfid-access',
    category: 'Campus Safety & Security',
    keywords: ['card', 'id card', 'rfid', 'keycard', 'swipe', 'access', 'gate', 'locked out', 'dorm door'],
    problem: 'Campus ID card not unlocking residence hall door, computer lab, or parking gate.',
    verifiedSteps: [
      'Hold the physical card flat against the RFID reader for 3 full seconds until the LED illuminates.',
      'Do not keep other RFID transit cards or credit cards in the same wallet sleeve to avoid signal collision.',
      'Check if your term registration is complete; card access activates 48 hours before move-in date.',
      'For after-hours lockout assistance, contact the Residence Advisor on duty or Campus Safety Dispatch.'
    ],
    officialPolicy: 'Lost or damaged cards can be reprinted at the Campus Card Office (Student Union 105) for a $15 replacement fee.',
    canSelfResolve: false
  },
  {
    id: 'faq-financial-aid',
    category: 'Financial Aid & Billing',
    keywords: ['financial aid', 'fafsa', 'scholarship', 'billing', 'tuition', 'disbursement', 'refund', 'payment'],
    problem: 'Financial aid not disbursed, tuition bill incorrect, or late fee assessed unfairly.',
    verifiedSteps: [
      'Verify FAFSA / institutional aid documents are marked "Complete" on the Financial Aid Portal.',
      'Confirm enrollment meets minimum credit hour requirements (12 credits for full-time undergraduate aid).',
      'Check if Master Promissory Note (MPN) and Entrance Counseling have been completed.',
      'Submit an official Billing Dispute Form before the tuition deadline to freeze automatic late fees.'
    ],
    officialPolicy: 'Late fees are automatically waived while an official financial aid verification appeal is under active review.',
    canSelfResolve: true
  }
];

