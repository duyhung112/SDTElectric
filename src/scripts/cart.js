// ==== CART LOGIC START ====
// Cart Data Structure
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add product to cart (call this from product page)
function addToCart(product) {
    const idx = cart.findIndex(item => item.id === product.id);
    if (idx > -1) {
        cart[idx].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    showToast('Đã thêm vào giỏ hàng!', 'success');
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Render cart items (call this in cart page)
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart"></i><h2>Giỏ hàng của bạn đang trống</h2></div>`;
        document.getElementById('subtotal').textContent = '0₫';
        document.getElementById('total').textContent = '0₫';
        return;
    }
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.category || ''}</p>
                </div>
            </div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                <button class="quantity-btn plus">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
            <div class="cart-item-remove"><i class="fas fa-times"></i></div>
        </div>
    `).join('');
    // Gán lại sự kiện tăng/giảm số lượng
    document.querySelectorAll('.cart-item').forEach(row => {
        const id = row.getAttribute('data-id');
        row.querySelector('.quantity-btn.minus').onclick = () => updateQuantity(id, -1);
        row.querySelector('.quantity-btn.plus').onclick = () => updateQuantity(id, 1);
        row.querySelector('.quantity-input').onchange = (e) => updateQuantityInput(id, e.target.value);
        row.querySelector('.cart-item-remove').onclick = () => removeItem(id);
    });
    calculateCartTotals();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const idx = cart.findIndex(item => String(item.id) === String(itemId));
    if (idx === -1) return;
    cart[idx].quantity += change;
    if (cart[idx].quantity < 1) cart[idx].quantity = 1;
    saveCart();
    renderCartItems();
    updateCartCount();
}
function updateQuantityInput(itemId, value) {
    const idx = cart.findIndex(item => String(item.id) === String(itemId));
    let quantity = parseInt(value) || 1;
    if (quantity < 1) quantity = 1;
    cart[idx].quantity = quantity;
    saveCart();
    renderCartItems();
    updateCartCount();
}
// Remove item
function removeItem(itemId) {
    cart = cart.filter(item => String(item.id) !== String(itemId));
    saveCart();
    renderCartItems();
    updateCartCount();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
}
// Tính tổng tiền
function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(subtotal);
}
// Đếm số lượng sản phẩm
function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}
// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
// Khởi tạo trang giỏ hàng
function initCartPage() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderCartItems();
    updateCartCount();
}
// ==== CART LOGIC END ====

// Sample toast notification
        function showToast(message, type) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show';
            toast.classList.add(`toast-${type}`);
            
            if(type === 'success') {
                toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            } else if(type === 'error') {
                toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            } else {
                toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
            }
            
            setTimeout(() => {
                toast.className = 'toast';
            }, 3000);
        }
        
        // Sample event listeners
        document.querySelector('.btn-clear-cart').addEventListener('click', () => {
            showToast('Đã xóa tất cả sản phẩm khỏi giỏ hàng', 'success');
        });
        
        document.getElementById('apply-coupon').addEventListener('click', () => {
            showToast('Áp dụng mã giảm giá thành công', 'success');
        });
        
// Khi load trang giỏ hàng, tự động khởi tạo cart
if (document.getElementById('cart-items-container')) {
    document.addEventListener('DOMContentLoaded', function() {
        initCartPage();
    });
}
