const Observer = require('./Observer');

class SMSObserver extends Observer {
  atualizar(status) {
    console.log(`Enviando SMS: status alterado para ${status}`);
  }
}

module.exports = SMSObserver;
