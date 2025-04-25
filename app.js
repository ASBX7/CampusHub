let eventsData = [];
let currentPage = 1;
const eventsPerPage = 6;

function showSuccessMessage(message) {
  const box = document.getElementById("successMessage");
  box.textContent = message;
  box.style.display = "block";
  setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}

async function fetchEvents() {
  try {
    const response = await fetch('https://mocki.io/v1/23c6db79-ea57-4f24-b154-7bbaabb0336f');
    if (!response.ok) throw new Error();
    const data = await response.json();
    eventsData = data;
  } catch {
    eventsData = [
      { id: 1, title: 'Math Class', datetime: '2025-04-01T10:00', category: 'academic', location: 'Room 101', description: 'Algebra intro' },
      { id: 2, title: 'Football', datetime: '2025-04-02T16:00', category: 'sports', location: 'Field 1', description: 'Friendly match' },
      { id: 3, title: 'Movie Night', datetime: '2025-04-03T19:00', category: 'social', location: 'Main Hall', description: 'Comedy movie' },
    ];
  }
  loadEvents();
  document.getElementById('loading').style.display = 'none';
}

function loadEvents() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const sort = document.getElementById('sortSelect').value;

  let filtered = [...eventsData];
  if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search));
  if (category) filtered = filtered.filter(e => e.category === category);
  if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  renderCalendar(filtered);
  renderPagination(filtered);
}

function renderCalendar(events) {
  const container = document.getElementById('calendarContainer');
  const header = document.getElementById('calendarHeader');
  container.innerHTML = '';
  header.innerHTML = '';

  // Create calendar headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const div = document.createElement('div');
    div.className = 'calendar-header';
    div.textContent = day;
    header.appendChild(div);
  });

  // Calendar dynamic logic
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const start = (currentPage - 1) * eventsPerPage;
  const pageEvents = events.slice(start, start + eventsPerPage);

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty-day';
    container.appendChild(empty);
  }

  // Fill days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';

    const number = document.createElement('div');
    number.className = 'day-number';
    number.textContent = day;
    dayCell.appendChild(number);

    const dayEvents = pageEvents.filter(e => new Date(e.datetime).getDate() === day);
    dayEvents.forEach(e => {
      const tag = document.createElement('span');
      tag.className = `event-tag ${e.category}`;
      tag.textContent = e.title;
      tag.onclick = () => showEventDetail(e.id);
      dayCell.appendChild(tag);
    });

    container.appendChild(dayCell);
  }
}

function renderPagination(events) {
  const pageCount = Math.ceil(events.length / eventsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  if (pageCount > 1) {
    if (currentPage > 1) pagination.innerHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    for (let i = 1; i <= pageCount; i++) {
      pagination.innerHTML += `<button onclick="changePage(${i})">${i}</button>`;
    }
    if (currentPage < pageCount) pagination.innerHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
  }
}

function changePage(page) {
  currentPage = page;
  loadEvents();
}

function showEventDetail(id) {
  const e = eventsData.find(ev => ev.id === id);
  document.getElementById('detailTitle').textContent = e.title;
  document.getElementById('detailDate').textContent = new Date(e.datetime).toLocaleString();
  document.getElementById('detailLocation').textContent = e.location || 'Not specified';
  document.getElementById('detailCategory').textContent = e.category;
  document.getElementById('detailDescription').textContent = e.description || 'No description.';
  document.getElementById('editEventId').value = e.id;
  location.hash = 'event-detail';
}

function editEventDetail() {
  const id = document.getElementById('editEventId').value;
  const e = eventsData.find(ev => ev.id == id);
  document.getElementById('formTitle').textContent = 'Edit Event';
  document.getElementById('eventTitle').value = e.title;
  document.getElementById('eventDateTime').value = e.datetime;
  document.getElementById('eventLocation').value = e.location;
  document.getElementById('eventCategory').value = e.category;
  document.getElementById('eventDescription').value = e.description;
  document.getElementById('submitButton').textContent = 'Update';
  location.hash = 'add-form';
}

function goToToday() {
  const today = new Date().getDate();
  const days = document.querySelectorAll('.calendar-day');
  days.forEach(d => {
    if (d.querySelector('.day-number')?.textContent == today.toString()) {
      d.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

document.getElementById('eventForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('editEventId').value;
  const title = document.getElementById('eventTitle').value.trim();
  const datetime = document.getElementById('eventDateTime').value.trim();
  const location = document.getElementById('eventLocation').value.trim();
  const category = document.getElementById('eventCategory').value.trim();
  const description = document.getElementById('eventDescription').value.trim();

  if (!title || !datetime || !category) {
    document.getElementById('formError').style.display = 'block';
    return;
  }
  document.getElementById('formError').style.display = 'none';

  if (id) {
    const index = eventsData.findIndex(ev => ev.id == id);
    eventsData[index] = { id: parseInt(id), title, datetime, location, category, description };
    showSuccessMessage("Event updated successfully!");
  } else {
    const newId = eventsData.length ? eventsData[eventsData.length - 1].id + 1 : 1;
    eventsData.push({ id: newId, title, datetime, location, category, description });
    showSuccessMessage("New event added successfully!");
  }

  e.target.reset();
  document.getElementById('formTitle').textContent = 'Add New Event';
  document.getElementById('submitButton').textContent = 'Submit';
  document.getElementById('editEventId').value = '';
  location.hash = 'listing';
  loadEvents();
});

document.getElementById('searchInput').addEventListener('input', loadEvents);
document.getElementById('filterCategory').addEventListener('change', loadEvents);
document.getElementById('sortSelect').addEventListener('change', loadEvents);

window.addEventListener('load', fetchEvents);