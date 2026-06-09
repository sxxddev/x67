const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function genOrderNo() {
  return `ORD${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

router.post('/', authenticate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { store_id, items, address_id, remark, address } = req.body;
    const userId = req.user.userId;

    if (!store_id || !items?.length) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบ' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await conn.query(
        'SELECT * FROM products WHERE id = ? AND status = "active" FOR UPDATE',
        [item.product_id]
      );
      if (!products.length) throw new Error(`ไม่พบสินค้า ${item.product_id}`);
      const product = products[0];
      const qty = Number(item.quantity) || 1;
      if (product.stock < qty) throw new Error(`${product.name} สินค้าไม่พอ`);

      const subtotal = Number(product.price) * qty;
      totalAmount += subtotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: qty,
        subtotal,
      });
    }

    const [stores] = await conn.query('SELECT * FROM stores WHERE id = ?', [store_id]);
    if (!stores.length) throw new Error('ไม่พบร้านค้า');
    const deliveryFee = Number(stores[0].delivery_fee) || 0;
    const finalAmount = totalAmount + deliveryFee;
    const orderNo = genOrderNo();

    let deliveryAddress = '';
    if (address_id) {
      const [addrs] = await conn.query(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [address_id, userId]
      );
      if (addrs.length) deliveryAddress = JSON.stringify(addrs[0]);
    } else if (address) {
      deliveryAddress = JSON.stringify(address);
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_no, user_id, store_id, address_id, total_amount, delivery_fee, delivery_address, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNo, userId, store_id, address_id || null, finalAmount, deliveryFee, deliveryAddress, remark || '']
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
        item.quantity,
        item.product_id,
      ]);
    }

    await conn.commit();
    res.json({
      success: true,
      data: { order_id: orderId, order_no: orderNo, total_amount: finalAmount },
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ success: false, message: err.message || 'สร้างออเดอร์ไม่สำเร็จ' });
  } finally {
    conn.release();
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const offset = (Number(page) - 1) * Number(limit);

    let sql =
      'SELECT o.*, s.name AS store_name FROM orders o JOIN stores s ON o.store_id = s.id WHERE o.user_id = ?';
    const params = [userId];
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [orders] = await pool.query(sql, params);
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, s.name AS store_name FROM orders o JOIN stores s ON o.store_id = s.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์' });
    }
    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

module.exports = router;
