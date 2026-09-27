const Observer = require('./Observer');

class WhatsAppObserver extends Observer {
  atualizar(status) {
    console.log(`Enviando WhatsApp: status alterado para ${status}`);
  }
}

module.exports = WhatsAppObserver;
