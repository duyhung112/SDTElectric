// Quản lý banner

// Biến toàn cục để lưu đường dẫn ảnh đã tải lên cho sản phẩm
let uploadedImagePath = '';

async function fetchBanners() {
    const res = await fetch('/api/banners');
    return await res.json();
}

async function addBanner(banner) {
    const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner)
    });
    return await res.json();
}

async function deleteBanner(id) {
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    renderBanners();
}

async function renderBanners() {
    const banners = await fetchBanners();
    const tbody = document.getElementById('banner-table-body');
    tbody.innerHTML = '';
    banners.forEach((banner, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${banner.image}" alt="Banner" style="max-width:120px; border-radius:6px;"></td>
                <td>${banner.title || ''}</td>
                <td>${banner.event || ''}</td>
                <td>
                    <button class="btn-delete" onclick="deleteBanner(${banner.id})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

function showAddBannerModal() {
    document.getElementById('banner-modal').style.display = 'block';
    document.getElementById('banner-form').reset();
}

function closeBannerModal() {
    document.getElementById('banner-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    renderBanners();

    document.getElementById('banner-form').onsubmit = async function (e) {
        e.preventDefault();
        const imageInput = document.getElementById('banner-image');
        const title = document.getElementById('banner-title').value;
        const eventText = document.getElementById('banner-event').value;

        let imagePath = "img/banner/" + (imageInput.files[0]?.name || "baner1.jpg");

        await addBanner({ image: imagePath, title, event: eventText });
        closeBannerModal();
        renderBanners();
    };

    window.onclick = function (event) {
        const modal = document.getElementById('banner-modal');
        if (event.target === modal) {
            closeBannerModal();
        }
    };
});

function showToast(message, isError = false) {
    alert(message);
}

async function fetchUsers() {
    const res = await fetch('/api/users');
    return await res.json();
}

async function addUser(user) {
    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
}

async function updateUser(id, user) {
    const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
}

async function deleteUser(id) {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa user thành công!');
        renderUsers();
    } else {
        showToast(data.error || 'Xóa user thất bại!', true);
    }
}

async function renderUsers() {
    const users = await fetchUsers();
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    users.forEach((u, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${u.username}</td>
                <td>${u.email || ''}</td>
                <td>${u.phone || ''}</td>
                <td>${u.role}</td>
                <td>
                    <button class="btn-edit" onclick="showEditUserModal(${u.id}, '${u.username}', '${u.email || ''}', '${u.phone || ''}', '${u.role}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteUser(${u.id})" ${u.role === 'admin' ? 'disabled title="Không thể xóa admin"' : ''}>Xóa</button>
                </td>
            </tr>
        `;
    });
}

function showAddUserModal() {
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('user-modal-title').textContent = 'Thêm User';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-username').disabled = false;
}

function showEditUserModal(id, username, email, phone, role) {
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('user-modal-title').textContent = 'Chỉnh sửa User';
    document.getElementById('user-id').value = id;
    document.getElementById('user-username').value = username;
    document.getElementById('user-username').disabled = true;
    document.getElementById('user-email').value = email;
    document.getElementById('user-phone').value = phone;
    document.getElementById('user-role').value = role;
    document.getElementById('user-password').value = '';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    renderUsers();

    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.onsubmit = async function (e) {
            e.preventDefault();
            const id = document.getElementById('user-id').value;
            const username = document.getElementById('user-username').value.trim();
            const password = document.getElementById('user-password').value;
            const email = document.getElementById('user-email').value.trim();
            const phone = document.getElementById('user-phone').value.trim();
            const role = document.getElementById('user-role').value;

            if (!username) {
                showToast('Vui lòng nhập tên đăng nhập!', true);
                return;
            }

            if (id) {
                const result = await updateUser(id, { email, phone, role, password });
                if (result.success) {
                    showToast('Cập nhật user thành công!');
                    closeUserModal();
                    renderUsers();
                } else {
                    showToast(result.error || 'Cập nhật user thất bại!', true);
                }
            } else {
                if (!password) {
                    showToast('Vui lòng nhập mật khẩu!', true);
                    return;
                }
                const result = await addUser({ username, password, email, phone, role });
                if (result.success) {
                    showToast('Thêm user thành công!');
                    closeUserModal();
                    renderUsers();
                } else {
                    showToast(result.error || 'Thêm user thất bại!', true);
                }
            }
        };
    }
});

async function fetchCategories() {
    const res = await fetch('/api/categories');
    return await res.json();
}

async function addCategory(category) {
    const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    return await res.json();
}

async function updateCategory(id, category) {
    const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    return await res.json();
}

async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa danh mục thành công!');
        renderCategories();
    } else {
        showToast(data.error || 'Xóa danh mục thất bại!', true);
    }
}

async function renderCategories() {
    const categories = await fetchCategories();
    const tbody = document.getElementById('category-table-body');
    tbody.innerHTML = '';
    categories.forEach((cat, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${cat.name}</td>
                <td>${cat.description || ''}</td>
                <td>
                    <button class="btn-edit" onclick="showEditCategoryModal(${cat.id}, '${cat.name.replace(/'/g,"\\'")}', '${(cat.description||'').replace(/'/g,"\\'")}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteCategory(${cat.id})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

function showAddCategoryModal() {
    document.getElementById('category-modal').style.display = 'block';
    document.getElementById('category-modal-title').textContent = 'Thêm Danh mục';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
}

function showEditCategoryModal(id, name, description) {
    document.getElementById('category-modal').style.display = 'block';
    document.getElementById('category-modal-title').textContent = 'Chỉnh sửa Danh mục';
    document.getElementById('category-id').value = id;
    document.getElementById('category-name').value = name;
    document.getElementById('category-description').value = description;
}

function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    renderCategories();

    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.onsubmit = async function (e) {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const name = document.getElementById('category-name').value.trim();
            const description = document.getElementById('category-description').value.trim();

            if (!name) {
                showToast('Vui lòng nhập tên danh mục!', true);
                return;
            }

            if (id) {
                const result = await updateCategory(id, { name, description });
                if (result.success) {
                    showToast('Cập nhật danh mục thành công!');
                    closeCategoryModal();
                    renderCategories();
                } else {
                    showToast(result.error || 'Cập nhật thất bại!', true);
                }
            } else {
                const result = await addCategory({ name, description });
                if (result.success) {
                    showToast('Thêm danh mục thành công!');
                    closeCategoryModal();
                    renderCategories();
                } else {
                    showToast(result.error || 'Thêm thất bại!', true);
                }
            }
        };
    }
});

async function fetchProducts() {
    const res = await fetch('/api/products');
    return await res.json();
}

async function addProduct(product) {
    const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await res.json();
}

async function updateProduct(id, product) {
    const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return await res.json();
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
        showToast('Xóa sản phẩm thành công!');
        renderProducts();
    } else {
        showToast(data.error || 'Xóa sản phẩm thất bại!', true);
    }
}

async function renderProducts() {
    const products = await fetchProducts();
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';
    products.forEach((p, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${Number(p.price).toLocaleString()}đ</td>
                <td>${p.category_name || ''}</td>
                <td><img src="${p.image}" alt="${p.name}" style="max-width:60px; border-radius:4px;"></td>
                <td>
                    <span class="star-featured" data-id="${p.id}" style="cursor:pointer;">
                        <i class="fas fa-star${p.featured == 1 ? '' : '-o'}" style="color:${p.featured == 1 ? '#FFD600' : '#ccc'};font-size:1.4em;"></i>
                    </span>
                </td>
                <td>
                    <span class="star-new" data-id="${p.id}" style="cursor:pointer;" title="${p.new_products == 1 ? 'Bỏ sản phẩm mới' : 'Đặt sản phẩm mới'}">
                        <i class="fas fa-bolt${p.new_products == 1 ? '' : '-o'}" style="color:${p.new_products == 1 ? '#FFD600' : '#ccc'};font-size:1.4em;"></i>
                    </span>
                </td>
                <td>
                  <button class="btn-edit" onclick="showEditProductModal(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.price}, ${p.category_id}, '${p.image.replace(/'/g,"\\'")}', ${p.featured == 1 ? 1 : 0}, ${p.new_products == 1 ? 1 : 0})">Sửa</button>
                  <button class="btn-delete" onclick="deleteProduct(${p.id})">Xóa</button>
                </td>
            </tr>
        `;
    });

    // Gán sự kiện click cho icon ngôi sao (nổi bật)
    document.querySelectorAll('.star-featured').forEach(star => {
        star.onclick = async function() {
            const id = this.dataset.id;
            await toggleFeaturedProduct(id);
            renderProducts();
        };
    });

    // 👇 Thêm đoạn này tại đây để xử lý cho sản phẩm mới
    document.querySelectorAll('.star-new').forEach(star => {
        star.onclick = async function () {
            const id = this.dataset.id;
            await toggleNewProduct(id);
            renderProducts();
        };
    });
}

async function showAddProductModal() {
    document.getElementById('product-modal').style.display = 'block';
    document.getElementById('product-modal-title').textContent = 'Thêm Sản phẩm';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-image-preview').src = ''; // Xóa ảnh xem trước
    document.getElementById('product-image-preview').style.display = 'none'; // Ẩn ảnh xem trước
    uploadedImagePath = ''; // Reset đường dẫn ảnh đã tải lên
    const uploadStatus = document.getElementById('product-image-upload-status');
    if (uploadStatus) uploadStatus.textContent = '';
    await renderCategoryOptions();
    fillBrandSelect();
}

async function showEditProductModal(id, name, price, category_id, image, featured, isNew) {
    document.getElementById('product-modal').style.display = 'block';
    document.getElementById('product-modal-title').textContent = 'Chỉnh sửa Sản phẩm';
    document.getElementById('product-id').value = id;
    document.getElementById('product-name').value = name;
    document.getElementById('product-price').value = price;
    await renderCategoryOptions(category_id);
    document.getElementById('product-image-preview').src = image || ''; // Hiển thị ảnh hiện tại
    document.getElementById('product-image-preview').style.display = image ? 'block' : 'none';
    document.getElementById('product-featured').checked = featured == 1;
    document.getElementById('product-new').checked = isNew == 1; // Đặt trạng thái cho checkbox "sản phẩm mới"
    uploadedImagePath = image; // Lưu đường dẫn ảnh hiện tại
    const uploadStatus = document.getElementById('product-image-upload-status');
    if (uploadStatus) uploadStatus.textContent = '';
    // Lấy brand_id của sản phẩm và truyền vào fillBrandSelect
    const products = await fetchProducts();
    const product = products.find(p => p.id == id);
    fillBrandSelect(product ? product.brand_id : null);
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    // Xóa giá trị của input file để sự kiện 'change' có thể kích hoạt lại nếu chọn cùng một file
    const imageInput = document.getElementById('product-image');
    if (imageInput) imageInput.value = '';
}

// Xử lý form sản phẩm
document.addEventListener('DOMContentLoaded', function () {
    renderProducts();

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.onsubmit = async function (e) {
            e.preventDefault();

            const name = document.getElementById('product-name').value.trim();
            const price = document.getElementById('product-price').value;
            const category_id = document.getElementById('product-category').value;

            // Sử dụng đường dẫn ảnh đã được tải lên
            let imageToSend = uploadedImagePath;

            // Ngăn việc gửi dữ liệu base64 nếu ảnh chưa tải lên xong
            if (imageToSend && imageToSend.startsWith('data:')) {
                showToast('Vui lòng đợi ảnh tải lên hoàn tất hoặc chọn lại ảnh.', true);
                return;
            }

            if (!imageToSend || imageToSend.length > 255 || !imageToSend.startsWith('img/products/')) {
                showToast('Vui lòng tải lên ảnh sản phẩm hợp lệ!', true);
                return;
            }

            if (!name || !price || !category_id) {
                showToast('Vui lòng nhập đầy đủ thông tin sản phẩm!', true);
                return;
            }

            const id = document.getElementById('product-id').value;
            const payload = {
                name,
                price,
                category_id,
                image: imageToSend,
                featured: document.getElementById('product-featured').checked ? 1 : 0,
                new: document.getElementById('product-new').checked ? 1 : 0, // Lấy trạng thái "mới"
                brand_id: document.getElementById('product-brand').value || null
            };

            let result;
            try {
                if (id) {
                    result = await updateProduct(id, payload);
                } else {
                    result = await addProduct(payload);
                }
            } catch (err) {
                showToast('Lỗi kết nối server!', true);
                return;
            }

            if (result && result.success) {
                showToast('Lưu sản phẩm thành công!');
                closeProductModal();
                renderProducts();
            } else {
                showToast((result && result.error) || 'Có lỗi xảy ra khi lưu sản phẩm!', true);
            }
        };
    }
});

// Xử lý upload và hiển thị ảnh preview khi người dùng chọn file
document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('product-image');
    const preview = document.getElementById('product-image-preview');
    const uploadStatus = document.getElementById('product-image-upload-status');

    if (imageInput && preview) {
        imageInput.addEventListener('change', async function () {
            const file = this.files[0];
            if (!file) {
                preview.src = '';
                preview.style.display = 'none';
                uploadedImagePath = '';
                if (uploadStatus) uploadStatus.textContent = '';
                return;
            }

            // 1. Hiển thị preview ngay lập tức
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);

            // 2. Tải file lên server
            if (uploadStatus) uploadStatus.textContent = 'Đang tải ảnh lên...';
            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch('/api/upload-product-image', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (res.ok && data.image) {
                    uploadedImagePath = data.image; // Lưu đường dẫn trả về từ server
                    if (uploadStatus) uploadStatus.textContent = 'Tải ảnh lên thành công!';
                    showToast('Tải ảnh lên thành công!');
                } else {
                    uploadedImagePath = ''; // Xóa đường dẫn nếu có lỗi
                    if (uploadStatus) uploadStatus.textContent = 'Lỗi: ' + (data.error || 'Không rõ');
                    showToast('Lỗi tải ảnh lên: ' + (data.error || 'Không rõ'), true);
                }
            } catch (error) {
                uploadedImagePath = '';
                if (uploadStatus) uploadStatus.textContent = 'Lỗi kết nối khi tải ảnh.';
                showToast('Lỗi kết nối khi tải ảnh lên.', true);
            }
        });
    }
});

