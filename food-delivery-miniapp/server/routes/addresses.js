const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, is_default } = req.body;
    const userId = req.user.userId;
    if (!name || !phone || !detail) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกที่อยู่ให้ครบ' });
    }
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, phone, province || '', city || '', district || '', detail, is_default ? 1 : 0]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, province, city, district, detail, is_default } = req.body;
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    await pool.query(
      `UPDATE addresses SET name=?, phone=?, province=?, city=?, district=?, detail=?, is_default=?
       WHERE id=? AND user_id=?`,
      [name, phone, province, city, district, detail, is_default ? 1 : 0, req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

module.exports = router;
