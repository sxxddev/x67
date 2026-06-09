const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    cart: [],
    total: 0,
    remark: '',
    addressText: 'กรุณาเลือกที่อยู่จัดส่ง',
  },

  onShow() {
    this.refreshCart();
    const address = wx.getStorageSync('selectedAddress');
    if (address) {
      this.setData({
        addressText: `${address.name} ${address.phone} ${address.detail}`,
      });
    }
  },

  refreshCart() {
    const app = getApp();
    this.setData({
      cart: app.globalData.cart,
      total: app.cartTotal(),
    });
  },

  changeQty(e) {
    const { index, type } = e.currentTarget.dataset;
    const cart = getApp().globalData.cart;
    if (type === 'minus') {
      cart[index].quantity -= 1;
      if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else {
      cart[index].quantity += 1;
    }
    getApp().saveCart();
    this.refreshCart();
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address?select=1' });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async submitOrder() {
    if (!auth.isLoggedIn()) {
      try {
        await auth.devLogin();
      } catch (e) {
        wx.showToast({ title: 'กรุณาเข้าสู่ระบบ', icon: 'none' });
        return;
      }
    }

    const cart = getApp().globalData.cart;
    if (!cart.length) {
      wx.showToast({ title: 'ตะกร้าว่าง', icon: 'none' });
      return;
    }

    const address = wx.getStorageSync('selectedAddress');
    if (!address) {
      wx.showToast({ title: 'กรุณาเลือกที่อยู่', icon: 'none' });
      return;
    }

    wx.showLoading({ title: 'กำลังส่ง' });
    try {
      const storeId = getApp().globalData.storeId || cart[0].store_id;
      const orderRes = await api.post('/orders', {
        store_id: storeId,
        address_id: address.id,
        remark: this.data.remark,
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });

      const orderId = orderRes.data.order_id;
      const payRes = await api.post('/payment/create', { order_id: orderId });

      if (payRes.data.mock) {
        await api.post('/payment/mock-pay', { order_id: orderId });
        getApp().clearCart();
        wx.hideLoading();
        wx.showToast({ title: 'ชำระเงินสำเร็จ', icon: 'success' });
        wx.switchTab({ url: '/pages/order/order' });
        return;
      }

      const p = payRes.data;
      wx.requestPayment({
        ...p,
        success: async () => {
          getApp().clearCart();
          wx.showToast({ title: 'ชำระเงินสำเร็จ', icon: 'success' });
          wx.switchTab({ url: '/pages/order/order' });
        },
        fail: () => wx.showToast({ title: 'ยกเลิกชำระเงิน', icon: 'none' }),
        complete: () => wx.hideLoading(),
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || 'สั่งซื้อไม่สำเร็จ', icon: 'none' });
    }
  },
});
