const config = require('./config');

function request(options) {
  const token = wx.getStorageSync('token') || '';
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.apiBaseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header,
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.success === false) {
            reject(new Error(res.data.message || 'คำขอล้มเหลว'));
          } else {
            resolve(res.data);
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          reject(new Error('กรุณาเข้าสู่ระบบ'));
        } else {
          reject(new Error(res.data?.message || 'เครือข่ายผิดพลาด'));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = {
  get: (url, data) => request({ url, data, method: 'GET' }),
  post: (url, data) => request({ url, data, method: 'POST' }),
  put: (url, data) => request({ url, data, method: 'PUT' }),
  del: (url, data) => request({ url, data, method: 'DELETE' }),
};
