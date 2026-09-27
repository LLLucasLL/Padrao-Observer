const Observer = require('./Observer');

class EmailObserver extends Observer {
  atualizar(status) {
    console.log(`Enviando e-mail: status alterado para ${status}`);
  }
}

module.exports = EmailObserver;
