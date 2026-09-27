class MemoryRepository {
  constructor() {
    this.products = [];
    this.orders = [];
    this.nextProductId = 1;
    this.nextOrderId = 1;
  }

  listProducts() { return this.products; }
  createProduct(data) {
    const product = { id: this.nextProductId++, ...data };
    this.products.push(product);
    return product;
  }
  updateProduct(id, data) {
    const product = this.products.find((item) => item.id === Number(id));
    if (!product) return null;
    Object.assign(product, data);
    return product;
  }
  deleteProduct(id) {
    const index = this.products.findIndex((item) => item.id === Number(id));
    if (index < 0) return false;
    this.products.splice(index, 1);
    return true;
  }
  listOrders() { return this.orders; }
  createOrder(data) {
    const order = { id: this.nextOrderId++, status: 'CRIADO', quantidade: 1, ...data };
    this.orders.push(order);
    return order;
  }
  updateOrderStatus(id, status) {
    if (!['CRIADO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'].includes(status)) return null;
    const order = this.orders.find((item) => item.id === Number(id));
    if (!order) return null;
    order.status = status;
    return order;
  }
}

module.exports = MemoryRepository;