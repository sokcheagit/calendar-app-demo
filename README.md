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
- **Accessible** — keyboard navigation, focus trap in modal, ARIA attributes

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
    "description": "Daily sync",
    "color": "#1a73e8"
  }
]
```

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
