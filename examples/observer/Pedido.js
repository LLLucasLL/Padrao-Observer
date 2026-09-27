const Subject = require('./Subject');

class Pedido extends Subject {
  constructor() {
    super();
    this.status = null;
    this.observers = [];
  }

  adicionarObserver(observer) {
    if (!this.observers.includes(observer)) this.observers.push(observer);
  }

  removerObserver(observer) {
    this.observers = this.observers.filter((item) => item !== observer);
  }

  notificarObservers() {
    this.observers.forEach((observer) => observer.atualizar(this.status));
  }

  mudarStatus(novoStatus) {
    this.status = novoStatus;
    this.notificarObservers();
  }
}

module.exports = Pedido;
