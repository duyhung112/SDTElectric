// DOM Elements
const elements = {
    header: document.querySelector('.header'),
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    mainNav: document.querySelector('.main-nav'),
    backToTop: document.querySelector('.back-to-top'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    featuredProducts: document.getElementById('featured-products'),
    newArrivals: document.getElementById('new-arrivals')
};

// Initialize Swiper sliders
function initSliders() {
    // Hero Slider
    const heroSlider = new Swiper('.hero-slider', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // Testimonials Slider
    const testimonialsSlider = new Swiper('.testimonials-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 3
            }
        }
    });

    // Brands Slider
    const brandsSlider = new Swiper('.brands-slider', {
        slidesPerView: 2,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false
        },
        breakpoints: {
            576: {
                slidesPerView: 3
            },
            768: {
                slidesPerView: 4
            },
            992: {
                slidesPerView: 6
            }
        }
    });
}

// Load products data
async function loadProducts() {
    try {
        // In a real app, you would fetch this from your API
        const products = [
            {
                id: 1,
                name: 'Smart TV 4K UHD 55 inch',
                category: 'Điện tử',
                price: 12990000,
                oldPrice: 15990000,
                image: 'images/products/tv.jpg',
                rating: 4.5,
                badge: 'hot'
            },
            {
                id: 2,
                name: 'Máy lạnh Inverter 1.5 HP',
                category: 'Điện lạnh',
                price: 8990000,
                oldPrice: 10990000,
                image: 'images/products/ac.jpg',
                rating: 4.8,
                badge: 'new'
            },
            {
                id: 3,
                name: 'Máy giặt cửa trước 9 kg',
                category: 'Gia dụng',
                price: 11990000,
                oldPrice: 13990000,
                image: 'images/products/washing-machine.jpg',
                rating: 4.7
            },
            {
                id: 4,
                name: 'Tủ lạnh Side by Side 600 lít',
                category: 'Điện lạnh',
                price: 24990000,
                oldPrice: 28990000,
                image: 'images/products/fridge.jpg',
                rating: 4.6,
                badge: 'hot'
            },
            {
                id: 5,
                name: 'Loa bluetooth di động',
                category: 'Phụ kiện',
                price: 1290000,
                oldPrice: 1590000,
                image: 'images/products/speaker.jpg',
                rating: 4.3,
                badge: 'new'
            },
            {
                id: 6,
                name: 'Bếp từ đôi cao cấp',
                category: 'Gia dụng',
                price: 5990000,
                oldPrice: 6990000,
                image: 'images/products/stove.jpg',
                rating: 4.9
            },
            {
                id: 7,
                name: 'Máy lọc không khí thông minh',
                category: 'Gia dụng',
                price: 4990000,
                oldPrice: 5990000,
                image: 'images/products/air-purifier.jpg',
                rating: 4.4,
                badge: 'new'
            },
            {
                id: 8,
                name: 'Điều khiển thông minh',
                category: 'Phụ kiện',
                price: 790000,
                oldPrice: 990000,
                image: 'images/products/remote.jpg',
                rating: 4.2
            }
        ];

        // Render featured products (first 6)
        renderProducts(products.slice(0, 6), elements.featuredProducts);

        // Render new arrivals (last 4)
        renderProducts(products.slice(-4), elements.newArrivals);

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products to the DOM
function renderProducts(products, container) {
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'Mới' : 'Hot'}</span>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-actions">
                <button class="action-btn" title="Yêu thích"><i class="far fa-heart"></i></button>
                <button class="action-btn" title="Xem nhanh"><i class="far fa-eye"></i></button>
                <button class="action-btn" title="So sánh"><i class="fas fa-exchange-alt"></i></button>
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${renderRating(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <button class="add-to-cart">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn') && !e.target.closest('.add-to-cart')) {
                const productId = card.dataset.id;
                // In a real app, you would redirect to product detail page
                console.log('View product:', productId);
            }
        });
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.querySelector('i').className;
            const productId = btn.closest('.product-card').dataset.id;
            
            if (action.includes('heart')) {
                // Add to wishlist
                btn.classList.toggle('active');
                btn.querySelector('i').classList.toggle('far');
                btn.querySelector('i').classList.toggle('fas');
                console.log('Toggle wishlist for product:', productId);
            } else if (action.includes('eye')) {
                // Quick view
                console.log('Quick view product:', productId);
            } else if (action.includes('exchange-alt')) {
                // Compare
                console.log('Compare product:', productId);
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.closest('.product-card').dataset.id;
            console.log('Add to cart:', productId);
            updateCartCount(1);
            showAddedToCartMessage(btn);
        });
    });
}

