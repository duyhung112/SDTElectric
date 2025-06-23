const express = require('express');
const path = require('path');
const { pool } = require('./database/db'); // Sử dụng MySQL pool thay vì SQLite
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware xử lý lỗi database
const handleDbError = (res, err) => {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
};

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'src')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Lấy danh sách banner
app.get('/api/banners', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM banners');
        res.json(rows);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Thêm banner
app.post('/api/banners', async (req, res) => {
    const { image, title, event } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO banners (image, title, event) VALUES (?, ?, ?)',
            [image, title, event]
        );
        res.json({ id: result.insertId, image, title, event });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Xóa banner
app.delete('/api/banners/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Đăng ký user
app.post('/api/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length > 0) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
            [username, hash, email, phone]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Đăng nhập user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });

        const match = await bcrypt.compare(password, users[0].password);
        if (!match) return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });

        res.json({ success: true, role: users[0].role });
    } catch (err) {
        handleDbError(res, err);
    }
});

// API đếm số lượng user
app.get('/api/users/count', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        res.json({ count: rows[0].count });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Lấy danh sách user
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email, phone, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Thêm user mới
app.post('/api/users', async (req, res) => {
    const { username, password, email, phone, role } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length > 0) return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)',
            [username, hash, email, phone, role || 'user']
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Xóa user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ error: 'User không tồn tại' });
        if (users[0].role === 'admin') return res.status(400).json({ error: 'Không thể xóa tài khoản admin!' });

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Sửa thông tin user
app.put('/api/users/:id', async (req, res) => {
    const { email, phone, role, password } = req.body;
    try {
        let query, params;
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET email = ?, phone = ?, role = ?, password = ? WHERE id = ?';
            params = [email, phone, role, hash, req.params.id];
        } else {
            query = 'UPDATE users SET email = ?, phone = ?, role = ? WHERE id = ?';
            params = [email, phone, role, req.params.id];
        }

        const [result] = await pool.query(query, params);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Lấy danh sách danh mục
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Thêm danh mục
app.post('/api/categories', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Sửa danh mục
app.put('/api/categories/:id', async (req, res) => {
    const { name, description } = req.body;
    try {
        const [result] = await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Xóa danh mục
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
        if (products[0].count > 0) return res.status(400).json({ error: 'Không thể xóa danh mục đã có sản phẩm!' });

        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error('GET /api/products error:', err);
        handleDbError(res, err);
    }
});

// Thêm sản phẩm
app.post('/api/products', async (req, res) => {
    let { name, price, category_id, brand_id, image, featured, new: isNew } = req.body;
    try {
        // Ép kiểu an toàn cho các trường số
        price = price !== undefined && price !== null && price !== '' ? Number(price) : null;
        category_id = category_id !== undefined && category_id !== null && category_id !== '' ? Number(category_id) : null;
        brand_id = brand_id !== undefined && brand_id !== null && brand_id !== '' ? Number(brand_id) : null;
        featured = featured ? 1 : 0;
        isNew = isNew ? 1 : 0;

        if (!name || price === null || category_id === null || !image) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
        }

        // Kiểm tra độ dài đường dẫn ảnh
        if (typeof image !== 'string' || image.length > 255) {
            return res.status(400).json({ error: 'Đường dẫn ảnh không hợp lệ hoặc quá dài (tối đa 255 ký tự).' });
        }

        console.log('POST /api/products body:', req.body);
        const [result] = await pool.query(
            'INSERT INTO products (name, price, category_id, brand_id, image, featured, new_products) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, price, category_id, brand_id, image, featured, isNew]
        );
        console.log('Insert result:', result);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('POST /api/products error:', err);
        handleDbError(res, err);
    }
});

// Sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category_id, image, featured, new: isNew } = req.body;

        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

        const product = products[0];

        const [result] = await pool.query(
            'UPDATE products SET name=?, price=?, category_id=?, image=?, featured=?, new_products=? WHERE id=?',
            [
                name || product.name,
                price || product.price,
                category_id || product.category_id,
                image || product.image,
                typeof featured !== 'undefined' ? featured : product.featured,
                typeof isNew !== 'undefined' ? isNew : product.new_products,
                id
            ]
        );

        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});

