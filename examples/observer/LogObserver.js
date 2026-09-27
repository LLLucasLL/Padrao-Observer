const Observer = require('./Observer');

class LogObserver extends Observer {
  atualizar(status) {
    console.log(`LOG: status alterado para ${status}`);
  }
}

module.exports = LogObserver;