// Render star rating
function renderRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Format price with VND currency
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Update cart count in header
function updateCartCount(change) {
    const cartCount = document.querySelector('.cart-count');
    let count = parseInt(cartCount.textContent) || 0;
    count += change;
    cartCount.textContent = count;
    
    // Add animation
    cartCount.classList.add('animate');
    setTimeout(() => cartCount.classList.remove('animate'), 500);
}

// Show "added to cart" message
function showAddedToCartMessage(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
    button.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// Handle tab switching
function handleTabClick() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // In a real app, you would filter products here
            console.log('Filter by:', btn.dataset.category);
        });
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    elements.mobileMenuToggle.addEventListener('click', () => {
        elements.mainNav.classList.toggle('active');
        elements.mobileMenuToggle.innerHTML = elements.mainNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

// Show/hide back to top button
function handleBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            elements.backToTop.classList.add('active');
            elements.header.classList.add('scrolled');
        } else {
            elements.backToTop.classList.remove('active');
            elements.header.classList.remove('scrolled');
        }
    });
    
    elements.backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Hiển thị user info ở header: icon khi chưa đăng nhập, tên + nút đăng xuất khi đã đăng nhập
function renderUserHeader() {
    let headerIcons = document.querySelector('.header-icons');
    if (!headerIcons) return;
    // Xóa icon user cũ (nếu có)
    const userIcon = headerIcons.querySelector('a[aria-label="Tài khoản"]');
    if (userIcon) userIcon.remove();
    // Xóa user-info cũ nếu có
    let oldUserInfo = document.getElementById('user-info-header');
    if (oldUserInfo) oldUserInfo.remove();
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        // Đã đăng nhập: hiện tên và nút đăng xuất ở vị trí đầu tiên
        const userInfo = document.createElement('div');
        userInfo.id = 'user-info-header';
        userInfo.style.display = 'inline-flex';
        userInfo.style.alignItems = 'center';
        userInfo.style.gap = '8px';
        userInfo.innerHTML = `
            <span class="user-name" style="font-weight:500;color:#333;"><i class="fas fa-user-circle"></i> ${user.username}</span>
            <button id="logout-btn-header" style="margin-left:8px;padding:4px 12px;border:none;background:#dc3545;color:#fff;border-radius:4px;cursor:pointer;">Đăng xuất</button>
        `;
        headerIcons.prepend(userInfo);
        const logoutBtn = document.getElementById('logout-btn-header');
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                localStorage.removeItem('user');
                renderUserHeader();
                window.location.href = 'login.html';
            };
        }
    } else {
        // Chưa đăng nhập: thêm lại icon user vào đầu header-icons
        const userLink = document.createElement('a');
        userLink.href = 'login.html';
        userLink.setAttribute('aria-label', 'Tài khoản');
        userLink.innerHTML = '<i class="far fa-user"></i>';
        headerIcons.prepend(userLink);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderUserHeader();
});

// Initialize the page
function init() {
    initSliders();
    loadProducts();
    handleTabClick();
    toggleMobileMenu();
    handleBackToTop();
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Xử lý đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.onsubmit = async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showToast('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'warning');
                return;
            }

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    // Lưu user vào localStorage đúng chuẩn
                    localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }));
                    // Hiển thị thông báo đăng nhập thành công
                    localStorage.setItem('loginSuccess', '1');
                    renderUserHeader();
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    showToast(data.error || 'Đăng nhập thất bại!', 'error');
                }
            } catch (err) {
                showToast('Có lỗi khi kết nối server!', 'error');
            }
        };
    }
});

// Xử lý đăng ký user
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const username = formData.get('username').trim();
            const email = formData.get('email').trim();
            const phone = formData.get('phone').trim();
            const password = formData.get('password').trim();
            const confirmPassword = formData.get('confirm_password').trim();

            if (!username || !email || !phone || !password || !confirmPassword) {
                showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
                return;
            }
            if (password !== confirmPassword) {
                showToast('Mật khẩu nhập lại không khớp!', 'warning');
                return;
            }
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, phone, password })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                    setTimeout(() => window.location.href = 'login.html', 1200);
                } else {
                    showToast(data.error || 'Đăng ký thất bại!', 'error');
                }
            } catch (err) {
                showToast('Có lỗi khi kết nối server!', 'error');
            }
        };
    }
});

// Hiển thị toast đăng nhập thành công sau chuyển hướng
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('loginSuccess') === '1') {
        showToast('Đăng nhập thành công!', 'success');
        localStorage.removeItem('loginSuccess');
    }
});

// Hiển thị toast/thông báo UX hiện đại, tự động tạo #toast nếu thiếu
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'fixed';
        toast.style.top = '32px';
        toast.style.right = '32px';
        toast.style.zIndex = '9999';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    toast.style.background = type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#333';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.style.fontSize = '16px';
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 350);
    }, 1800);
}       