const Subject = require('./Subject');

class Pedido extends Subject {
  constructor({ id, produtoId, clienteNome, status = 'CRIADO' }) {
    super();
    this.id = id;
    this.produtoId = produtoId;
    this.clienteNome = clienteNome;
    this.status = status;
    this.observers = [];
  }

  adicionarObserver(observer) {
    if (!observer || typeof observer.atualizar !== 'function') {
      throw new TypeError('Observer invalido');
    }
    if (!this.observers.includes(observer)) this.observers.push(observer);
  }

  removerObserver(observer) {
    this.observers = this.observers.filter((item) => item !== observer);
  }

  notificarObservers() {
    return Promise.allSettled([...this.observers].map(async (observer) => {
      try {
        return await observer.atualizar(this.status, this);
      } catch (error) {
        return Promise.reject({ canal: observer.constructor.name, erro: error });
      }
    }));
  }

  mudarStatus(novoStatus) {
    if (!novoStatus || typeof novoStatus !== 'string') {
      throw new TypeError('O status deve ser informado');
    }
    this.status = novoStatus;
    return this.notificarObservers();
  }
}

module.exports = Pedido;