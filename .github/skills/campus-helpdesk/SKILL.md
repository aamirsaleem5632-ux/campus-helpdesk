---
name: campus-helpdesk
description: Reusable agent skill for developing, maintaining, and extending the Campus Helpdesk React application. Covers component architecture, responsive and accessible design, form validation, ticket status workflows, dashboard analytics, testing, and error reporting.
---

# Campus Helpdesk Agent Skill

This skill provides comprehensive architectural guidelines, operational rules, and development practices for maintaining and extending the **Campus Helpdesk React Project**. Whenever modifying or adding features to this codebase, follow these standardized instructions.

---

## 1. Writing Clean, Reusable React Components

- **Functional Components & Hooks:**
  - Build purely functional components using modern React 19 standards.
  - Keep components modular, focused, and single-purpose (e.g., separate presentation components like `Toast` and `Header` from domain containers like `AdminDashboard` and `IssueForm`).
- **Idiomatic State Management & Lazy Initialization:**
  - When loading initial data from `localStorage` or external storage, **always** use lazy state initializers to prevent cascading renders and strict lint errors:
    ```javascript
    // Correct: Lazy initializer
    const [tickets, setTickets] = useState(() => loadTickets());

    // Avoid: Synchronous setState inside useEffect
    useEffect(() => { setTickets(loadTickets()); }, []);
    ```
- **Deriving State Instead of Duplicating:**
  - Derive computed values (filtered ticket lists, search results, active ticket selections) via `useMemo` or plain render logic rather than maintaining redundant state slices that can fall out of sync.
- **Centralized Constants:**
  - Never hardcode status strings, priority levels, or category names. Reference them from `src/constants/ticketData.js` (`TICKET_STATUSES`, `TICKET_PRIORITIES`, `TICKET_CATEGORIES`, `STATUS_CONFIG`, `PRIORITY_CONFIG`).
- **Strict Lint Compliance:**
  - Eliminate all unused variables, parameters, and imports.
  - Do not import `React` directly when using JSX with the modern React 19 JSX transform (import only specific hooks like `{ useState, useMemo, useEffect }`).

---

## 2. Creating Responsive & Accessible UI

