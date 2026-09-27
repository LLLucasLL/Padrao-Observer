class WindowsObserver {
  constructor(provider) { this.provider = provider; }
  atualizar(status, pedido) {
    return this.provider.enviar({
      title: 'Laboratory Observer',
      message: `Pedido #${pedido.id}: ${status}`
    });
  }
}

module.exports = WindowsObserver;