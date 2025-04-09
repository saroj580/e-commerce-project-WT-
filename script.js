const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

const API_URL = 'http://localhost:5050/api';

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

async function fetchFromAPI(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('userToken');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    setupNewsletterSignup();
    
    let products = [];
    try {
        const data = await fetchFromAPI('/products');
        if (data && data.products) {
            products = data.products.map(product => ({
                id: product._id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                category: product.category
            }));
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        products = [
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
    }
    
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
        }).slice(0, 6); 
    }
    
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
        await displayProductsOnShopPage();
    }
    
    if (window.location.pathname.includes('sproduct.html')) {
        await displaySingleProduct();
    }

    setupCartFunctionality();
});

async function displayProductsOnShopPage() {
    const productContainer = document.querySelector('.pro-container');
    if (!productContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    try {
        let endpoint = '/products';
        if (searchQuery) {
            endpoint = `/products?keyword=${encodeURIComponent(searchQuery)}`;
        }
        
        const data = await fetchFromAPI(endpoint);
        if (!data || !data.products) throw new Error('No products found');
        
        productContainer.innerHTML = '';
        let matchCount = 0;
        
        data.products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'pro';
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="des">
                    <span>${product.brand}</span>
                    <h5>${product.name}</h5>
                    <div class="star">
                        ${getStarRating(product.rating)}
                    </div>
                    <h4>$${product.price}</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="${product._id}"><i class="fa-solid fa-bag-shopping cart"></i></a>
            `;
            
            productDiv.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-cart')) {
                    window.location.href = `sproduct.html?id=${product._id}`;
                }
            });
            
            productContainer.appendChild(productDiv);
            matchCount++;
        });
        
        if (searchQuery) {
            const resultsInfo = document.createElement('div');
            resultsInfo.className = 'search-results-info';
            resultsInfo.innerHTML = `<p>Found ${matchCount} results for "${searchQuery}"</p>`;
            
            const productSection = document.querySelector('#product1');
            const existingInfo = document.querySelector('.search-results-info');
            
            if (existingInfo) {
                existingInfo.remove();
            }
            
            if (productSection) {
                productSection.insertBefore(resultsInfo, productSection.querySelector('.pro-container'));
            }
        }
        
        setupCartButtonListeners();
        
    } catch (error) {
        console.error('Error displaying products:', error);
        productContainer.innerHTML = `<p>Failed to load products. Please try again later.</p>`;
    }
}

async function displaySingleProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    try {
        const product = await fetchFromAPI(`/products/${productId}`);
        if (!product) throw new Error('Product not found');
        
        const productImage = document.getElementById('MainImg');
        const productTitle = document.querySelector('#prodetails h4');
        const productPrice = document.querySelector('#prodetails h2');
        const productDescription = document.querySelector('#prodetails p');
        
        if (productImage) productImage.src = product.image;
        if (productTitle) productTitle.textContent = product.name;
        if (productPrice) productPrice.textContent = `$${product.price}`;
        if (productDescription) productDescription.textContent = product.description;
        
        const smallImages = document.querySelectorAll('.small-img');
        if (smallImages.length > 0) {
            smallImages[0].src = product.image;
        }
        
        const addToCartBtn = document.querySelector('.normal');
        if (addToCartBtn) {
            addToCartBtn.setAttribute('data-id', product._id);
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
                window.location.href = 'cart.html';
            });
        }
    } catch (error) {
        console.error('Error displaying product:', error);
    }
}

function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 > 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function setupCartFunctionality() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    setupCartButtonListeners();
    
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
        setupCartInteractions();
    }
    
    updateCartCount();
}

function setupCartButtonListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = newButton.getAttribute('data-id');
            if (!productId) return;
            
            try {
                const product = await fetchFromAPI(`/products/${productId}`);
                if (!product) throw new Error('Product not found');
                
                addToCart(product);
                alert('Product added to cart!');
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Failed to add product to cart');
            }
        });
    });
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function displayCartItems() {
    const cartTableBody = document.querySelector('#cart tbody');
    if (!cartTableBody) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartTableBody.innerHTML = `
            <tr>
                <td colspan="6">Your cart is empty</td>
            </tr>
        `;
        updateCartTotals(0);
        return;
    }
    
    cartTableBody.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'cart-item';
        row.setAttribute('data-id', item._id);        
        row.innerHTML = `
            <td data-label="Remove"><a href="#" class="remove-item"><i class="fa-solid fa-xmark"></i></a></td>
            <td data-label="Image"><img src="${item.image}" alt="${item.name}"></td>
            <td data-label="Product">${item.name}</td>
            <td data-label="Price" class="item-price">$${item.price.toFixed(2)}</td>
            <td data-label="Quantity"><input type="number" value="${item.quantity}" min="1" class="item-quantity"></td>
            <td data-label="Subtotal" class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        cartTableBody.appendChild(row);
    });
    
    calculateCartTotal();
}


