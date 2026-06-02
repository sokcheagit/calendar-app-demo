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
