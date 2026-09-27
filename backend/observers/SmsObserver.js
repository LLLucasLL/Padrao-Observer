class SmsObserver {
  constructor(provider) { this.provider = provider; }
  atualizar(status, pedido) {
    return this.provider.enviar({
      to: process.env.INFOBIP_SMS_TO || process.env.OWNER_PHONE || process.env.WHATSAPP_NUMBER,
      text: `Pedido #${pedido.id} (${pedido.clienteNome}) mudou para ${status}.`
    });
  }
}

module.exports = SmsObserver;