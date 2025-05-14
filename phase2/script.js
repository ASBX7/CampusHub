const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=30';
//const API_URL = 'https://https://campus-news.replit.app/api/news/list.php';

const newsList = document.querySelector('.news-list');
const searchInput = document.querySelector('input[type="text"]');
const sortSelect = document.querySelector('select');
const pagination = document.querySelector('.pagination');
const itemsPerPage = 6;

let allNews = [];
let currentPage = 1;

function showLoading() {
  newsList.innerHTML = '<p class="text-center">Loading...</p>';
}

function showError(message) {
  newsList.innerHTML = `<p class="text-center text-red-600">${message}</p>`;
}

async function fetchNews() {
  showLoading();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Could not fetch news');
    const data = await response.json();
    allNews = data.map(item => ({
      id: item.id,
      title: item.title,
      date: randomDate(), 
      summary: item.body.slice(0, 80) + '...'
    }));
    renderNews();
  } catch (error) {
    showError(error.message);
  }
}

function randomDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function renderNews() {
  const filtered = filterNews();
  const sorted = sortNews(filtered);
  const paginated = paginateNews(sorted);
  renderPagination(sorted.length);
  
  if (paginated.length === 0) {
    newsList.innerHTML = '<p>No news found.</p>';
    return;
  }

  newsList.innerHTML = paginated.map(news => `
    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-lg font-bold">${news.title}</h2>
      <p class="text-sm text-gray-500">${news.date}</p>
      <p class="mt-2">${news.summary}</p>
      <a href="detail.html?id=${news.id}" class="text-blue-600 mt-2 inline-block">Read more</a>
    </div>
  `).join('');
}

function filterNews() {
  const term = searchInput.value.toLowerCase();
  return allNews.filter(item => item.title.toLowerCase().includes(term));
}

function sortNews(newsArray) {
  const value = sortSelect.value;
  if (value.includes('Date')) {
    return [...newsArray].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    return [...newsArray].sort((a, b) => a.title.localeCompare(b.title));
  }
}

function paginateNews(newsArray) {
  const start = (currentPage - 1) * itemsPerPage;
  return newsArray.slice(start, start + itemsPerPage);
}

function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = '';
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderNews();
    });
    pagination.appendChild(btn);
  }
}

searchInput?.addEventListener('input', () => {
  currentPage = 1;
  renderNews();
});

sortSelect?.addEventListener('change', () => {
  renderNews();
});

if (newsList) {
  fetchNews();
}

