class EmailObserver {
  constructor(provider) { this.provider = provider; }
  atualizar(status, pedido) {
    return this.provider.enviar({
      to: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
      subject: `Pedido #${pedido.id}: ${status}`,
      text: `O pedido de ${pedido.clienteNome} mudou para ${status}.`
    });
  }
}

module.exports = EmailObserver;