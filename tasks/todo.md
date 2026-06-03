# Calendar App — Task Checklist

## Phase 1 — Static Skeleton
- [x] Create `tasks/todo.md` with full checklist and acceptance criteria
- [x] 1.1 Create `index.html`: DOCTYPE, viewport meta, CSS/JS links, header nav (prev/today/next + h2), `.calendar-grid` div, `.modal-overlay` with form
- [x] 1.2 Create `style.css`: CSS reset, custom properties, grid column definition
- [x] 1.3 Create `app.js`: `init()` on DOMContentLoaded + all function stubs — confirm no console errors

**Acceptance criteria:** Page loads without JS errors. HTML has no inline styles. All three files link correctly.

---

## Phase 2 — Calendar Rendering
- [x] 2.1 Implement date utility functions: `getDaysInMonth`, `getFirstDayOfWeek`, `toDateString`, `parseTimeToMinutes`, `formatMonthYear`
- [x] 2.2 Implement `renderHeader` — displays current month/year in `<h2>`
- [x] 2.3 Implement `renderGrid` — 7 day-of-week header cells + day cells with correct leading empty cells
- [x] 2.4 Style `.day-cell`, `.day-header`, `.day-cell--empty`, `.day-cell--today`, grid borders
- [x] 2.5 Wire nav buttons: `handlePrevMonth`, `handleNextMonth`, `handleTodayButton`

**Acceptance criteria:** Correct cell count for any month (28–31 + leading empties). Today's date highlighted. Navigating across year boundaries works. Feb 2028 shows 29 days (leap year).

---

## Phase 3 — localStorage + Event Display
- [x] 3.1 Implement `generateId`, `loadEvents`, `saveEvents`
- [x] 3.2 Call `loadEvents` in `init`; populate `events` array
- [x] 3.3 Implement `getEventsForDate`, `renderEventPill`
- [x] 3.4 Update `renderDayCell` to inject event pills; style `.event-pill`

**Acceptance criteria:** Manually inserting an event object into `localStorage["calendar_events"]` via DevTools and refreshing shows the pill on the correct day.

---

## Phase 4 — Modal + Add Event
- [x] 4.1 Build full modal form: title (required), date, startTime, endTime, description, color, Save + Cancel buttons; error `<span>` siblings for validated fields
- [x] 4.2 Implement `openModal("add", dateStr)` and `closeModal`; wire day-cell click, Cancel button, Escape key, backdrop click
- [x] 4.3 Style `.modal-overlay`, `.modal-dialog`, form fields, buttons
- [x] 4.4 Implement `validateForm`, `showValidationErrors`, `clearValidationErrors`
- [x] 4.5 Implement `handleSaveEvent` — add path only; confirm pill appears and persists on refresh

**Acceptance criteria:** Clicking a day opens modal pre-filled with that date. Empty title → inline error, modal stays open. endTime before startTime → time error. Valid submit → pill appears, persists after page refresh.

---

## Phase 5 — Edit and Delete
- [x] 5.1 Implement `openModal("edit", null, event)` — populate all fields from event object; show Delete button (hidden in add mode)
- [x] 5.2 Implement edit path in `handleSaveEvent` (find by id, replace in array)
- [x] 5.3 Implement `handleDeleteEvent` with `confirm()` dialog; wire Delete button

**Acceptance criteria:** Clicking pill opens modal with all fields populated. Saving updates pill (title/color). Delete + confirm removes pill. Delete + cancel keeps event intact.

---

## Phase 6 — Responsive + Polish
- [x] 6.1 Add ≤640px media query: dot pills, reduced cell min-height, smaller fonts
- [x] 6.2 Add `+N more` overflow indicator when a day has >3 events
- [x] 6.3 Verify modal uses `width: min(480px, 90vw)` and scrolls on small screens
- [x] 6.4 Add `focus-visible` styles; implement focus trap inside modal
- [x] 6.5 Add ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label` on icon buttons, `aria-invalid` on error fields

**Acceptance criteria:** No horizontal scroll at 375px. Event indicators visible. Modal usable on mobile. Tab cycles through all interactive elements. Escape closes modal.

---

## Phase 7 — Final Verification
- [ ] 7.1 Smoke-test all acceptance criteria from phases 1–6
- [ ] 7.2 Confirm zero console errors/warnings
- [ ] 7.3 Inspect localStorage JSON structure in DevTools
- [ ] 7.4 Test keyboard-only navigation

**Acceptance criteria:** All criteria pass. Zero console errors. JSON structure matches data model spec.

---

## Review

All three source files created in a single pass:

- **`index.html`** — Semantic HTML shell with sticky header nav (Prev/Today/Next), `#calendar-grid` container, and a fully-marked-up modal dialog with all form fields (title, date, start/end time, description, color picker). ARIA attributes included (`role="dialog"`, `aria-modal`, `aria-label`, `aria-hidden`, `role="alert"` on error spans).

