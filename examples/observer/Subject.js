class Subject {
  adicionarObserver() {
    throw new Error('Subject.adicionarObserver(observer) deve ser implementado');
  }

  removerObserver() {
    throw new Error('Subject.removerObserver(observer) deve ser implementado');
  }

  notificarObservers() {
    throw new Error('Subject.notificarObservers() deve ser implementado');
  }
}

module.exports = Subject;
