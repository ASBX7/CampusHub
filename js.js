document.addEventListener('DOMContentLoaded', function() {
    // State management
    const state = {
        items: [],
        filteredItems: [],
        currentPage: 1,
        itemsPerPage: 20,
        currentCategory: '',
        currentSearch: '',
        currentPriceRange: '',
        currentSort: 'title-asc'
    };
  
    // DOM elements
    const itemsContainer = document.getElementById('items-container');
    const paginationEl = document.getElementById('pagination');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const detailView = document.getElementById('detail-view');
    const addItemForm = document.getElementById('add-item-form');
    
    // Filter and sort elements
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');
    const mainSearch = document.getElementById('main-search');
    const mainSearchBtn = document.getElementById('main-search-btn');
  
    // Initialize the app
    init();
  
    function init() {
        fetchItems();
        setupEventListeners();
    }
  
    // Fetch items from API
    async function fetchItems() {
        showLoading();
        try {
            // Using JSONPlaceholder as our mock API
            const response = await fetch('https://680cce1e2ea307e081d516c2.mockapi.io/y');
            
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            
            const data = await response.json();
            
            // Transform the data to match our marketplace structure
            state.items = data.map(item => ({
                id: item.id,
                title: item.title.split(' ').slice(0, 3).join(' '), // Shorten title
                category: getRandomCategory(),
                price: Math.floor(Math.random() * 1000) + 10, // Random price $10-$1010
                location: getRandomLocation(),
                description: `This is a ${item.title.split(' ')[0]}. ${getRandomDescription()}`,
                thumbnailUrl: item.thumbnailUrl,
                url: item.url
            }));
            
            applyFilters();
            renderItems();
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }
  
    // Helper function to get random categories
    function getRandomCategory() {
        const categories = ['cars', 'electronics', 'furniture', 'clothing', 'books', 'other'];
        return categories[Math.floor(Math.random() * categories.length)];
    }
  
    // Helper function to get random locations
    function getRandomLocation() {
        const locations = ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'karranah'];
        return locations[Math.floor(Math.random() * locations.length)];
    }
  
    // Helper function to get random descriptions
    function getRandomDescription() {
        const descriptions = [
            'In excellent condition. Barely used.',
            'Like new. Comes with original packaging.',
            'Good condition. Some signs of wear.',
            'Needs minor repairs. Great deal!',
            'Perfect working order. Selling because upgrading.',
            'Brand new in box. Never opened.'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
  
    // Apply all filters and sorting
    function applyFilters() {
        let filtered = [...state.items];
        
        // Apply category filter
        if (state.currentCategory) {
            filtered = filtered.filter(item => item.category === state.currentCategory);
        }
        
        // Apply price range filter
        if (state.currentPriceRange) {
            const [min, max] = state.currentPriceRange.split('-').map(Number);
            if (max) {
                filtered = filtered.filter(item => item.price >= min && item.price <= max);
            } else {
                filtered = filtered.filter(item => item.price >= min);
            }
        }
        
        // Apply search filter
        if (state.currentSearch) {
            const searchTerm = state.currentSearch.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (state.currentSort) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
        
        state.filteredItems = filtered;
        state.currentPage = 1; // Reset to first page when filters change
    }
  
    // Render items to the DOM
    function renderItems() {
        if (state.filteredItems.length === 0) {
            itemsContainer.innerHTML = '<p class="error-message">No items found matching your criteria.</p>';
            paginationEl.innerHTML = '';
            return;
        }
        
        // Calculate pagination
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const endIdx = startIdx + state.itemsPerPage;
        const itemsToDisplay = state.filteredItems.slice(startIdx, endIdx);
        
        // Render items
        itemsContainer.innerHTML = itemsToDisplay.map(item => `
            <div class="item" data-id="${item.id}">
                <img src="${item.url}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>$${item.price} - ${item.location}</p>
                <p><small>${item.category}</small></p>
                <a href="#item-detail" class="view-item"><button class="view-details" data-id="${item.id}">View Details</button></a>
            </div>
        `).join('');
        
        // Render pagination
        renderPagination();
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-item, .view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                showItemDetail(itemId);
            });
        });
    }
  
    // Render pagination controls
    function renderPagination() {
        const totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${state.currentPage === 1 ? 'disabled' : ''} id="prev-page">
                &laquo; Prev
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button ${i === state.currentPage ? 'class="active"' : ''} data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button ${state.currentPage === totalPages ? 'disabled' : ''} id="next-page">
                Next &raquo;
            </button>
        `;
        
        paginationEl.innerHTML = paginationHTML;
        
        // Add event listeners
        document.querySelectorAll('#pagination button[data-page]').forEach(btn => {
            btn.addEventListener('click', function() {
                state.currentPage = parseInt(this.getAttribute('data-page'));
                renderItems();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        
        document.getElementById('prev-page')?.addEventListener('click', function() {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderItems();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        document.getElementById('next-page')?.addEventListener('click', function() {
            const totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderItems();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
  
    // Show item detail view
    function showItemDetail(itemId) {
        const item = state.items.find(item => item.id == itemId);
        if (!item) return;
        
        detailView.innerHTML = `
            <div class="component-header">
                <h2>${item.title}</h2>
                <p>$${item.price} - ${item.location}</p>
            </div>
            <img src="${item.url}" alt="${item.title}">
            <div class="details-content">
                <div class="detail-item">
                    <div class="detail-label">Category:</div>
                    <div class="detail-value">${item.category}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Price:</div>
                    <div class="detail-value">$${item.price}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location:</div>
                    <div class="detail-value">${item.location}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Description:</div>
                    <div class="detail-value">${item.description}</div>
                </div>
                <div class="detail-actions">
                    <button class="edit-btn">Contact Seller</button>
                    <button class="delete-btn">Save Item</button>
                </div>
            </div>
        `;
    }
  
    // Setup all event listeners
    function setupEventListeners() {
        // Category filter
        categoryFilter.addEventListener('change', function() {
            state.currentCategory = this.value || '';
            applyFilters();
            renderItems();
        });
        
        // Price filter
        priceFilter.addEventListener('change', function() {
            state.currentPriceRange = this.value || '';
            applyFilters();
            renderItems();
        });
        
        // Sort by
        sortBy.addEventListener('change', function() {
            state.currentSort = this.value;
            applyFilters();
            renderItems();
        });
        
        // Main search
        mainSearchBtn.addEventListener('click', function() {
            state.currentSearch = mainSearch.value.trim();
            applyFilters();
            renderItems();
        });
        // Form validation and submission
        addItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                // In a real app, you would send this data to a server
                alert('Item added successfully! (This is a demo - no data is actually saved)');
                window.location.href = '#Marketplace';
            }
        });
        
        // Input validation on blur
        ['item-name', 'item-category', 'item-image', 'item-price', 'item-location', 'item-description'].forEach(id => {
            document.getElementById(id).addEventListener('blur', function() {
                validateField(this.id);
            });
        });
    }
  
    // Validate the entire form
    function validateForm() {
        let isValid = true;
        
        ['item-name', 'item-category', 'item-image', 'item-price', 'item-location', 'item-description'].forEach(id => {
            if (!validateField(id)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
  
    // Validate a single form field
    function validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}-error`);
        let isValid = true;
        
        // Reset error state
        field.classList.remove('error');
        errorEl.textContent = '';
        
        // Validate based on field type
        switch (fieldId) {
            case 'item-name':
                if (!field.value.trim()) {
                    errorEl.textContent = 'Name is required';
                    isValid = false;
                }
                break;
            case 'item-category':
                if (!field.value) {
                    errorEl.textContent = 'Category is required';
                    isValid = false;
                }
                break;
            case 'item-image':
                if (!field.value.trim()) {
                    errorEl.textContent = 'Image URL is required';
                    isValid = false;
                } else if (!isValidUrl(field.value)) {
                    errorEl.textContent = 'Please enter a valid URL';
                    isValid = false;
                }
                break;
            case 'item-price':
                if (!field.value) {
                    errorEl.textContent = 'Price is required';
                    isValid = false;
                } else if (parseFloat(field.value) <= 0) {
                    errorEl.textContent = 'Price must be greater than 0';
                    isValid = false;
                }
                break;
            case 'item-location':
                if (!field.value.trim()) {
                    errorEl.textContent = 'Location is required';
                    isValid = false;
                }
                break;
            case 'item-description':
                if (!field.value.trim()) {
                    errorEl.textContent = 'Description is required';
                    isValid = false;
                } else if (field.value.trim().length < 10) {
                    errorEl.textContent = 'Description must be at least 10 characters';
                    isValid = false;
                }
                break;
        }
        
        if (!isValid) {
            field.classList.add('error');
        }
        
        return isValid;
    }
  
    // Helper function to validate URLs
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
  
    // Show loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'block';
        errorMessage.style.display = 'none';
        itemsContainer.innerHTML = '';
        paginationEl.innerHTML = '';
    }
  
    // Hide loading spinner
    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }
  
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
  });