function setupCartInteractions() {

    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', updateItemQuantity);
    });
    

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeCartItem);
    });
    

    const checkoutButton = document.querySelector('#subtotal button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', proceedToCheckout);
    }
    
    const couponButton = document.querySelector('#coupon button');
    if (couponButton) {
        couponButton.addEventListener('click', applyCoupon);
    }
}

function updateItemQuantity(e) {
    const input = e.target;
    const quantity = parseInt(input.value);
    if (quantity < 1) {
        input.value = 1;
        return;
    }
    
    const row = input.closest('.cart-item');
    const productId = row.getAttribute('data-id');
    const price = parseFloat(row.querySelector('.item-price').textContent.replace('$', ''));
    

    row.querySelector('.item-subtotal').textContent = `$${(price * quantity).toFixed(2)}`;
    

    updateCartStorage(productId, quantity);
    

    calculateCartTotal();
}


function removeCartItem(e) {
    e.preventDefault();
    
    const row = e.target.closest('.cart-item');
    const productId = row.getAttribute('data-id');
    

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    

    row.remove();
    

    updateCartCount();
    calculateCartTotal();
    
    if (updatedCart.length === 0) {
        const cartTableBody = document.querySelector('#cart tbody');
        cartTableBody.innerHTML = `
            <tr>
                <td colspan="6">Your cart is empty</td>
            </tr>
        `;
        updateCartTotals(0);
    }
}

function updateCartStorage(productId, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const item = cart.find(item => item._id === productId);
    if (item) {
        item.quantity = quantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function calculateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;
    
    cartItems.forEach(item => {
        const subtotal = parseFloat(item.querySelector('.item-subtotal').textContent.replace('$', ''));
        total += subtotal;
    });
    
    updateCartTotals(total);
}

function updateCartTotals(total) {
    const subtotalElem = document.getElementById('cart-subtotal');
    const totalElem = document.getElementById('cart-total');
    
    if (subtotalElem) subtotalElem.textContent = `$${total.toFixed(2)}`;
    if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartIcon = document.querySelector('#cart-icon');
    const cartCount = document.querySelector('#cart-count');
    
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
    }
    
    // Alternative: add a badge to the cart icon if it exists
    if (cartIcon && !cartCount) {
        // Create cart count badge if it doesn't exist
        let badge = document.querySelector('#cart-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-count-badge';
            badge.className = 'cart-count-badge';
            badge.style.position = 'absolute';
            badge.style.top = '0';
            badge.style.right = '0';
            badge.style.backgroundColor = '#088178';
            badge.style.color = 'white';
            badge.style.borderRadius = '50%';
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.fontSize = '12px';
            badge.style.display = 'flex';
            badge.style.justifyContent = 'center';
            badge.style.alignItems = 'center';
            

            cartIcon.style.position = 'relative';
            cartIcon.appendChild(badge);
        }
        

        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}


function proceedToCheckout() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('userToken');
    
    if (!userData || !token) {
        alert('Please login to proceed with checkout');
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }
    
    window.location.href = 'checkout.html';
}


function applyCoupon() {
    const couponInput = document.querySelector('#coupon input');
    const couponCode = couponInput.value.trim();
    
    if (!couponCode) {
        alert('Please enter a coupon code');
        return;
    }
    

    alert('Coupon applied: 10% discount');
    
    const subtotalElem = document.getElementById('cart-subtotal');
    const totalElem = document.getElementById('cart-total');
    
    if (subtotalElem && totalElem) {
        const subtotal = parseFloat(subtotalElem.textContent.replace('$', ''));
        const discountedTotal = subtotal * 0.9; 
        
        totalElem.textContent = `$${discountedTotal.toFixed(2)}`;
    }
}


