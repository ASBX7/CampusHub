let scrollDirection = 1;

function scrollLeft() {
    document.querySelector('.scroll-content').scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}

function scrollRight() {
    document.querySelector('.scroll-content').scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

function autoScroll() {
    const scrollContent = document.querySelector('.scroll-content');
    const maxScrollLeft = scrollContent.scrollWidth - scrollContent.clientWidth;

    if (scrollContent.scrollLeft >= maxScrollLeft) {
        scrollDirection = -1;
    } else if (scrollContent.scrollLeft <= 0) {
        scrollDirection = 1;
    }

    scrollContent.scrollBy({
        left: 200 * scrollDirection,
        behavior: 'smooth'
    });
}
setInterval(autoScroll, 3000);

document.getElementById('comment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value;
    if (commentText) {
        addComment(commentText);
        commentInput.value = '';
    }
});

function addComment(text) {
    const commentSection = document.getElementById('comments');
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');

    const commentText = document.createElement('p');
    commentText.textContent = text;
    commentDiv.appendChild(commentText);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function() {
        const newText = prompt('Edit your comment:', commentText.textContent);
        if (newText) {
            commentText.textContent = newText;
        }
    });
    commentDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        commentSection.removeChild(commentDiv);
    });
    commentDiv.appendChild(deleteButton);

    commentSection.appendChild(commentDiv);
}
function searchNews() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const newsItems = document.querySelectorAll('.news-item');
    newsItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(searchInput)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
   });
 }
 document.getElementById('news-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (isLegitNews(title, content)) {
        addNews(category, title, content);
        alert('News submitted successfully!');
    } else {
        alert('Please submit legitimate news.');
    }
});

function isLegitNews(title, content) {

    return title.length > 10 && content.length > 50;
}

function addNews(category, title, content) {

    const newsSection = document.getElementById(category);
    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item');
    newsItem.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    newsSection.appendChild(newsItem);
}

document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('trending');
    const searchInput = document.getElementById('search-input');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Loading...';
    newsContainer.appendChild(loadingIndicator);

    async function fetchNews() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displayNews(data);
        } catch (error) {
            console.error('Fetch error:', error);
            newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function displayNews(newsItems) {
        newsContainer.innerHTML = '';
        newsItems.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
            newsContainer.appendChild(newsItem);
        });
    }

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            if (item.textContent.toLowerCase().includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Fetch news on page load
    fetchNews();
});