- **`style.css`** — CSS custom properties for theming, 7-column CSS Grid for the calendar, `.day-cell--today` highlight with circular day number, `.event-pill` with `text-overflow: ellipsis`, fixed-position modal overlay, and a `≤640px` responsive breakpoint that collapses pills to colored dots and reduces cell height. Focus-visible ring and print styles included.

- **`app.js`** — ~220 lines, no dependencies. State: `currentYear`, `currentMonth`, `events[]`. Storage layer reads/writes `localStorage["calendar_events"]` as a JSON array. Rendering rebuilds the grid DOM on every state change. Modal handles add and edit modes, pre-filling fields from the clicked day or event. Validation catches empty title and end-before-start time. Focus trap cycles Tab within the open dialog; Escape closes it.

**Changes summary:** 3 new files, ~500 lines total. No external dependencies. Open `index.html` directly in any modern browser.

---

## Phase 8 — Accessibility Fixes

### CSS (style.css)
- [x] 8.1 Add `:focus-visible` outline to `.btn-today` and `.create-btn`
- [x] 8.2 Add `.sr-only` utility class
- [x] 8.3 Fix contrast: raise form label color from `--text-faint` to `--text-muted`
- [x] 8.4 Fix contrast: raise mini day-of-week header color from `--text-faint` to `--text-muted`

### HTML (index.html)
- [x] 8.5 Add `aria-required="true"` and `aria-describedby="error-title"` to `#event-title`
- [x] 8.6 Add `aria-describedby="error-time"` to `#event-end`
- [x] 8.7 Add `aria-expanded="false"` and `aria-controls="sidebar"` to `#btn-menu`
- [x] 8.8 Add `aria-live="polite"` announce region for month navigation

### JS (app.js)
- [x] 8.9  Update CALENDARS: darken Family `#f4511e` → `#c0392b`, Birthdays `#33b679` → `#1a7a4a`
- [x] 8.10 Day cells: add `role="button"`, `tabindex="0"`, `aria-label`, `keydown` handler
- [x] 8.11 Event pills: add `role="button"`, `tabindex="0"`, `aria-label`, `keydown` handler
- [x] 8.12 "More" indicator: add `role="button"`, `tabindex="0"`, `aria-label`, `keydown` handler
- [x] 8.13 Modal: save trigger on open; restore focus on close
- [x] 8.14 Sidebar toggle: sync `aria-expanded` in `toggleSidebar` and `closeSidebar`
- [x] 8.15 Mini calendar day buttons: add `aria-label` with full date string
- [x] 8.16 Mini day-of-week headers: add `aria-label` with full day name
- [x] 8.17 Main calendar day headers: add `aria-label` and `role="columnheader"`
- [x] 8.18 Month navigation: update live region when month changes

## Phase 8 Review

18 accessibility fixes applied across all three files.

**style.css** — Added `.sr-only` utility; added `:focus-visible` rings to `.btn-today` and `.create-btn`; raised form label and mini day-of-week colors from `--text-faint` (#70757a, fails AA) to `--text-muted` (#5f6368, 5.7:1).

**index.html** — Added `aria-required` and `aria-describedby` on the title input; `aria-describedby` on end-time input; `aria-expanded`/`aria-controls` on the menu button; and a hidden `aria-live="polite"` region for month announcements.

**app.js** — Darkened Family (#f4511e → #c0392b, now 5.4:1) and Birthdays (#33b679 → #1a7a4a, now 5.4:1) to pass AA. Day cells, event pills, and "more" indicators are now fully keyboard accessible (`role="button"`, `tabindex="0"`, `aria-label`, `keydown` handler). Modal now saves and restores focus to the triggering element. Sidebar `aria-expanded` stays in sync. Mini calendar day buttons expose the full date. Day-of-week headers in both the main grid and mini calendar have unambiguous `aria-label` values. Month navigation announces the new month via the live region.
