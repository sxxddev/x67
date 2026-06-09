const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { store_id, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql =
      'SELECT p.*, s.name AS store_name FROM products p JOIN stores s ON p.store_id = s.id WHERE p.status = "active"';
    const params = [];

    if (store_id) {
      sql += ' AND p.store_id = ?';
      params.push(store_id);
    }

    sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [products] = await pool.query(sql, params);
    res.json({ success: true, data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, s.name AS store_name, s.delivery_fee, s.min_order_amount
       FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!products.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
    }
    res.json({ success: true, data: products[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

module.exports = router;