// === CẤU HÌNH MULTER TỐI ƯU CHO UPLOAD ẢNH ===
function createImageUploader(folder) {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(__dirname, folder));
            },
            filename: function (req, file, cb) {
                let ext = path.extname(file.originalname).toLowerCase();
                const base = path.basename(file.originalname, ext);
                const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
                // Log để debug
                console.log('UPLOAD DEBUG:', {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    ext
                });
                // Nếu không có đuôi mở rộng, lấy từ mimetype
                if (!ext) {
                    const mimeToExt = {
                        'image/jpeg': '.jpg',
                        'image/png': '.png',
                        'image/gif': '.gif',
                        'image/webp': '.webp',
                        'image/bmp': '.bmp',
                        'image/svg+xml': '.svg'
                    };
                    ext = mimeToExt[file.mimetype] || '';
                    console.log('UPLOAD DEBUG: mapped ext from mimetype:', ext);
                }
                cb(null, Date.now() + '_' + safeBase + ext);
            }
        }),
        fileFilter: function (req, file, cb) {
            // Chỉ cho phép file ảnh
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Chỉ cho phép upload file ảnh!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB
    });
}

const uploadProductImage = createImageUploader('src/img/products');
const uploadBannerImage = createImageUploader('src/img/banner');
const uploadBrandLogo = createImageUploader('src/img/brands');

// === API UPLOAD ẢNH ===
app.post('/api/upload-product-image', (req, res) => {
    uploadProductImage.single('image')(req, res, function (err) {
        if (err) return res.status(400).json({ error: err.message || 'Lỗi upload ảnh sản phẩm!' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        res.json({ image: 'img/products/' + req.file.filename });
    });
});
app.post('/api/upload-banner-image', (req, res) => {
    uploadBannerImage.single('image')(req, res, function (err) {
        if (err) return res.status(400).json({ error: err.message || 'Lỗi upload banner!' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        res.json({ image: 'img/banner/' + req.file.filename });
    });
});
app.post('/api/upload-brand-logo', (req, res) => {
    uploadBrandLogo.single('logo')(req, res, function (err) {
        if (err) return res.status(400).json({ error: err.message || 'Lỗi upload logo!' });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        res.json({ logo: 'img/brands/' + req.file.filename });
    });
});

// API cập nhật trạng thái nổi bật
app.put('/api/products/:id/featured', async (req, res) => {
    try {
        const { featured } = req.body;
        const id = req.params.id;

        if (featured === 1) {
            const [featuredCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE featured = 1');
            if (featuredCount[0].count >= 4) {
                return res.status(400).json({ error: 'Chỉ được chọn tối đa 4 sản phẩm nổi bật!' });
            }
        }

        const [result] = await pool.query('UPDATE products SET featured = ? WHERE id = ?', [featured, id]);
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        handleDbError(res, err);
    }
});
// API cập nhật trạng thái sản phẩm mới
app.put('/api/products/:id/new', async (req, res) => {
    try {
        const { new_status } = req.body;
        const id = req.params.id;

        // Kiểm tra giá trị hợp lệ
        if (![0, 1].includes(Number(new_status))) {
            return res.status(400).json({ error: 'Giá trị không hợp lệ. Chỉ nhận 0 hoặc 1.' });
        }

        const [result] = await pool.query(
            'UPDATE products SET new_products = ? WHERE id = ?', 
            [new_status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
        }

        res.json({ success: true });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Lấy danh sách thương hiệu
app.get('/api/brands', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, logo, description FROM brands');
        res.json(rows);
    } catch (err) {
        handleDbError(res, err);
    }
});

// Thêm thương hiệu
app.post('/api/brands', async (req, res) => {
    const { name, logo, description } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ error: 'Tên thương hiệu là bắt buộc.' });
        }
        const [result] = await pool.query(
            'INSERT INTO brands (name, logo, description) VALUES (?, ?, ?)',
            [name, logo || null, description || null]
        );
        res.json({ id: result.insertId, name, logo, description });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Sửa thương hiệu
app.put('/api/brands/:id', async (req, res) => {
    const { name, logo, description } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ error: 'Tên thương hiệu là bắt buộc.' });
        }
        const [result] = await pool.query(
            'UPDATE brands SET name=?, logo=?, description=? WHERE id=?',
            [name, logo || null, description || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thương hiệu.' });
        }
        res.json({ id: req.params.id, name, logo, description });
    } catch (err) {
        handleDbError(res, err);
    }
});

// Xóa thương hiệu
app.delete('/api/brands/:id', async (req, res) => {
    try {
        // Kiểm tra xem có sản phẩm nào đang sử dụng thương hiệu này không
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE brand_id = ?', [req.params.id]);
        if (products[0].count > 0) {
            return res.status(400).json({ error: 'Không thể xóa thương hiệu đã có sản phẩm!' });
        }

        const [result] = await pool.query('DELETE FROM brands WHERE id=?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Không tìm thấy thương hiệu.' });
        }
    } catch (err) {
        handleDbError(res, err);
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});