- **Semantic HTML Structure:**
  - Use proper landmarks: `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, and `<footer>`.
  - Ensure all buttons have explicit `type="button"` or `type="submit"` attributes.
  - Provide `aria-label` or text descriptions for icon-only action buttons (e.g., delete buttons, close dialogs).
- **Responsive Layout Strategy:**
  - Follow mobile-first and fluid layout principles. Use CSS variables defined in `src/index.css` for consistent spacing, colors, borders, and shadows.
  - Support multi-device breakpoints:
    - **Desktop (1024px+):** Full multi-column grids, data tables with inline quick status selectors, expanded sidebars.
    - **Tablet (768px – 1024px):** 2-column KPI grids, collapsed sidebar into a stacked view.
    - **Mobile (< 768px):** Navigation hamburger drawer, 1-column forms, touch-friendly tap targets (minimum 44x44px), full-width action buttons.
- **Color Contrast & Readability:**
  - Maintain WCAG AA compliant contrast ratios between text and background.
  - Pair color-coded badges (e.g., Amber for Pending, Blue for In Progress, Green for Resolved, Rose for Urgent) with accompanying text labels and icons so that status is never conveyed by color alone.

---

## 3. Validating Student Issue Forms

- **Required Fields & Constraints:**
  - **Full Name:** Required, non-empty string after trimming.
  - **Campus Email:** Required; must pass regex validation:
    ```javascript
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    ```
  - **Campus Location & Room:** Required; must specify physical location (e.g. "Science Hall, Room 304").
  - **Issue Summary / Title:** Required; minimum 5 characters, maximum 120 characters.
  - **Detailed Description:** Required; minimum 15 characters to ensure sufficient troubleshooting context.
  - **Category & Priority:** Must match valid entries from `TICKET_CATEGORIES` and `TICKET_PRIORITIES`.
- **Attachment Upload Validation:**
  - Enforce simulated or actual file upload limits (e.g., maximum 5MB, accepted formats: images, PDF, text documents).
- **User Experience on Validation Failure:**
  - Render clear, localized inline error messages directly under the offending inputs.
  - Highlight the invalid input borders with an error state (`form-input-error`).
  - Smooth-scroll the viewport to the first invalid field so mobile users immediately see what requires correction.
- **Submission Confirmation:**
  - Display a clear success card containing the unique ticket tracking code (e.g. `CHD-2026-XXXX`).
  - Provide a one-click copy button and quick-action navigation buttons ("Track This Ticket", "View in Dashboard", "Submit Another").

---

## 4. Managing `Pending`, `In Progress`, and `Resolved` Statuses

- **Status Definitions:**
  - `Pending`: Newly submitted ticket awaiting staff review, triage, or assignment.
  - `In Progress`: Under active investigation or repair by an assigned campus technician.
  - `Resolved`: Work completed, verified, and issue closed.
- **Audit Timeline Logging:**
  - Every status change **must** record an immutable event entry to the ticket's `timeline` array:
    ```javascript
    {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      action: `Status changed to ${newStatus}`,
      by: staffName || 'Helpdesk Admin',
      note: resolutionNotes || 'Status updated via Helpdesk Portal'
    }
    ```
- **Resolution Requirements:**
  - When transitioning a ticket to `Resolved`, prompt for a **Resolution Summary** and **Assigned Technician** name to explain how the issue was fixed.
- **Immediate State & Storage Synchronization:**
  - Every status modification must immediately update React state and synchronize to `localStorage` under `campus_helpdesk_tickets_v2`.

---

## 5. Keeping Dashboard Statistics Accurate

- **Live Computed Metrics:**
  - Calculate all dashboard metrics directly from the current tickets array using `useMemo`:
    ```javascript
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === TICKET_STATUSES.PENDING).length;
    const inProgress = tickets.filter(t => t.status === TICKET_STATUSES.IN_PROGRESS).length;
    const resolved = tickets.filter(t => t.status === TICKET_STATUSES.RESOLVED).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const urgentCount = tickets.filter(t => t.priority === TICKET_PRIORITIES.URGENT && t.status !== TICKET_STATUSES.RESOLVED).length;
    ```
- **Category & Priority Distribution:**
  - Count incidents across all categories and priorities dynamically. Ensure the sum of individual counts always matches `total`.
- **Search & Filter Integrity:**
  - When filtering by status tabs, categories, or text queries, ensure the "Showing X of Y tickets" counter accurately reflects the filtered count vs total tickets.
  - Provide a visible "Reset All Filters" button whenever filters return zero results.

---

## 6. Testing Changes and Running `npm run build`

Before considering any change or feature complete, execute the following verification pipeline:

1. **Lint Check:**
   ```powershell
   npm run lint
   ```
   - Must exit with code `0`.
   - Resolve any ESLint warnings or errors (including React Hooks dependency rules and unused variables).

2. **Production Build:**
   ```powershell
   npm run build
   ```
   - Must compile with Vite cleanly and output production bundles without errors.
   - Verify that CSS and JavaScript bundles are correctly generated in `dist/`.

3. **Storage & Persistence Testing:**
   - Verify that tickets created in the submission form persist after a full page reload.
   - Verify that status updates, timeline notes, and ticket deletions persist across sessions.
   - Test the "Reset to Sample Data" button to ensure fallback data loads seamlessly.

4. **Public Tracker Verification:**
   - Verify lookup both by **Ticket ID** (exact & partial) and by **Campus Email**.
   - Ensure the student follow-up reply box appends new notes to the ticket timeline correctly.

---

## 7. Reporting Errors Honestly

- **Transparency First:**
  - Never conceal, minimize, or fabricate test results. If a linter rule fails or Vite reports a syntax/import error, state the exact error message and the file/line number.
- **Root-Cause Analysis:**
  - Clearly explain *why* an error occurred (e.g., synchronous `setState` inside an effect causing cascading renders, unhandled null values in storage, missing CSS variable).
- **Actionable Remediation:**
  - Provide the exact code fix or structural adjustment needed to resolve the issue permanently.
  - Re-run `npm run lint` and `npm run build` to prove that the fix eliminated the error.