document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                

                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
                

                window.location.href = data.isAdmin ? 'admin-dashboard.html' : 'index.html';
                
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message || 'Login failed. Please try again.');
            }
        });
    }
    

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                

                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    isAdmin: data.isAdmin
                }));
                

                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('Registration error:', error);
                alert(error.message || 'Registration failed. Please try again.');
            }
        });
    }
    

    const userData = JSON.parse(localStorage.getItem('userData'));
    const userAccount = document.getElementById('user-account');
    
    if (userData && userAccount) {

        const initials = getInitials(userData.name);
        

        const profilePic = localStorage.getItem('userProfilePic');
        
        if (profilePic) {
            userAccount.innerHTML = `
                <a href="profile.html" class="user-icon">
                    <img src="${profilePic}" alt="${userData.name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                </a>
                <a href="#" id="logout" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i></a>
            `;
        } else {
            userAccount.innerHTML = `
                <a href="profile.html" class="user-icon">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background-color: #088178; color: white; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold;">
                        ${initials}
                    </div>
                </a>
                <a href="#" id="logout" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i></a>
            `;
        }
        

        const logoutButton = document.getElementById('logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userProfilePic');
                window.location.href = 'index.html';
            });
        }
    }
    

    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }
    

    updateUserAvatarsAcrossSite();
    

    if (document.getElementById('newsLetter')) {
        setupNewsletterSignup();
    }
});


async function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('userToken');
    
    if (!userData || !token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const userProfile = await fetchFromAPI('/users/profile');
        
        if (!userProfile) {
            throw new Error('Failed to load profile');
        }
        

        document.getElementById('profile-name').value = userProfile.name;
        document.getElementById('profile-email').value = userProfile.email;
        

        const orders = await fetchFromAPI('/orders/myorders');
        
        const orderHistoryContainer = document.getElementById('order-history');
        if (orderHistoryContainer && orders && orders.length > 0) {
            let orderHTML = '<table><thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Paid</th><th>Delivered</th><th></th></tr></thead><tbody>';
            
            orders.forEach(order => {
                orderHTML += `
                    <tr>
                        <td>${order._id}</td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>$${order.totalPrice.toFixed(2)}</td>
                        <td>${order.isPaid ? 'Yes' : 'No'}</td>
                        <td>${order.isDelivered ? 'Yes' : 'No'}</td>
                        <td><a href="order.html?id=${order._id}">Details</a></td>
                    </tr>
                `;
            });
            
            orderHTML += '</tbody></table>';
            orderHistoryContainer.innerHTML = orderHTML;
        } else if (orderHistoryContainer) {
            orderHistoryContainer.innerHTML = '<p>No order history found</p>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile. Please login again.');
        window.location.href = 'login.html';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {

        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            if (document.getElementById('name')) {
                document.getElementById('name').value = userData.name;
            }
            if (document.getElementById('email')) {
                document.getElementById('email').value = userData.email;
            }
        }
        
        // Display cart items in checkout
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orderSummary = document.getElementById('order-summary');
        
        if (orderSummary && cart.length > 0) {
            let summaryHTML = '<h4>Order Summary</h4><ul>';
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                summaryHTML += `
                    <li>
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${itemTotal.toFixed(2)}</span>
                    </li>
                `;
            });
            
            const shipping = 10.00; 
            total += shipping;
            
            summaryHTML += `
                <li class="shipping">
                    <span>Shipping</span>
                    <span>$${shipping.toFixed(2)}</span>
                </li>
                <li class="total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </li>
            </ul>`;
            
            orderSummary.innerHTML = summaryHTML;
        }
        
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const postalCode = document.getElementById('postal-code').value;
            const country = document.getElementById('country').value;
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            
            const itemsPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shippingPrice = 10.00; 
            const taxPrice = itemsPrice * 0.05; 
            const totalPrice = itemsPrice + shippingPrice + taxPrice;
            

            const orderItems = cart.map(item => ({
                product: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity
            }));
            
            const orderData = {
                orderItems,
                shippingAddress: {
                    address,
                    city,
                    postalCode,
                    country
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice
            };
            
            try {
                const response = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to create order');
                }
                
                localStorage.setItem('lastOrder', JSON.stringify(data));
                
                localStorage.removeItem('cart');
                
                window.location.href = `order-confirmation.html?id=${data._id}`;
                
            } catch (error) {
                console.error('Checkout error:', error);
                alert(error.message || 'Failed to process checkout. Please try again.');
            }
        });
    }
    
    if (window.location.pathname.includes('order-confirmation.html')) {
        loadOrderConfirmation();
    }
});

