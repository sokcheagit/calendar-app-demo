'use strict';

// ── State ────────────────────────────────────────────────────
let currentYear;
let currentMonth;
let events = [];
let editingEventId = null;

const STORAGE_KEY = 'calendar_events';
const MAX_PILLS = 3;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function generateId() {
  return Date.now() + '-' + (Math.floor(Math.random() * 9000) + 1000);
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

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getTodayString() {
  const t = new Date();
  return toDateString(t.getFullYear(), t.getMonth(), t.getDate());
}

// ── Rendering ────────────────────────────────────────────────
function renderCalendar() {
  renderHeader();
  renderGrid();
}

function renderHeader() {
  document.getElementById('month-label').textContent = formatMonthYear(currentYear, currentMonth);
}

function renderGrid() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  // Day-of-week header row
  DAY_NAMES.forEach(name => {
    const cell = document.createElement('div');
    cell.className = 'day-header';
    cell.textContent = name;
    grid.appendChild(cell);
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayStr = getTodayString();

  // Leading overflow days from previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dateStr = toDateString(prevYear, prevMonth, day);
    grid.appendChild(renderDayCell(day, dateStr, todayStr, true));
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toDateString(currentYear, currentMonth, day);
    grid.appendChild(renderDayCell(day, dateStr, todayStr, false));
  }

  // Trailing overflow days from next month
  const totalCells = firstDay + daysInMonth;
  const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= trailing; day++) {
    const dateStr = toDateString(nextYear, nextMonth, day);
    grid.appendChild(renderDayCell(day, dateStr, todayStr, true));
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

  // First of a month in overflow cells gets "Jun 1" style label
  if (isOverflow && day === 1) {
    const parts = dateStr.split('-');
    const label = new Date(+parts[0], +parts[1] - 1, 1)
      .toLocaleString('default', { month: 'short' }) + ' 1';
    num.textContent = label;
    num.classList.add('day-number--month-label');
  } else {
    num.textContent = day;
  }

  cell.appendChild(num);

  // Event pills
  const dayEvents = getEventsForDate(dateStr);
  const visible = dayEvents.slice(0, MAX_PILLS);
  const overflow = dayEvents.length - MAX_PILLS;

  visible.forEach(ev => {
    const pill = renderEventPill(ev);
    cell.appendChild(pill);
  });

  if (overflow > 0) {
    const more = document.createElement('div');
    more.className = 'more-indicator';
    more.textContent = `+${overflow} more`;
    cell.appendChild(more);
  }

  cell.addEventListener('click', () => openModal('add', dateStr, null));
  return cell;
}

function renderEventPill(ev) {
  const pill = document.createElement('div');
  pill.className = 'event-pill';
  pill.style.backgroundColor = ev.color || '#1a73e8';
  pill.textContent = ev.startTime ? `${ev.startTime} ${ev.title}` : ev.title;
  pill.title = ev.title;
  pill.addEventListener('click', e => {
    e.stopPropagation();
    openModal('edit', null, ev);
  });
  return pill;
}

function getEventsForDate(dateStr) {
  return events
    .filter(ev => ev.date === dateStr)
    .sort((a, b) => (a.startTime || '') < (b.startTime || '') ? -1 : 1);
}

// ── Modal ────────────────────────────────────────────────────
function openModal(mode, prefillDate, existingEvent) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const deleteBtn = document.getElementById('btn-delete');

  clearValidationErrors();

  if (mode === 'edit' && existingEvent) {
    title.textContent = 'Edit Event';
    editingEventId = existingEvent.id;
    document.getElementById('event-id').value = existingEvent.id;
    document.getElementById('event-title').value = existingEvent.title;
    document.getElementById('event-date').value = existingEvent.date;
    document.getElementById('event-start').value = existingEvent.startTime || '';
    document.getElementById('event-end').value = existingEvent.endTime || '';
    document.getElementById('event-desc').value = existingEvent.description || '';
    document.getElementById('event-color').value = existingEvent.color || '#1a73e8';
    deleteBtn.hidden = false;
  } else {
    title.textContent = 'Add Event';
    editingEventId = null;
    document.getElementById('event-form').reset();
    document.getElementById('event-color').value = '#1a73e8';
    if (prefillDate) document.getElementById('event-date').value = prefillDate;
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
}

// ── Validation ───────────────────────────────────────────────
function validateForm(data) {
  const errors = {};

  if (!data.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (data.startTime && data.endTime) {
    if (parseTimeToMinutes(data.endTime) < parseTimeToMinutes(data.startTime)) {
      errors.time = 'End time must be on or after start time.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function showValidationErrors(errors) {
  if (errors.title) {
    document.getElementById('error-title').textContent = errors.title;
    const field = document.getElementById('event-title');
    field.setAttribute('aria-invalid', 'true');
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
    description: document.getElementById('event-desc').value,
    color: document.getElementById('event-color').value,
  };

  const { valid, errors } = validateForm(data);
  if (!valid) {
    showValidationErrors(errors);
    return;
  }

  if (editingEventId) {
    const idx = events.findIndex(ev => ev.id === editingEventId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...data };
    }
  } else {
    events.push({ id: generateId(), ...data });
  }

  saveEvents(events);
  renderCalendar();
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
  renderCalendar();
}

// ── Focus trap ───────────────────────────────────────────────
function trapFocus(e) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay.classList.contains('is-open')) return;

  const focusable = overlay.querySelectorAll(
    'button:not([hidden]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  events = loadEvents();

  renderCalendar();

  document.getElementById('btn-prev').addEventListener('click', handlePrevMonth);
  document.getElementById('btn-next').addEventListener('click', handleNextMonth);
  document.getElementById('btn-today').addEventListener('click', handleTodayButton);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-delete').addEventListener('click', handleDeleteEvent);
  document.getElementById('event-form').addEventListener('submit', handleSaveEvent);

  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    trapFocus(e);
  });
}

document.addEventListener('DOMContentLoaded', init);
