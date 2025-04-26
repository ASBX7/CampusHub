window.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.querySelector('section.grid');
    const paginationContainer = document.querySelector('.pagination');
    const searchInput = document.querySelector('input[type="search"]');
    const departmentFilter = document.querySelectorAll('select')[0];
    const sortSelect = document.querySelectorAll('select')[1];
    const addReviewForm = document.querySelector('#add-review form');

    let allReviews = [];
    let filteredReviews = [];
    let currentPage = 1;

    // Expose functions to global scope
    window.changePage = changePage;
    window.showDetail = showDetail;

    async function fetchReviews() {
        try {
            reviewsContainer.innerHTML = '<p>Loading reviews...</p>';
            const res = await fetch('https://680d3449c47cb8074d8fdd84.mockapi.io/Reviews');
            if (!res.ok) throw new Error('Failed to fetch reviews.');
            const data = await res.json();
            
            // Add dates if they don't exist
            allReviews = data.map(review => ({
                ...review,
                date: review.date || new Date().toISOString().split('T')[0]
            }));
            
           
            
            filteredReviews = [...allReviews];
            renderReviews();
        } catch (error) {
            reviewsContainer.innerHTML = `<p style="color:red">Error loading reviews: ${error.message}</p>`;
        }
    }

    function renderReviews() {
        // Filter out any temporary reviews (in case they somehow persist)
        const permanentReviews = filteredReviews.filter(review => !review.id.startsWith('temp-'));
        if (permanentReviews.length !== filteredReviews.length) {
            filteredReviews = permanentReviews;
        }

        const start = (currentPage - 1) * 4;
        const end = start + 4;
        const paginatedReviews = filteredReviews.slice(start, end);

        reviewsContainer.innerHTML = paginatedReviews.map(review => `
            <article id="review-${review.id}">
                <h2>${review.subject}</h2>
                <p><strong>Instructor:</strong> ${review.instructor}</p>
                <p><small>Posted on: ${formatDate(review.date)}</small></p>
                <p>${'⭐'.repeat(review.rating)} ${review.rating}/5</p>
                <p>"${review.notes.slice(0, 50)}..."</p>
                <footer><a href="#review-detail" onclick="showDetail(${review.id})">Read More</a></footer>
            </article>
        `).join('');

        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredReviews.length / 4);
        let buttons = '';
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        if (currentPage > 1) {
            buttons += `<li><a href="#" onclick="changePage(${currentPage - 1})">« Prev</a></li>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            buttons += `<li><a href="#" onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</a></li>`;
        }

        if (currentPage < totalPages) {
            buttons += `<li><a href="#" onclick="changePage(${currentPage + 1})">Next »</a></li>`;
        }
        
        paginationContainer.innerHTML = buttons;
    }

    function changePage(page) {
        currentPage = page;
        renderReviews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showDetail(id) {
        const review = allReviews.find(r => r.id == id);
        if (!review) return;

        const detailView = document.querySelector('#review-detail');
        if (detailView) {
            detailView.innerHTML = `
                <a href="#MainPage" role="button" class="secondary">Back</a>
                <h2>${review.subject}</h2>
                <p><strong>Instructor:</strong> ${review.instructor}</p>
                <p><small>Posted on: ${formatDate(review.date)}</small></p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} ${review.rating}/5</p>
                <p>${review.notes}</p>
                <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
                    <a href="#MainPage" role="button">Back to Reviews</a>
                </div>
            `;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'No date available';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function filterReviews() {
        const searchTerm = searchInput.value.toLowerCase();
        const department = departmentFilter.value;
        
        filteredReviews = allReviews.filter(review => {
            const matchesSearch = review.subject.toLowerCase().includes(searchTerm) || 
                                review.instructor.toLowerCase().includes(searchTerm);
            const matchesDepartment = department === "Filter by Department" || 
                                    review.subject.toLowerCase().includes(department.toLowerCase());
            return matchesSearch && matchesDepartment;
        });

        const sortOption = sortSelect.value;
        if (sortOption === "Highest Rated") {
            filteredReviews.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === "Most Recent") {
            filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        currentPage = 1;
        renderReviews();
    }

     function handleAddReview(e) {
       //waiting for DataBase
            alert('Review added successfully! ');
    }

    // Event listeners
    searchInput.addEventListener('input', filterReviews);
    departmentFilter.addEventListener('change', filterReviews);
    sortSelect.addEventListener('change', filterReviews);
    
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', handleAddReview);
    }

    fetchReviews();
});