const api = require('../../utils/api');

Page({
  data: {
    product: null,
    quantity: 1,
  },

  onLoad(options) {
    this.loadProduct(options.id);
  },

  async loadProduct(id) {
    try {
      const res = await api.get(`/products/${id}`);
      this.setData({ product: res.data });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  changeQty(e) {
    const type = e.currentTarget.dataset.type;
    let q = this.data.quantity;
    if (type === 'minus' && q > 1) q--;
    if (type === 'plus') q++;
    this.setData({ quantity: q });
  },

  addCart() {
    const { product, quantity } = this.data;
    if (!product) return;
    getApp().addToCart(product, quantity);
    wx.showToast({ title: 'เพิ่มในตะกร้าแล้ว', icon: 'success' });
  },
});