async function renderCategoryOptions(selectedId) {
    const categories = await fetchCategories();
    const select = document.getElementById('product-category');
    select.innerHTML = categories.map(cat => `
        <option value="${cat.id}" ${selectedId == cat.id ? 'selected' : ''}>${cat.name}</option>
    `).join('');
}

async function fillBrandSelect(selectedId) {
    const brands = await fetchBrands();
    const select = document.getElementById('product-brand');
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn thương hiệu --</option>' + brands.map(b => `
        <option value="${b.id}" ${selectedId == b.id ? 'selected' : ''}>${b.name}</option>
    `).join('');
}

async function fetchBrands() {
    // Sửa lại: dùng đường dẫn tương đối
    const res = await fetch('/api/brands');
    return await res.json();
}

// Hiển thị danh sách thương hiệu
async function renderBrands() {
    const brands = await fetchBrands();
    const tbody = document.getElementById('brand-table-body');
    tbody.innerHTML = '';
    brands.forEach((b, i) => {
        // Sử dụng JSON.stringify để escape chuỗi an toàn
        const nameStr = JSON.stringify(b.name || '');
        const logoStr = JSON.stringify(b.logo || '');
        const descStr = JSON.stringify(b.description || '');
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${b.name}</td>
                <td>${b.logo ? `<img src="${b.logo}" alt="Logo" style="max-width:60px;">` : ''}</td>
                <td>${b.description || ''}</td>
                <td>
                    <button class="btn-edit" onclick="showEditBrandModal(${b.id}, ${nameStr}, ${logoStr}, ${descStr})">Sửa</button>
                    <button class="btn-delete" onclick="deleteBrand(${b.id})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

// Mở modal để thêm thương hiệu mới.
// Hàm này được gọi bởi nút "Thêm thương hiệu".
function addBrand() {
    document.getElementById('brand-modal').style.display = 'block';
    document.getElementById('brand-modal-title').textContent = 'Thêm Thương hiệu';
    document.getElementById('brand-form').reset();
    document.getElementById('brand-id').value = ''; // Clear hidden ID for new entry
}

// Hiển thị modal sửa thương hiệu
function showEditBrandModal(id, name, logo = '', description = '') {
    document.getElementById('brand-modal').style.display = 'block';
    document.getElementById('brand-modal-title').textContent = 'Chỉnh sửa Thương hiệu';
    document.getElementById('brand-id').value = id;
    document.getElementById('brand-name').value = name;
    document.getElementById('brand-description').value = description || '';
    // Hiển thị logo preview nếu có
    const preview = document.getElementById('brand-logo-preview');
    if (logo) {
        preview.src = logo;
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
    // Reset input file
    document.getElementById('brand-logo').value = '';
}

// Đóng modal thương hiệu
function closeBrandModal() {
    document.getElementById('brand-modal').style.display = 'none';
}

// Hàm xóa thương hiệu
async function deleteBrand(id) {
    if (!confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;
    try {
        const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.error) {
            showToast(data.error, true);
        } else {
            showToast('Đã xóa thương hiệu!');
            renderBrands();
        }
    } catch (err) {
        showToast('Lỗi xóa thương hiệu!', true);
    }
}

// Xử lý form thêm/sửa thương hiệu
// Đảm bảo DOMContentLoaded chỉ đăng ký 1 lần

document.addEventListener('DOMContentLoaded', function() {
    renderBrands();
    const brandForm = document.getElementById('brand-form');
    const logoInput = document.getElementById('brand-logo');
    const logoPreview = document.getElementById('brand-logo-preview');
    const logoStatus = document.getElementById('brand-logo-upload-status');

    // Xử lý upload logo và preview khi chọn file
    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', async function () {
            const file = this.files[0];
            if (!file) {
                logoPreview.src = '';
                logoPreview.style.display = 'none';
                if (logoStatus) logoStatus.textContent = '';
                return;
            }
            // Hiển thị preview ngay
            const reader = new FileReader();
            reader.onload = function (e) {
                logoPreview.src = e.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            // Upload lên server
            if (logoStatus) logoStatus.textContent = 'Đang tải logo...';
            const formData = new FormData();
            formData.append('logo', file);
            try {
                const res = await fetch('/api/upload-brand-logo', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok && data.logo) {
                    logoPreview.setAttribute('data-uploaded', data.logo); // Lưu đường dẫn thực tế trả về
                    if (logoStatus) logoStatus.textContent = 'Tải logo thành công!';
                    showToast('Tải logo thành công!');
                } else {
                    logoPreview.removeAttribute('data-uploaded');
                    if (logoStatus) logoStatus.textContent = 'Lỗi: ' + (data.error || 'Không rõ');
                    showToast('Lỗi tải logo: ' + (data.error || 'Không rõ'), true);
                }
            } catch (err) {
                logoPreview.removeAttribute('data-uploaded');
                if (logoStatus) logoStatus.textContent = 'Lỗi kết nối khi tải logo.';
                showToast('Lỗi kết nối khi tải logo.', true);
            }
        });
    }

    if (brandForm) {
        brandForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('brand-id').value;
            const name = document.getElementById('brand-name').value.trim();
            const description = document.getElementById('brand-description').value.trim();
            let logo = '';
            // Lấy logo đã upload nếu có
            if (logoPreview && logoPreview.getAttribute('data-uploaded')) {
                logo = logoPreview.getAttribute('data-uploaded');
            } else if (logoPreview && logoPreview.src && !logoPreview.src.includes('placeholder') && logoPreview.style.display !== 'none') {
                logo = logoPreview.src;
            }
            // Gửi dữ liệu lên server
            const brandData = { name, logo, description };
            let url = '/api/brands';
            let method = 'POST';
            if (id) {
                url = `/api/brands/${id}`;
                method = 'PUT';
            }
            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(brandData)
                });
                const data = await res.json();
                if (data.error) {
                    showToast(data.error, true);
                } else {
                    showToast('Lưu thương hiệu thành công!');
                    closeBrandModal();
                    renderBrands();
                }
            } catch (err) {
                showToast('Lỗi lưu thương hiệu!', true);
            }
        };
    }
});

// Toggle sản phẩm nổi bật
async function toggleFeaturedProduct(productId) {
    const products = await fetchProducts();
    const product = products.find(p => p.id == productId);
    const newStatus = product.featured == 1 ? 0 : 1;

    if (newStatus == 1) {
        const featuredCount = products.filter(p => p.featured == 1).length;
        if (featuredCount >= 4) {
            showToast('Chỉ được chọn tối đa 4 sản phẩm nổi bật!', true);
            return;
        }
    }
    // Sử dụng API chuyên dụng
    const res = await fetch(`/api/products/${productId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newStatus })
    });
    const result = await res.json();

    if (result && result.success) {
        showToast(newStatus === 1 ? 'Đã thêm sản phẩm vào danh sách nổi bật!' : 'Đã bỏ sản phẩm khỏi danh sách nổi bật!');
    } else {
        showToast((result && result.error) || 'Cập nhật thất bại!', true);
    }
}


