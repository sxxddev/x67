const api = require('../../utils/api');
const auth = require('../../utils/auth');

const statusMap = {
  pending: 'รอชำระ',
  paid: 'ชำระแล้ว',
  preparing: 'กำลังเตรียม',
  delivering: 'กำลังจัดส่ง',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

Page({
  data: { orders: [], loading: false },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    if (!auth.isLoggedIn()) {
      this.setData({ orders: [] });
      return;
    }
    this.setData({ loading: true });
    try {
      const res = await api.get('/orders');
      const orders = (res.data || []).map((o) => ({
        ...o,
        statusText: statusMap[o.status] || o.status,
      }));
      this.setData({ orders, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}` });
  },
});
