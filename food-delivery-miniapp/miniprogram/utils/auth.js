const api = require('./api');

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error('ไม่ได้รับ code'));
          return;
        }
        wx.getUserProfile({
          desc: 'ใช้สำหรับข้อมูลสมาชิก',
          success(profile) {
            api
              .post('/auth/login', {
                code: loginRes.code,
                userInfo: profile.userInfo,
              })
              .then((res) => {
                wx.setStorageSync('token', res.data.token);
                wx.setStorageSync('user', res.data.user);
                resolve(res.data);
              })
              .catch(reject);
          },
          fail() {
            api
              .post('/auth/login', { code: loginRes.code })
              .then((res) => {
                wx.setStorageSync('token', res.data.token);
                wx.setStorageSync('user', res.data.user);
                resolve(res.data);
              })
              .catch(reject);
          },
        });
      },
      fail: reject,
    });
  });
}

function devLogin() {
  return api
    .post('/auth/login', {
      code: 'dev_test',
      userInfo: { nickName: 'Dev User', avatarUrl: '' },
    })
    .then((res) => {
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('user', res.data.user);
      return res.data;
    });
}

function isLoggedIn() {
  return !!wx.getStorageSync('token');
}

function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('user');
}

module.exports = { login, devLogin, isLoggedIn, logout };
