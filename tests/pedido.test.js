const Pedido = require('../backend/domain/Pedido');
const { can } = require('../backend/domain/permissions');

describe('Pedido como Subject do Observer', () => {
  test('notifica todos os observadores com o novo status', () => {
    const pedido = new Pedido({ id: 1, produtoId: 2, clienteNome: 'Ana' });
    const email = { atualizar: jest.fn() };
    const sms = { atualizar: jest.fn() };

    pedido.adicionarObserver(email);
    pedido.adicionarObserver(sms);
    pedido.mudarStatus('ENVIADO');

    expect(email.atualizar).toHaveBeenCalledWith('ENVIADO', pedido);
    expect(sms.atualizar).toHaveBeenCalledWith('ENVIADO', pedido);
  });

  test('permite remover um observador sem alterar o Subject', () => {
    const pedido = new Pedido({ id: 1, produtoId: 2, clienteNome: 'Ana' });
    const sms = { atualizar: jest.fn() };

    pedido.adicionarObserver(sms);
    pedido.removerObserver(sms);
    pedido.mudarStatus('ENTREGUE');

    expect(sms.atualizar).not.toHaveBeenCalled();
  });

  test('evita registrar o mesmo observador duas vezes', () => {
    const pedido = new Pedido({ id: 1, produtoId: 2, clienteNome: 'Ana' });
    const observer = { atualizar: jest.fn() };

    pedido.adicionarObserver(observer);
    pedido.adicionarObserver(observer);
    pedido.mudarStatus('ENVIADO');

    expect(observer.atualizar).toHaveBeenCalledTimes(1);
  });
});

describe('Permissoes por papel', () => {
  test('funcionario pode criar, consultar e mudar status, mas nao gerencia cadastro', () => {
    expect(can('FUNCIONARIO', 'pedido:create')).toBe(true);
    expect(can('FUNCIONARIO', 'pedido:read')).toBe(true);
    expect(can('FUNCIONARIO', 'pedido:status')).toBe(true);
    expect(can('FUNCIONARIO', 'pedido:update')).toBe(false);
    expect(can('FUNCIONARIO', 'pedido:delete')).toBe(false);
  });

  test('dono pode executar todas as operacoes do pedido', () => {
    expect(can('DONO', 'pedido:create')).toBe(true);
    expect(can('DONO', 'pedido:update')).toBe(true);
    expect(can('DONO', 'pedido:delete')).toBe(true);
    expect(can('DONO', 'pedido:status')).toBe(true);
  });
});