async function loadOrderConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        window.location.href = 'index.html';
        return;
    }
    
    const confirmationDetails = document.getElementById('confirmation-details');
    if (!confirmationDetails) return;
    
    try {
        const order = await fetchFromAPI(`/orders/${orderId}`);
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        confirmationDetails.innerHTML = `
            <h3>Thank You For Your Order!</h3>
            <p>Order #: ${order._id}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Payment Method: ${order.paymentMethod}</p>
            <h4>Order Summary</h4>
            <div class="order-items">
                ${order.orderItems.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h5>${item.name}</h5>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: $${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-totals">
                <p>Items: $${order.itemsPrice.toFixed(2)}</p>
                <p>Shipping: $${order.shippingPrice.toFixed(2)}</p>
                <p>Tax: $${order.taxPrice.toFixed(2)}</p>
                <p class="total">Total: $${order.totalPrice.toFixed(2)}</p>
            </div>
            <h4>Shipping Address</h4>
            <p>${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            <p>${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>
            <p>${order.isDelivered ? 'Delivered' : 'Not yet delivered'}</p>
        `;
    } catch (error) {
        console.error('Error loading order confirmation:', error);
        confirmationDetails.innerHTML = `<p>Failed to load order details. <a href="index.html">Return to home</a></p>`;
    }
}

function setupNewsletterSignup() {
    const newsletterSection = document.getElementById('newsLetter');
    if (!newsletterSection) return;
    
    const emailInput = newsletterSection.querySelector('input[type="text"]');
    const signupButton = newsletterSection.querySelector('button');
    
    if (emailInput && signupButton) {
        signupButton.addEventListener('click', function() {
            const email = emailInput.value.trim();
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            window.location.href = `register.html?email=${encodeURIComponent(email)}`;
        });
    }
}

function getInitials(name) {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    } else {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
}

function updateUserAvatarsAcrossSite() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userAccount = document.getElementById('user-account');
    
    if (!userData) {
        if (userAccount) {
            userAccount.innerHTML = `
                <a href="login.html" style="margin-right: 10px;"><i class="fas fa-sign-in-alt"></i></a>
                <a href="register.html"><i class="fas fa-user-plus"></i></a>
            `;
        }
        return;
    }
    
    const initials = getInitials(userData.name);
    
    const profilePic = localStorage.getItem('userProfilePic');
    
    if (userAccount) {
        if (profilePic) {
            userAccount.innerHTML = `
                <a href="profile.html" class="user-icon">
                    <img src="${profilePic}" alt="${userData.name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                </a>
                <a href="#" id="logout" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i></a>
            `;
        } else {
            userAccount.innerHTML = `
                <a href="profile.html" class="user-icon">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background-color: #088178; color: white; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold;">
                        ${initials}
                    </div>
                </a>
                <a href="#" id="logout" style="margin-left: 10px;"><i class="fas fa-sign-out-alt"></i></a>
            `;
        }
        
        const logoutButton = document.getElementById('logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('userToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userProfilePic');
                window.location.href = 'index.html';
            });
        }
    }
    
    const avatarContainers = document.querySelectorAll('.avatar-container');
    avatarContainers.forEach(container => {
        if (container.id !== 'avatar-container') { 
            if (profilePic) {
                container.innerHTML = `<img src="${profilePic}" alt="${userData.name}">`;
            } else {
                container.innerHTML = initials;
            }
        }
    });
}