// Toggle trạng thái "sản phẩm mới"
async function toggleNewProduct(productId) {
    const products = await fetchProducts();
    const product = products.find(p => p.id == productId); // Tìm sản phẩm
    const newStatus = product.new_products == 1 ? 0 : 1; // Đọc đúng thuộc tính `new_products` và đảo ngược trạng thái

    // Sử dụng API chuyên dụng
    const res = await fetch(`/api/products/${productId}/new`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus }) // Server mong muốn `new_status`
    });
    const result = await res.json();

    if (result && result.success) {
        showToast(newStatus === 1 ? 'Sản phẩm được đánh dấu là mới' : 'Sản phẩm không còn là mới');
    } else {
        showToast((result && result.error) || 'Cập nhật thất bại!', true);
    }
}
// Lấy số lượng user
async function updateUserCount() {
    try {
        const res = await fetch('/api/users/count');
        const data = await res.json();
        document.getElementById('stat-users').textContent = data.count;
    } catch (e) {
        document.getElementById('stat-users').textContent = '0';
    }
}

// Lấy số lượng banner
async function updateBannerCount() {
    try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        document.getElementById('stat-banners').textContent = data.length;
    } catch (e) {
        document.getElementById('stat-banners').textContent = '0';
    }
}

// Lấy số lượng danh mục
async function updateCategoryCount() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        document.getElementById('stat-categories').textContent = data.length;
    } catch (e) {
        document.getElementById('stat-categories').textContent = '0';
    }
}

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', function () {
    renderBanners();
    updateUserCount();
    updateBannerCount();
    updateCategoryCount();
});

// Chuyển tab sidebar
document.addEventListener('DOMContentLoaded', function () {
    const tabLinks = document.querySelectorAll('.sidebar nav li');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function () {
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);

            if (tabContent) tabContent.classList.add('active');

            if (tabId === 'brands') renderBrands();
            if (tabId === 'products') renderProducts();
            if (tabId === 'categories') renderCategories();
            if (tabId === 'users') renderUsers();
            if (tabId === 'banners') renderBanners();
        });
    });
});