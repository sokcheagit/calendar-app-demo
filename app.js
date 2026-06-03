'use strict';

// ── State ────────────────────────────────────────────────────
let currentYear;
let currentMonth;
let selectedDate = null;      // currently highlighted date (ISO string)
let events = [];
let editingEventId = null;
let modalTrigger = null;

const STORAGE_KEY = 'calendar_events';
const VISIBILITY_KEY = 'calendar_visibility';
const MAX_PILLS = 3;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MINI_DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MINI_DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Named calendars (categories). Each event belongs to one.
const CALENDARS = [
  { id: 'personal',  name: 'Personal',  color: '#1a73e8' },
  { id: 'birthdays', name: 'Birthdays', color: '#1a7a4a' },
  { id: 'family',    name: 'Family',    color: '#c0392b' },
  { id: 'work',      name: 'Work',      color: '#8e24aa' },
];
let visibility = {};          // { calendarId: boolean }

// ── Storage ──────────────────────────────────────────────────
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEvents(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function loadVisibility() {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(VISIBILITY_KEY)) || {}; } catch { stored = {}; }
  const vis = {};
  CALENDARS.forEach(c => { vis[c.id] = stored[c.id] !== false; }); // default visible
  return vis;
}

function saveVisibility() {
  localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibility));
}

function generateId() {
  return Date.now() + '-' + (Math.floor(Math.random() * 9000) + 1000);
}

function getCalendar(id) {
  return CALENDARS.find(c => c.id === id) || CALENDARS[0];
}

// Resolve an event's display color from its calendar (back-compat: fall back to stored color).
function eventColor(ev) {
  if (ev.calendar) return getCalendar(ev.calendar).color;
  return ev.color || CALENDARS[0].color;
}

