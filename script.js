// Script for navigation bar
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');


if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    })
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    })
}
// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    // Product database - in a real app, this would come from a server
    const products = [
        { id: 1, name: 'Blank T-Shirt', brand: 'adidas', price: 100,  category: 'T-Shirts' },
        { id: 2, name: 'Stylish Black Polyester Tshirt', brand: 'meesho', price: 97,  category: 'T-Shirts' },
        { id: 3, name: "Men's Plain Casual Half Sleeve T-Shirt", brand: 'leriya', price: 120, category: 'T-Shirts' },
        { id: 4, name: 'Cartoon AstroNuts T-Shirts', brand: 'adidas', price: 78, category: 'T-Shirts' },
        { id: 5, name: "Men's Patterned Relaxed Fit Shirt", brand: 'DNMX', price: 134, category: 'Shirts' },
        { id: 6, name: 'Man Casual Shirt', brand: 'classy', price: 76, category: 'Shirts' },
        { id: 7, name: 'linen pants with floral embroidery', brand: 'Zara', price: 174,  category: 'Pants' },
        { id: 8, name: 'V-neck blouse with a cat print', brand: 'Shein', price: 150,  category: 'Blouses' },
        { id: 9, name: 'Cartoon AstroNuts T-Shirts', brand: 'Uniqlo', price: 110,  category: 'T-Shirts' },
        { id: 10, name: 'casual button-up shirts', brand: 'Uniqlo', price: 111,  category: 'Shirts' },
        { id: 11, name: 'casual button-up shirts', brand: 'Uniqlo', price: 111,  category: 'Shirts' },
        { id: 12, name: 'short-sleeved printed shirt', brand: 'Superdry', price: 90,  category: 'Shirts' }
    ];
    
    // Search function
    function searchProducts(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        query = query.toLowerCase();
        return products.filter(product => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }).slice(0, 6); // Limit to 6 suggestions
    }
    
    // Display suggestions
    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            suggestionsContainer.classList.remove('active');
            return;
        }
        
        suggestions.forEach(product => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                window.location.href = `sproduct.html?id=${product.id}`; // Navigate to product page
            });
            
            suggestionsContainer.appendChild(div);
        });
        
        suggestionsContainer.classList.add('active');
    }
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const results = searchProducts(query);
        displaySuggestions(results);
    });
    
    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            const results = searchProducts(query);
            displaySuggestions(results);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
    
    if (window.location.pathname.includes('shop.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        if (searchQuery) {
            searchInput.value = searchQuery;
            
            // Filter products on the page (would need to be adapted to your product display structure)
            const productContainers = document.querySelectorAll('.pro-container .pro');
            let matchCount = 0;
            
            productContainers.forEach(container => {
                const productName = container.querySelector('h5').textContent.toLowerCase();
                const productBrand = container.querySelector('span').textContent.toLowerCase();
                
                if (productName.includes(searchQuery.toLowerCase()) || 
                    productBrand.includes(searchQuery.toLowerCase())) {
                    container.style.display = 'block';
                    matchCount++;
                } else {
                    container.style.display = 'none';
                }
            });
            
            const resultsInfo = document.createElement('div');
            resultsInfo.className = 'search-results-info';
            resultsInfo.innerHTML = `<p>Found ${matchCount} results for "${searchQuery}"</p>`;
            
            const productSection = document.querySelector('#product1');
            const existingInfo = document.querySelector('.search-results-info');
            
            if (existingInfo) {
                existingInfo.remove();
            }
            
            productSection.insertBefore(resultsInfo, productSection.querySelector('.pro-container'));
        }
    }
});