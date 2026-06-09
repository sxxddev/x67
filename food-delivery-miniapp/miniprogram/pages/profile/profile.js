const auth = require('../../utils/auth');

Page({
  data: {
    user: null,
    loggedIn: false,
  },

  onShow() {
    const loggedIn = auth.isLoggedIn();
    const user = wx.getStorageSync('user');
    this.setData({ loggedIn, user });
  },

  async onLogin() {
    try {
      wx.showLoading({ title: 'กำลังเข้าสู่ระบบ' });
      const data = await auth.devLogin();
      this.setData({ loggedIn: true, user: data.user });
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      try {
        await auth.login();
        this.setData({ loggedIn: true, user: wx.getStorageSync('user') });
      } catch (err) {
        wx.showToast({ title: err.message || 'เข้าสู่ระบบไม่สำเร็จ', icon: 'none' });
      }
    }
  },

  onLogout() {
    auth.logout();
    this.setData({ loggedIn: false, user: null });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },
});
