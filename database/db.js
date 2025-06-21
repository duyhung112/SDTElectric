require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Debug connection config
console.log('🔧 Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000
};

const pool = mysql.createPool(config);

// Thêm bảng quản lý phiên bản
const DB_VERSION_TABLE = 'database_version';
const CURRENT_DB_VERSION = 1; // Tăng số này khi có thay đổi schema

const checkAndUpdateDatabase = async () => {
  const conn = await pool.getConnection();
  try {
    // Kiểm tra xem bảng version đã tồn tại chưa
    const [tables] = await conn.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [config.database, DB_VERSION_TABLE]);

    if (tables.length === 0) {
      // Chưa có bảng version -> database mới, chạy toàn bộ init.sql
      await runInitScript(conn);
      await conn.query(`
        CREATE TABLE ${DB_VERSION_TABLE} (
          version INT NOT NULL DEFAULT 1,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await conn.query(`
        INSERT INTO ${DB_VERSION_TABLE} (version) VALUES (?)
      `, [CURRENT_DB_VERSION]);
      console.log('🆕 Đã khởi tạo database mới');
    } else {
      // Kiểm tra phiên bản hiện tại
      const [versionRows] = await conn.query(`
        SELECT version FROM ${DB_VERSION_TABLE} LIMIT 1
      `);
      const currentVersion = versionRows[0]?.version || 0;

      if (currentVersion < CURRENT_DB_VERSION) {
        // Cập nhật schema từng bước theo version
        await updateSchema(conn, currentVersion);
        await conn.query(`
          UPDATE ${DB_VERSION_TABLE} 
          SET version = ?, updated_at = CURRENT_TIMESTAMP
        `, [CURRENT_DB_VERSION]);
        console.log(`🔄 Đã cập nhật database từ v${currentVersion} lên v${CURRENT_DB_VERSION}`);
      } else {
        console.log(`✅ Database đã ở phiên bản mới nhất (v${CURRENT_DB_VERSION})`);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi kiểm tra database:', err);
    throw err;
  } finally {
    conn.release();
  }
};

const runInitScript = async (conn) => {
  const initScript = fs.readFileSync(
    path.join(__dirname, 'init.sql'), 
    'utf-8'
  );
  
  try {
    for (const statement of initScript.split(';').filter(s => s.trim())) {
      await conn.query(statement);
    }
  } catch (err) {
    console.error('❌ Lỗi khi chạy init.sql:', err.message);
    throw err;
  }
};

const updateSchema = async (conn, currentVersion) => {
  // Thêm các câu lệnh ALTER TABLE tương ứng với từng version
  if (currentVersion < 1) {
    await runInitScript(conn); // Chạy toàn bộ script nâng cấp
  }
  // Có thể thêm các điều kiện nâng cấp từng phần ở đây
};

// Test connection và kiểm tra database
const initialize = async () => {
  if (await testConnection()) {
    await checkAndUpdateDatabase();
  }
};

const testConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1+1 AS result');
    console.log('✅ Kết nối thành công! Kết quả:', rows[0].result);
    return true;
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
};

// Tự động chạy khi import module
initialize().catch(err => {
  console.error('🚨 Khởi tạo database thất bại:', err);
  process.exit(1);
});

module.exports = { pool, testConnection };