class Observer {
  atualizar() {
    throw new Error('Observer.atualizar(status, pedido) deve ser implementado');
  }
}

module.exports = Observer;