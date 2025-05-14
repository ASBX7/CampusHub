const container = document.getElementById('news-detail');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function generateFakeDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

if (!id) {
  container.innerHTML = `<p class="text-red-600 text-center">No news ID provided.</p>`;
} else {
  fetch(`https://963858b5-c2e4-4930-9e45-d178faad9f3e-00-986w68eb5ssi.sisko.replit.dev/campus-news-api/api/read.php?id=${id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('News not found.');
      }
      return res.json();
    })
    .then(data => {
      const fakeDate = generateFakeDate();
      container.innerHTML = `
        <h1 class="text-2xl font-bold mb-2">${data.title}</h1>
        <p class="text-sm text-gray-500">${fakeDate}</p>
        <p class="mt-4 text-gray-800 leading-relaxed">${data.body}</p>
      `;
    })
    .catch(error => {
      container.innerHTML = `<p class="text-red-600 text-center">${error.message}</p>`;
    });
}
