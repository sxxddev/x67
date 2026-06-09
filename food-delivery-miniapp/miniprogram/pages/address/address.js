const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    list: [],
    selectMode: false,
    form: { name: '', phone: '', detail: '', is_default: true },
    showForm: false,
  },

  onLoad(options) {
    this.setData({ selectMode: options.select === '1' });
  },

  onShow() {
    if (auth.isLoggedIn()) this.loadList();
  },

  async loadList() {
    try {
      const res = await api.get('/addresses');
      this.setData({ list: res.data || [] });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  selectAddress(e) {
    if (!this.data.selectMode) return;
    const item = this.data.list[e.currentTarget.dataset.index];
    wx.setStorageSync('selectedAddress', item);
    wx.navigateBack();
  },

  toggleForm() {
    this.setData({ showForm: !this.data.showForm });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  async saveAddress() {
    if (!auth.isLoggedIn()) {
      await auth.devLogin();
    }
    try {
      await api.post('/addresses', this.data.form);
      this.setData({
        showForm: false,
        form: { name: '', phone: '', detail: '', is_default: true },
      });
      this.loadList();
      wx.showToast({ title: 'บันทึกสำเร็จ', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },
});
