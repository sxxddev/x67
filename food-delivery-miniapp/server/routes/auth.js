const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'ไม่พบ code' });
    }

    let openid;
    let sessionKey;

    if (process.env.NODE_ENV === 'development' && code === 'dev_test') {
      openid = 'dev_openid_' + (userInfo?.nickName || 'test');
      sessionKey = 'dev_session';
    } else {
      const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: process.env.WX_APPID,
          secret: process.env.WX_SECRET,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });
      openid = wxRes.data.openid;
      sessionKey = wxRes.data.session_key;
      if (!openid) {
        return res.status(400).json({
          success: false,
          message: wxRes.data.errmsg || 'ล็อกอิน WeChat ไม่สำเร็จ',
        });
      }
    }

    const [users] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
    let user;

    if (users.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
        [openid, userInfo?.nickName || 'ผู้ใช้ WeChat', userInfo?.avatarUrl || '']
      );
      user = {
        id: result.insertId,
        openid,
        nickname: userInfo?.nickName || 'ผู้ใช้ WeChat',
        avatar_url: userInfo?.avatarUrl || '',
      };
    } else {
      user = users[0];
      if (userInfo?.nickName || userInfo?.avatarUrl) {
        await pool.query(
          'UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?',
          [userInfo?.nickName || user.nickname, userInfo?.avatarUrl || user.avatar_url, user.id]
        );
        user.nickname = userInfo?.nickName || user.nickname;
        user.avatar_url = userInfo?.avatarUrl || user.avatar_url;
      }
    }

    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'ข้อผิดพลาดของเซิร์ฟเวอร์' });
  }
});

module.exports = router;
