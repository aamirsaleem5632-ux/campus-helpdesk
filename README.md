# 🎓 Campus Helpdesk Portal

A modern, responsive, and feature-rich **Campus Helpdesk System** built inside React with Vite. Designed for students, faculty, and administrative staff to submit incident tickets, track resolution progress in real time, and manage campus-wide operations through an intuitive admin dashboard.

---

## 🚀 Key Features

### 1. 📝 Comprehensive Issue Submission Form
- **Requester Profiles:** Collects student/employee full name, institutional email (`@campus.edu`), university role (Undergraduate, Graduate, Faculty, Staff, Guest), and optional Student ID.
- **Incident Categorization:** Covers 8 specialized campus departments:
  - *IT & Network Support*
  - *Facilities & Maintenance*
  - *Academic & Registrar*
  - *Dormitory & Housing*
  - *Library & Study Spaces*
  - *Campus Safety & Security*
  - *Financial Aid & Billing*
  - *General Inquiry*
- **Priority Matrix:** Low, Medium, High, and Urgent/Critical priority options with visual color indicators.
- **Location Specifier:** Building name, room number, or specific campus zone.
- **File Attachment Simulation:** Support for uploading screenshots or documentation (with file size safety limits).
- **Client-Side Validation:** Instant field error feedback, email pattern validation, and minimum character constraints.
- **Instant Reference Confirmation:** Generates a unique tracking ID (e.g., `CHD-2026-1042`) with a one-click copy button and quick navigation to track the ticket or view it in the dashboard.

### 2. 📊 Workflow Statuses (`Pending` / `In Progress` / `Resolved`)
- **Pending (Amber):** Newly submitted tickets queued for triage and assignment.
- **In Progress (Blue):** Incidents assigned to a technician or specialist with active investigation notes.
- **Resolved (Emerald):** Successfully solved issues with documented resolution details and technician attribution.
- **Audit Timeline:** Every ticket maintains an immutable activity feed recording submission time, status changes, and staff/student notes.

### 3. 🛡️ Staff & Admin Operations Dashboard
- **Executive Metric Cards:**
  - *Total Tickets*
  - *Pending Tickets Count* (highlighted for quick attention)
  - *In Progress Count*
  - *Resolved Count*
  - *Resolution Rate (%)* with dynamic progress visualizer
  - *Urgent Active Incidents Alert*
- **Visual Analytics:**
  - *Incident Volume by Category:* Interactive distribution meter bars with counts and percentages.
  - *Priority & Status Health:* Proportion composite bar and status breakdown.
- **Search & Filter Suite:**
  - Full-text search matching Ticket ID, title, requester name, campus email, and location.
  - One-click status filter tabs with real-time ticket counters.
  - Category and priority dropdown selectors.
  - Multi-criteria sorting (Newest first, Oldest first, Highest priority, Alphabetical).
- **Inline Ticket Controls:**
  - Fast status changer directly within the table.
  - Deep-dive details modal to assign technicians, edit resolution summaries, and review timelines.
  - Safe deletion with two-step confirmation.
- **Data Export & Reset:**
  - One-click **Export to CSV** for administrative spreadsheets.
  - **Export to JSON** for backups.
  - **Reset to Default Sample Data** button to quickly test or restore pre-seeded data.

### 4. 🔍 Student & Public Ticket Tracker
- Direct lookup by **Ticket ID** (e.g. `CHD-2026-1001`) or **Requester Email**.
- 3-stage visual progress stepper:
  1. *Submitted & Logged*
  2. *In Progress & Assigned*
  3. *Resolved & Closed*
- Follow-up communication box allowing requesters to submit additional notes or clarifications that append directly to the ticket timeline.
- Emergency helpdesk telephone hotlines and FAQ sidebar.

### 5. 💾 LocalStorage Persistence & Pre-Seeded Data
- All ticket operations (create, update status, add comments, delete) persist locally in the user's browser under key `campus_helpdesk_tickets_v2`.
- Pre-populated with realistic campus scenarios (Wi-Fi outages, chemistry lab leaks, transcript requests, dorm HVAC repairs, RFID access card glitches) so the system is ready to explore immediately.

### 6. 📱 Responsive & Accessible UI
- Mobile-first, responsive grid architecture optimized for smartphones, tablets, laptops, and ultra-wide desktop monitors.
- Collapsible navigation drawer on mobile viewports.
- High-contrast typography using the *Plus Jakarta Sans* typeface and cohesive university color palette (Navy Blue, Slate, Emerald, and Amber).

---

## 📂 Project Architecture

```
campus-helpdesk/
├── index.html                       # HTML5 entry with Google Fonts preconnect
├── package.json                     # Vite + React 19 dependencies & scripts
├── eslint.config.js                 # Modern flat ESLint configuration
├── vite.config.js                   # Vite configuration
├── README.md                        # Project documentation
└── src/
    ├── main.jsx                     # Application root render
    ├── App.jsx                      # Main controller managing state & views
    ├── App.css                      # Application styling & responsive rules
    ├── index.css                    # Design tokens, CSS variables, resets
    ├── constants/
    │   └── ticketData.js            # Ticket statuses, priorities, categories, & seed data
    ├── services/
    │   └── storage.js               # LocalStorage manager, ID generator, & CSV/JSON export
    └── components/
        ├── Header.jsx               # Responsive navigation, announcements, & counters
        ├── IssueForm.jsx            # Issue submission form with validation & success modal
        ├── AdminDashboard.jsx       # Statistics KPIs, charts, filters, & management table
        ├── TicketTracker.jsx        # Public ticket status tracker & student reply feed
        ├── TicketDetailModal.jsx    # Detailed ticket drawer, status editor, & timeline
        └── Toast.jsx                # Non-intrusive action feedback alerts
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```
Generates a minified, optimized production bundle inside the `dist/` directory.

### 4. Run Code Linter
```bash
npm run lint
```
Verifies code syntax and React Hooks compliance.

---

## 🧪 Testing the Helpdesk System

1. **Submit a Ticket:**
   - Go to the **Submit Issue** tab.
   - Fill out the form fields (e.g. choose *Facilities & Maintenance*, *High* priority, enter a room location).
   - Click **Submit Ticket**.
   - Copy your generated tracking ID or click **Track This Ticket**.

2. **Track the Ticket:**
   - In the **Track Ticket** tab, search your Ticket ID or email.
   - View the current progress stage.
   - Enter a follow-up comment in the reply box to test real-time communication.

3. **Manage in Admin Dashboard:**
   - Switch to the **Admin Dashboard** tab.
   - Observe the live statistical metrics (Total, Pending, In Progress, Resolved, Resolution Rate).
   - Change the ticket status to *In Progress* or *Resolved* via the inline dropdown or the view modal.
   - Notice the status updates immediately reflect on the tracker and in statistics.
   - Test **Export CSV** or **Reset Data** to verify storage persistence.

---

## 📄 License
This project is open-source and intended for academic and campus operations demonstration.
