# Calendar App

A simple, responsive month-view calendar built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. Open `index.html` directly in any modern browser.

![Calendar App screenshot](reference/google%20cal.png)

## Features

- **Month grid** — 7-column layout with overflow days from adjacent months
- **Add events** — click any day to open the event form
- **Edit & delete** — click an event pill to edit or remove it
- **Persistent storage** — events saved to `localStorage` as JSON
- **Validation** — title required; end time must be ≥ start time
- **Responsive** — compact dot-pill layout on mobile (≤ 640 px)
- **Accessible** — WCAG 2.1 AA target; keyboard-navigable day cells and event pills (Tab + Enter/Space), focus restored to trigger element on modal close, `aria-live` announcements on month change, descriptive `aria-label` on all controls, and AA-compliant color contrast throughout

## Getting Started

```bash
git clone https://github.com/sokcheagit/calendar-app-demo.git
cd calendar-app-demo
# Open index.html in your browser — no server needed
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

## Usage

| Action | How |
|--------|-----|
| Navigate months | **‹** / **›** arrows or **Today** button |
| Add an event | Click any day cell |
| Edit an event | Click the event pill |
| Delete an event | Open edit modal → **Delete** |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Move between day cells, event pills, and controls |
| Enter or Space | Open the event modal for the focused day or event |
| Escape | Close modal or sidebar |

## Calendar Categories

Four built-in categories, each with WCAG AA-compliant white-text contrast:

| Calendar  | Color     | Contrast ratio |
|-----------|-----------|----------------|
| Personal  | `#1a73e8` | 4.5 : 1 ✓      |
| Birthdays | `#1a7a4a` | 5.4 : 1 ✓      |
| Family    | `#c0392b` | 5.4 : 1 ✓      |
| Work      | `#8e24aa` | 7.0 : 1 ✓      |

Toggle category visibility with the checkboxes in the sidebar.

## Accessibility

Targets WCAG 2.1 Level AA. Key implementations:

- `role="button"` + `tabindex="0"` on day cells and event pills
- Focus trap cycles Tab/Shift+Tab within the open modal
- `aria-expanded` on the sidebar toggle reflects open/closed state
- `aria-required` and `aria-describedby` wire required fields to their inline error messages
- `role="columnheader"` and full-name `aria-label` on day-of-week headers
- Hidden `aria-live="polite"` region announces the new month on navigation
- `aria-modal="true"` and `aria-labelledby` on the dialog element

## Event Data Model

Events are stored under the `calendar_events` key in `localStorage`:

```json
[
  {
    "id": "1717200000000-4821",
    "title": "Team standup",
    "date": "2026-06-15",
    "startTime": "09:00",
    "endTime": "09:30",
    "calendar": "work",
    "description": "Daily sync"
  }
]
```

`calendar` is one of `personal`, `birthdays`, `family`, or `work`. The display color is derived from the category at render time.

## Project Structure

```
calendar-app-demo/
├── index.html      # Page shell and modal markup
├── style.css       # All styles (Grid layout, modal, responsive)
├── app.js          # All logic (storage, rendering, CRUD, validation)
└── tasks/
    └── todo.md     # Development checklist
```

## Tech Stack

- **HTML5** — semantic markup, ARIA roles
- **CSS3** — CSS Grid, custom properties, `min()`, sticky header
- **JavaScript (ES6+)** — vanilla JS, `localStorage`, no dependencies
