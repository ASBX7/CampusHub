window.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.querySelector('section.grid');
    const paginationContainer = document.querySelector('.pagination');
    const searchInput = document.querySelector('input[type="search"]');
    const departmentFilter = document.querySelectorAll('select')[0];
    const sortSelect = document.querySelectorAll('select')[1];
    const addReviewForm = document.querySelector('#add-review form');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', handleAddReview);
    }
    let allReviews = [];
    let filteredReviews = [];
    let currentPage = 1;

    // Expose functions to global scope
    window.changePage = changePage;
    window.showDetail = showDetail;

    async function fetchReviews() {
    try {
        reviewsContainer.innerHTML = '<p>Loading reviews...</p>';
        const res = await fetch('https://5e173def-e61b-401d-8261-94eb67b9c74a-00-1gqhc6zpkmij2.pike.replit.dev/comments/get_Reviews.php');
        if (!res.ok) throw new Error('Failed to fetch reviews.');
        const data = await res.json();

        // تنسيق البيانات
        allReviews = data.data.map(review => ({
            id: review.id,
            subject: review.subject_name,
            instructor: review.instructor_name,
            Department: review.Department,
            rating: parseInt(review.review),
            notes: review.notes,
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
                <p><strong>Department:</strong> ${review.Department}</p>
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

        window.location.hash = `#review-${id}`;


        const detailView = document.querySelector('#review-detail');
        if (detailView) {
            detailView.innerHTML = `
                <a href="#MainPage" role="button" class="secondary">Back</a>
                <h2>${review.subject}</h2>
                <p><strong>Instructor:</strong> ${review.instructor}</p>
                <p><strong>Department:</strong> ${review.Department}</p>
                <p><small>Posted on: ${formatDate(review.date)}</small></p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} ${review.rating}/5</p>
                <p>${review.notes}</p>
                <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
                    <a href="#MainPage" role="button">Back to Reviews</a>
                    
                </div>

                <section id="comments-section">
                <h3>Comments</h3>
                <ul id="comments-list-${review.id}">
                </ul>
                <form  >
                <input name="review_id" value="${review.id}" type="hidden">
                 <input type="text" name="comment" placeholder="Write a comment..." required />
                 <button type="submit">Add Comment</button>
                </form>
</s             ection>
            `;
            document.querySelector(`#review-detail form`).addEventListener('submit', (e) => submitComment(e, review.id));

            fetchComments(review.id);
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
                                    review.Department.toLowerCase().includes(department.toLowerCase());
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

     async function handleAddReview(e) {
        event.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        try {
            const res = await fetch('https://5e173def-e61b-401d-8261-94eb67b9c74a-00-1gqhc6zpkmij2.pike.replit.dev/comments/Create.php', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to submit review');

            const response = await res.json();
            if (response.success){
                alert('Review added successfully!');
                form.reset();
    
                await fetchReviews();
    
                window.location.hash = '#MainPage';
            }else {
            alert('Error: ' + response.message);
            }
        } catch(error) {
            alert('Failed to submit: ' + error.message);
        }
    }

    async function fetchComments(reviewId) {
        try{
            const resp = await fetch(`https://5e173def-e61b-401d-8261-94eb67b9c74a-00-1gqhc6zpkmij2.pike.replit.dev/comments/get_comments.php?review_id=${reviewId}`);
            const data = await resp.json();
            const list = document.querySelector(`#comments-list-${reviewId}`);

            if (data.length === 0) {
                list.innerHTML = "<li>No comments yet.</li>";
                return;
            }
            list.innerHTML = data.map(comments => `<li>${comments.comment}</li>`).join('');

        }catch(error){
            console.error("Error loading comments", err); 
        }
        
    }

    async function submitComment(event,reviewId) {
        event.preventDefault();
        const form = event.target;
        const commentText = form.comment.value;

        try {
            const res = await fetch(`https://5e173def-e61b-401d-8261-94eb67b9c74a-00-1gqhc6zpkmij2.pike.replit.dev/comments/add_comments.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ review_id: reviewId, comment: commentText })   
            });

            const data = await res.json();
            if(data.success) {
                form.reset();
                fetchComments(reviewId);
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            alert("Error submitting comment: " + err.message); 
        }
        
    }

    // Event listeners
    searchInput.addEventListener('input', filterReviews);
    departmentFilter.addEventListener('change', filterReviews);
    sortSelect.addEventListener('change', filterReviews);
    
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', handleAddReview);
    }

    fetchReviews();
    window.addEventListener('load', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#review-')) {
            const id = hash.replace('#review-', '');
            // تأكد من تحميل المراجعات أولاً ثم عرض التفاصيل
            const interval = setInterval(() => {
                if (allReviews.length > 0) {
                    clearInterval(interval);
                    showDetail(id);
                }
            }, 100); // ينتظر حتى تحميل المراجعات
        }
    });
    
});