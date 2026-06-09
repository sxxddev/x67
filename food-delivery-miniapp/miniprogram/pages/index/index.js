const api = require('../../utils/api');

Page({
  data: {
    products: [],
    loading: true,
  },

  onShow() {
    this.loadProducts();
  },

  async loadProducts() {
    this.setData({ loading: true });
    try {
      const res = await api.get('/products');
      this.setData({ products: res.data || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: e.message || 'โหลดไม่สำเร็จ', icon: 'none' });
    }
  },

  goProduct(e) {
    wx.navigateTo({ url: `/pages/product/product?id=${e.currentTarget.dataset.id}` });
  },

  addCart(e) {
    const item = e.currentTarget.dataset.item;
    getApp().addToCart(item, 1);
    wx.showToast({ title: 'เพิ่มในตะกร้าแล้ว', icon: 'success' });
  },
});
