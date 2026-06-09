const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'food_delivery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(100) UNIQUE NOT NULL,
        nickname VARCHAR(100),
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        logo_url VARCHAR(500),
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        store_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        category_id INT DEFAULT 0,
        stock INT DEFAULT 999,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        province VARCHAR(50),
        city VARCHAR(50),
        district VARCHAR(50),
        detail VARCHAR(200) NOT NULL,
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        address_id INT,
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        status ENUM('pending', 'paid', 'preparing', 'delivering', 'completed', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'wechat',
        payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
        payment_time TIMESTAMP NULL,
        delivery_address TEXT,
        remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    const [stores] = await connection.query('SELECT COUNT(*) AS c FROM stores');
    if (stores[0].c === 0) {
      await connection.query(
        `INSERT INTO stores (name, description, delivery_fee, min_order_amount) VALUES (?, ?, ?, ?)`,
        ['ร้านตัวอย่าง', 'ยินดีต้อนรับ', 5.0, 20.0]
      );
      const [rows] = await connection.query('SELECT id FROM stores LIMIT 1');
      const storeId = rows[0].id;
      await connection.query(
        `INSERT INTO products (store_id, name, description, price, image_url, stock) VALUES
         (?, 'ข้าวหน้าไก่', 'ข้าวหน้าไก่สูตรดั้งเดิม', 28.00, '', 100),
         (?, 'น้ำผลไม้สด', 'น้ำส้มคั้นสด', 12.00, '', 100),
         (?, 'เซ็ตสปาเกตตี', 'สปาเกตตีซอสมะเขือเทศ', 35.00, '', 50)`,
        [storeId, storeId, storeId]
      );
    }

    console.log('Database initialized');
  } catch (err) {
    console.error('Database init failed:', err.message);
  } finally {
    connection.release();
  }
}

initDatabase();

module.exports = pool;
