const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { parseStringPromise, Builder } = require('xml2js');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signParams(params, key) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== '' && k !== 'sign')
    .sort();
  const str = sorted.map((k) => `${k}=${params[k]}`).join('&') + `&key=${key}`;
  return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase();
}

function buildXml(obj) {
  const builder = new Builder({ rootName: 'xml', headless: true, cdata: true });
  return builder.buildObject(obj);
}

async function parseXml(xml) {
  const result = await parseStringPromise(xml, { explicitArray: false });
  return result.xml || result;
}

router.post('/create', authenticate, async (req, res) => {
  try {
    const { order_id } = req.body;
    const userId = req.user.userId;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      order_id,
      userId,
    ]);
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์' });
    }
    const order = orders[0];
    if (order.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'ออเดอร์ชำระเงินแล้ว' });
    }

    if (process.env.NODE_ENV === 'development' || !process.env.WX_MCH_ID) {
      return res.json({
        success: true,
        data: {
          mock: true,
          order_id: order.id,
          order_no: order.order_no,
          message: 'Dev mode: call /api/payment/mock-pay to simulate payment',
        },
      });
    }

    const nonceStr = crypto.randomBytes(16).toString('hex');
    const unified = {
      appid: process.env.WX_APPID,
      mch_id: process.env.WX_MCH_ID,
      nonce_str: nonceStr,
      body: `Order-${order.order_no}`,
      out_trade_no: order.order_no,
      total_fee: Math.round(Number(order.total_amount) * 100),
      spbill_create_ip: '127.0.0.1',
      notify_url: `${process.env.API_BASE_URL}/api/payment/notify`,
      trade_type: 'JSAPI',
      openid: req.user.openid,
    };
    unified.sign = signParams(unified, process.env.WX_PAY_KEY);

    const wxRes = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      buildXml(unified),
      { headers: { 'Content-Type': 'text/xml' } }
    );
    const parsed = await parseXml(wxRes.data);
    if (parsed.return_code !== 'SUCCESS' || parsed.result_code !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: parsed.return_msg || parsed.err_code_des || 'Unified order failed',
      });
    }

    const payParams = {
      appId: process.env.WX_APPID,
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      package: `prepay_id=${parsed.prepay_id}`,
      signType: 'MD5',
    };
    payParams.paySign = signParams(payParams, process.env.WX_PAY_KEY);

    res.json({ success: true, data: payParams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'สร้างการชำระเงินไม่สำเร็จ' });
  }
});

router.post('/mock-pay', authenticate, async (req, res) => {
  try {
    const { order_id } = req.body;
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', status = 'paid', payment_time = NOW() WHERE id = ? AND user_id = ?`,
      [order_id, req.user.userId]
    );
    res.json({ success: true, message: 'จำลองชำระเงินสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'จำลองชำระเงินไม่สำเร็จ' });
  }
});

router.post('/notify', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const parsed = await parseXml(req.body);
    const sign = parsed.sign;
    delete parsed.sign;
    const calc = signParams(parsed, process.env.WX_PAY_KEY);
    if (sign !== calc) {
      return res.send(buildXml({ return_code: 'FAIL', return_msg: 'Invalid signature' }));
    }
    if (parsed.return_code === 'SUCCESS' && parsed.result_code === 'SUCCESS') {
      await pool.query(
        `UPDATE orders SET payment_status = 'paid', status = 'paid', payment_time = NOW() WHERE order_no = ?`,
        [parsed.out_trade_no]
      );
    }
    res.send(buildXml({ return_code: 'SUCCESS', return_msg: 'OK' }));
  } catch (err) {
    console.error(err);
    res.send(buildXml({ return_code: 'FAIL', return_msg: 'ERROR' }));
  }
});

module.exports = router;
