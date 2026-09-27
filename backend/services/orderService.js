const Pedido = require('../domain/Pedido');
const EmailObserver = require('../observers/EmailObserver');
const SmsObserver = require('../observers/SmsObserver');
const WindowsObserver = require('../observers/WindowsObserver');
const WhatsAppObserver = require('../observers/WhatsAppObserver');

class OrderService {
  constructor(repository, providers) {
    this.repository = repository;
    this.providers = providers;
  }

  listOrders() { return this.repository.listOrders(); }
  createOrder(data) { return this.repository.createOrder(data); }

  async changeStatus(id, status, userId) {
    const order = await this.repository.updateOrderStatus(id, status, userId);
    if (!order) return null;
    const pedido = new Pedido(order);
    pedido.adicionarObserver(new EmailObserver(this.providers.email));
    pedido.adicionarObserver(new SmsObserver(this.providers.sms));
    pedido.adicionarObserver(new WindowsObserver(this.providers.windows));
    pedido.adicionarObserver(new WhatsAppObserver(this.providers.whatsapp));
    const notifications = await pedido.mudarStatus(status);
    notifications
      .filter((notification) => notification.status === 'rejected')
      .forEach((notification) => console.error(`Falha na notificacao ${notification.reason.canal}: ${notification.reason.erro.message}`));
    return order;
  }
}

module.exports = OrderService;