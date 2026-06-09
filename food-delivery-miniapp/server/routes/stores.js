const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE status = "active" ORDER BY id ASC'
    );
    res.json({ success: true, data: stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

module.exports = router;