// ── Date utilities ───────────────────────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(timeStr) {
  const mins = parseTimeToMinutes(timeStr);
  if (mins === null) return '';
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, '0')}${ampm}`;
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getTodayString() {
  const t = new Date();
  return toDateString(t.getFullYear(), t.getMonth(), t.getDate());
}

// ── Main render ──────────────────────────────────────────────
function renderCalendar() {
  renderHeader();
  renderGrid();
  renderMiniCalendar();
}

function renderHeader() {
  const label = formatMonthYear(currentYear, currentMonth);
  document.getElementById('month-label').textContent = label;
  document.getElementById('calendar-announce').textContent = label;
}

function renderGrid() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  DAY_NAMES.forEach((name, i) => {
    const cell = document.createElement('div');
    cell.className = 'day-header';
    cell.textContent = name;
    cell.setAttribute('role', 'columnheader');
    cell.setAttribute('aria-label', DAY_NAMES_FULL[i]);
    grid.appendChild(cell);
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayStr = getTodayString();

  // Leading overflow days (previous month)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    grid.appendChild(renderDayCell(day, toDateString(prevYear, prevMonth, day), todayStr, true));
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    grid.appendChild(renderDayCell(day, toDateString(currentYear, currentMonth, day), todayStr, false));
  }

  // Trailing overflow days (next month)
  const totalCells = firstDay + daysInMonth;
  const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= trailing; day++) {
    grid.appendChild(renderDayCell(day, toDateString(nextYear, nextMonth, day), todayStr, true));
  }
}

function renderDayCell(day, dateStr, todayStr, isOverflow) {
  const cell = document.createElement('div');
  let cls = 'day-cell';
  if (isOverflow) cls += ' day-cell--overflow';
  if (dateStr === todayStr) cls += ' day-cell--today';
  cell.className = cls;

  const num = document.createElement('div');
  num.className = 'day-number';

  if (isOverflow && day === 1) {
    const parts = dateStr.split('-');
    num.textContent = new Date(+parts[0], +parts[1] - 1, 1)
      .toLocaleString('default', { month: 'short' }) + ' 1';
    num.classList.add('day-number--month-label');
  } else {
    num.textContent = day;
  }
  cell.appendChild(num);

  const dayEvents = getEventsForDate(dateStr);
  const visible = dayEvents.slice(0, MAX_PILLS);
  const overflow = dayEvents.length - MAX_PILLS;

  visible.forEach(ev => cell.appendChild(renderEventPill(ev)));

  if (overflow > 0) {
    const more = document.createElement('div');
    more.className = 'more-indicator';
    more.textContent = `+${overflow} more`;
    more.setAttribute('role', 'button');
    more.setAttribute('tabindex', '0');
    more.setAttribute('aria-label', `${overflow} more event${overflow > 1 ? 's' : ''}`);
    more.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); }
    });
    cell.appendChild(more);
  }

  const d = new Date(dateStr + 'T00:00:00');
  const fullDate = d.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', `${fullDate}, add event`);
  cell.addEventListener('click', () => openModal('add', dateStr, null));
  cell.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('add', dateStr, null, cell); }
  });
  return cell;
}

function renderEventPill(ev) {
  const pill = document.createElement('div');
  pill.className = 'event-pill';
  pill.style.backgroundColor = eventColor(ev);
  pill.title = ev.title;

  if (ev.startTime) {
    const time = document.createElement('span');
    time.className = 'pill-time';
    time.textContent = formatTime(ev.startTime);
    pill.appendChild(time);
  }
  pill.appendChild(document.createTextNode(ev.title));

  const pillLabel = ev.startTime ? `${ev.title}, ${formatTime(ev.startTime)}` : ev.title;
  pill.setAttribute('role', 'button');
  pill.setAttribute('tabindex', '0');
  pill.setAttribute('aria-label', pillLabel);
  pill.addEventListener('click', e => {
    e.stopPropagation();
    openModal('edit', null, ev, pill);
  });
  pill.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); openModal('edit', null, ev, pill); }
  });
  return pill;
}

function getEventsForDate(dateStr) {
  return events
    .filter(ev => ev.date === dateStr)
    .filter(ev => visibility[ev.calendar || 'personal'] !== false)
    .sort((a, b) => (a.startTime || '') < (b.startTime || '') ? -1 : 1);
}

// ── Mini calendar ────────────────────────────────────────────
function renderMiniCalendar() {
  document.getElementById('mini-title').textContent = formatMonthYear(currentYear, currentMonth);

  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';

  MINI_DOW.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'mini-dow';
    el.textContent = d;
    el.setAttribute('aria-label', MINI_DOW_FULL[i]);
    grid.appendChild(el);
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayStr = getTodayString();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    grid.appendChild(miniDay(prevMonthDays - i, toDateString(prevYear, prevMonth, prevMonthDays - i), todayStr, true));
  }
  for (let day = 1; day <= daysInMonth; day++) {
    grid.appendChild(miniDay(day, toDateString(currentYear, currentMonth, day), todayStr, false));
  }
  const totalCells = firstDay + daysInMonth;
  const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= trailing; day++) {
    grid.appendChild(miniDay(day, toDateString(nextYear, nextMonth, day), todayStr, true));
  }
}

function miniDay(day, dateStr, todayStr, isOverflow) {
  const btn = document.createElement('button');
  let cls = 'mini-day';
  if (isOverflow) cls += ' mini-day--overflow';
  if (dateStr === todayStr) cls += ' mini-day--today';
  if (dateStr === selectedDate) cls += ' mini-day--selected';
  btn.className = cls;
  btn.textContent = day;
  const d = new Date(dateStr + 'T00:00:00');
  btn.setAttribute('aria-label', d.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  btn.addEventListener('click', () => {
    const parts = dateStr.split('-');
    currentYear = +parts[0];
    currentMonth = +parts[1] - 1;
    selectedDate = dateStr;
    renderCalendar();
  });
  return btn;
}

// ── My calendars list ────────────────────────────────────────
function renderCalendarList() {
  const list = document.getElementById('calendar-list');
  list.innerHTML = '';

  CALENDARS.forEach(cal => {
    const li = document.createElement('li');
    li.className = 'calendar-item';
    li.style.color = cal.color;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `cal-${cal.id}`;
    cb.checked = visibility[cal.id] !== false;
    cb.addEventListener('change', () => {
      visibility[cal.id] = cb.checked;
      saveVisibility();
      renderGrid();
    });

    const label = document.createElement('label');
    label.htmlFor = `cal-${cal.id}`;
    label.textContent = cal.name;

    li.appendChild(cb);
    li.appendChild(label);
    list.appendChild(li);
  });
}

function populateCalendarSelect() {
  const select = document.getElementById('event-calendar');
  select.innerHTML = '';
  CALENDARS.forEach(cal => {
    const opt = document.createElement('option');
    opt.value = cal.id;
    opt.textContent = cal.name;
    select.appendChild(opt);
  });
}

// ── Modal ────────────────────────────────────────────────────
function openModal(mode, prefillDate, existingEvent, trigger) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const deleteBtn = document.getElementById('btn-delete');

  modalTrigger = trigger || document.activeElement;
  clearValidationErrors();

  if (mode === 'edit' && existingEvent) {
    title.textContent = 'Edit event';
    editingEventId = existingEvent.id;
    document.getElementById('event-id').value = existingEvent.id;
    document.getElementById('event-title').value = existingEvent.title;
    document.getElementById('event-date').value = existingEvent.date;
    document.getElementById('event-start').value = existingEvent.startTime || '';
    document.getElementById('event-end').value = existingEvent.endTime || '';
    document.getElementById('event-calendar').value = existingEvent.calendar || 'personal';
    document.getElementById('event-desc').value = existingEvent.description || '';
    deleteBtn.hidden = false;
  } else {
    title.textContent = 'Add event';
    editingEventId = null;
    document.getElementById('event-form').reset();
    document.getElementById('event-calendar').value = 'personal';
    document.getElementById('event-date').value = prefillDate || selectedDate || getTodayString();
    deleteBtn.hidden = true;
  }

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('event-title').focus();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('event-form').reset();
  clearValidationErrors();
  editingEventId = null;
  if (modalTrigger) { modalTrigger.focus(); modalTrigger = null; }
}

// ── Validation ───────────────────────────────────────────────
function validateForm(data) {
  const errors = {};
  if (!data.title.trim()) errors.title = 'Title is required.';
  if (data.startTime && data.endTime &&
      parseTimeToMinutes(data.endTime) < parseTimeToMinutes(data.startTime)) {
    errors.time = 'End time must be on or after start time.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

function showValidationErrors(errors) {
  if (errors.title) {
    document.getElementById('error-title').textContent = errors.title;
    document.getElementById('event-title').setAttribute('aria-invalid', 'true');
  }
  if (errors.time) {
    document.getElementById('error-time').textContent = errors.time;
    document.getElementById('event-end').setAttribute('aria-invalid', 'true');
  }
}

function clearValidationErrors() {
  document.getElementById('error-title').textContent = '';
  document.getElementById('error-time').textContent = '';
  document.getElementById('event-title').removeAttribute('aria-invalid');
  document.getElementById('event-end').removeAttribute('aria-invalid');
}

// ── CRUD ─────────────────────────────────────────────────────
function handleSaveEvent(e) {
  e.preventDefault();

  const data = {
    title: document.getElementById('event-title').value,
    date: document.getElementById('event-date').value,
    startTime: document.getElementById('event-start').value,
    endTime: document.getElementById('event-end').value,
    calendar: document.getElementById('event-calendar').value,
    description: document.getElementById('event-desc').value,
  };

  const { valid, errors } = validateForm(data);
  if (!valid) { showValidationErrors(errors); return; }

  if (editingEventId) {
    const idx = events.findIndex(ev => ev.id === editingEventId);
    if (idx !== -1) events[idx] = { ...events[idx], ...data };
  } else {
    events.push({ id: generateId(), ...data });
  }

  // Ensure the event's calendar is visible so it shows immediately.
  visibility[data.calendar] = true;
  saveVisibility();

  saveEvents(events);
  renderCalendar();
  renderCalendarList();
  closeModal();
}

function handleDeleteEvent() {
  if (!editingEventId) return;
  if (!confirm('Delete this event?')) return;
  events = events.filter(ev => ev.id !== editingEventId);
  saveEvents(events);
  renderCalendar();
  closeModal();
}

// ── Navigation ───────────────────────────────────────────────
function handlePrevMonth() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function handleNextMonth() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}

function handleTodayButton() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  selectedDate = getTodayString();
  renderCalendar();
}

// ── Sidebar (mobile) ─────────────────────────────────────────
function toggleSidebar() {
  const open = document.body.classList.toggle('sidebar-open');
  document.getElementById('sidebar-scrim').hidden = !open;
  document.getElementById('btn-menu').setAttribute('aria-expanded', open);
}
function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  document.getElementById('sidebar-scrim').hidden = true;
  document.getElementById('btn-menu').setAttribute('aria-expanded', 'false');
}

// ── Focus trap ───────────────────────────────────────────────
function trapFocus(e) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay.classList.contains('is-open') || e.key !== 'Tab') return;

  const focusable = overlay.querySelectorAll(
    'button:not([hidden]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  events = loadEvents();
  visibility = loadVisibility();

  populateCalendarSelect();
  renderCalendarList();
  renderCalendar();

  document.getElementById('btn-prev').addEventListener('click', handlePrevMonth);
  document.getElementById('btn-next').addEventListener('click', handleNextMonth);
  document.getElementById('btn-today').addEventListener('click', handleTodayButton);
  document.getElementById('mini-prev').addEventListener('click', handlePrevMonth);
  document.getElementById('mini-next').addEventListener('click', handleNextMonth);
  document.getElementById('btn-create').addEventListener('click', e => openModal('add', null, null, e.currentTarget));
  document.getElementById('btn-menu').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-scrim').addEventListener('click', closeSidebar);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-delete').addEventListener('click', handleDeleteEvent);
  document.getElementById('event-form').addEventListener('submit', handleSaveEvent);

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeSidebar(); }
    trapFocus(e);
  });
}

document.addEventListener('DOMContentLoaded', init);
