document.addEventListener('DOMContentLoaded', () => {
    // Sample data
    const notes = [
      {id:1, title:"Web Dev Basics", course:"ITCS333", desc:"HTML/CSS intro", date:"2025-03-15", views:124, comments:["Very helpful!"]},
      {id:2, title:"Organic Chemistry", course:"CHEM201", desc:"Reaction mechanisms", date:"2025-03-10", views:89, comments:[]},
      {id:3, title:"Linear Algebra", course:"MATH301", desc:"Vectors/matrices", date:"2025-03-18", views:76, comments:[]},
      {id:4, title:"Database Systems", course:"ITCS316", desc:"SQL basics", date:"2025-03-12", views:112, comments:["Great examples"]},
      {id:5, title:"Software Requirments", course:"ITSE220", desc:"intro to Software", date:"2025-04-12", views:199, comments:["good start"]},
      {id:5, title:"Multimedia", course:"ITCS453", desc:"Multimedia Learnings", date:"2025-04-17", views:99, comments:[" great course for fun"]}
    ];
  
    // DOM elements
    const elements = {
      grid: document.querySelector('.note-grid'),
      search: document.querySelector('input[type="search"]'),
      courseFilter: document.querySelector('select:first-of-type'),
      sort: document.querySelector('select:last-of-type'),
      form: document.querySelector('#create form'),
      detailView: document.querySelector('#detail'),
      listingView: document.querySelector('section:first-of-type'),
      createView: document.querySelector('#create'),
      detailTitle: document.querySelector('#detail h3'),
      detailContent: document.querySelector('#detail article')
    };
  
    // State
    let filteredNotes = [];
    let currentPage = 1;
    const notesPerPage = 4;
  
    // Initialize
    renderNotes();
    setupCourseFilter();
    setupEventListeners();
  
    function renderNotes() {
      filterAndSortNotes();
      const startIdx = (currentPage - 1) * notesPerPage;
      const paginatedNotes = filteredNotes.slice(startIdx, startIdx + notesPerPage);
      
      elements.grid.innerHTML = paginatedNotes.map(note => `
        <article class="note-card" data-id="${note.id}">
          <h3>${note.title}</h3>
          <p>${note.desc.substring(0, 50)}${note.desc.length > 50 ? '...' : ''}</p>
          <small>${note.course} • ${note.views} views</small>
          <a href="#detail" class="view-detail">View Details</a>
        </article>
      `).join('');
      
      updatePagination();
    }
  
    function filterAndSortNotes() {
      const searchTerm = elements.search.value.toLowerCase();
      filteredNotes = notes.filter(note => 
        `${note.title} ${note.desc} ${note.course}`.toLowerCase().includes(searchTerm)
      );
      
      if (elements.courseFilter.value !== "Filter by course") {
        filteredNotes = filteredNotes.filter(note => note.course === elements.courseFilter.value);
      }
      
      if (elements.sort.value === "Newest") {
        filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (elements.sort.value === "Popular") {
        filteredNotes.sort((a, b) => b.views - a.views);
      }
    }
  
    function updatePagination() {
      const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
      const pageLinks = document.querySelectorAll('.pagination a');
      
      pageLinks.forEach((link, index) => {
        if (index === 0) {
          link.classList.toggle('disabled', currentPage === 1);
        } else if (index === pageLinks.length - 1) {
          link.classList.toggle('disabled', currentPage === totalPages);
        } else {
          link.classList.toggle('current', index === currentPage);
        }
      });
    }
  
    function setupCourseFilter() {
      const courses = [...new Set(notes.map(note => note.course))];
      courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        elements.courseFilter.appendChild(option);
      });
    }
  
    function setupEventListeners() {
      // Search/filter/sort
      [elements.search, elements.courseFilter, elements.sort].forEach(el => {
        el.addEventListener('change', () => {
          currentPage = 1;
          renderNotes();
        });
      });
  
      // Pagination
      document.querySelector('.pagination').addEventListener('click', e => {
        e.preventDefault();
        if (e.target.tagName !== 'A') return;
        
        if (e.target.textContent === '»') currentPage++;
        else if (e.target.textContent === '«') currentPage--;
        else currentPage = parseInt(e.target.textContent);
        
        renderNotes();
      });
  
      // Navigation
      document.querySelectorAll('a[href="#create"]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          elements.listingView.style.display = 'none';
          elements.createView.style.display = 'block';
          elements.detailView.style.display = 'none';
        });
      });
  
      // Detail view
      document.addEventListener('click', e => {
        if (e.target.classList.contains('view-detail')) {
          e.preventDefault();
          const noteId = parseInt(e.target.closest('.note-card').dataset.id);
          showNoteDetail(noteId);
        }
      });
  
      // Back button
      document.querySelector('#detail a[role="button"]').addEventListener('click', e => {
        e.preventDefault();
        elements.listingView.style.display = 'block';
        elements.detailView.style.display = 'none';
        elements.createView.style.display = 'none';
      });
  
      // Form submission
      elements.form.addEventListener('submit', e => {
        e.preventDefault();
        const title = elements.form.elements['title'].value.trim();
        const course = elements.form.elements['course'].value.trim();
        const description = elements.form.elements['description'].value.trim();
        
        if (!title || !course || !description) {
          alert('Please fill all fields');
          return;
        }
        
        notes.unshift({
          id: notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1,
          title,
          course,
          desc: description,
          date: new Date().toISOString().split('T')[0],
          views: 0,
          comments: []
        });
        
        elements.form.reset();
        elements.listingView.style.display = 'block';
        elements.createView.style.display = 'none';
        renderNotes();
      });
    }
  
    function showNoteDetail(noteId) {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      note.views++;
      
      elements.detailTitle.textContent = note.title;
      elements.detailContent.innerHTML = `
        <h3>${note.title}</h3>
        <p><strong>Course:</strong> ${note.course}</p>
        <p>${note.desc}</p>
        <div class="action-buttons">
          <a href="#" role="button" class="secondary">Edit</a>
          <a href="#" role="button" class="contrast">Delete</a>
        </div>
        <h4>Comments</h4>
        ${note.comments.length ? 
          note.comments.map(c => `<div class="comment-box">${c}</div>`).join('') : 
          '<p>No comments yet</p>'}
        <a href="#" role="button" class="secondary">Back to Listing</a>
      `;
      
      elements.listingView.style.display = 'none';
      elements.createView.style.display = 'none';
      elements.detailView.style.display = 'block';
    }
  });