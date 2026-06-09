const api = require('../../utils/api');

const statusMap = {
  pending: 'รอชำระ',
  paid: 'ชำระแล้ว',
  preparing: 'กำลังเตรียม',
  delivering: 'กำลังจัดส่ง',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

Page({
  data: { order: null },

  onLoad(options) {
    this.loadOrder(options.id);
  },

  async loadOrder(id) {
    try {
      const res = await api.get(`/orders/${id}`);
      const order = {
        ...res.data,
        statusText: statusMap[res.data.status] || res.data.status,
      };
      this.setData({ order });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },
});
