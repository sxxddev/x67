App({
  globalData: {
    cart: [],
    storeId: null,
  },

  onLaunch() {
    const cart = wx.getStorageSync('cart');
    if (cart) this.globalData.cart = cart;
  },

  saveCart() {
    wx.setStorageSync('cart', this.globalData.cart);
  },

  addToCart(product, quantity = 1) {
    const cart = this.globalData.cart;
    const idx = cart.findIndex((i) => i.product_id === product.id);
    if (idx >= 0) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        store_id: product.store_id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity,
      });
    }
    this.globalData.storeId = product.store_id;
    this.saveCart();
  },

  cartCount() {
    return this.globalData.cart.reduce((s, i) => s + i.quantity, 0);
  },

  cartTotal() {
    return this.globalData.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  },

  clearCart() {
    this.globalData.cart = [];
    this.saveCart();
  },
});
