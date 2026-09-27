process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../backend/app');
const userRepository = app.locals.userRepository;

describe('API de pedidos e produtos', () => {
  let ownerToken;
  let employeeToken;

  beforeAll(async () => {
    await userRepository.create({ nome: 'Dono de teste', email: 'dono@test.local', senha: 'dono123', papel: 'DONO' });
    await userRepository.create({ nome: 'Funcionario de teste', email: 'funcionario@test.local', senha: 'func123', papel: 'FUNCIONARIO' });
    ownerToken = (await request(app).post('/api/auth/login').send({ email: 'dono@test.local', senha: 'dono123' })).body.token;
    employeeToken = (await request(app).post('/api/auth/login').send({ email: 'funcionario@test.local', senha: 'func123' })).body.token;
  });

  test('permite cadastrar usuario e impede email duplicado', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      nome: 'Nova pessoa',
      email: 'nova@test.local',
      senha: 'senha123'
    });
    expect(registration.status).toBe(201);
    expect(registration.body.user).not.toHaveProperty('senha_hash');

    const duplicate = await request(app).post('/api/auth/register').send({
      nome: 'Outra pessoa',
      email: 'nova@test.local',
      senha: 'senha123'
    });
    expect(duplicate.status).toBe(409);
  });

  test('respeita papeis no cadastro', async () => {
    const owner = await request(app).post('/api/auth/register').send({ nome: 'Nova dona', email: 'dona-nova@test.local', senha: 'senha123', papel: 'DONO' });
    expect(owner.status).toBe(201);
    expect(owner.body.user.papel).toBe('DONO');

    const invalid = await request(app).post('/api/auth/register').send({ nome: 'Invalido', email: 'invalido@test.local', senha: 'senha123', papel: 'ADMIN' });
    expect(invalid.status).toBe(400);
  });

  test('funcionario nao pode excluir produto', async () => {
    const response = await request(app).delete('/api/produtos/1').set('Authorization', `Bearer ${employeeToken}`);
    expect(response.status).toBe(403);
  });

  test('funcionario nao pode cadastrar produto', async () => {
    const response = await request(app).post('/api/produtos').set('Authorization', `Bearer ${employeeToken}`).send({ nome: 'Bloqueado', preco: 1, estoque: 1 });
    expect(response.status).toBe(403);
  });

  test('dono pode criar produto e pedido, e funcionario pode alterar status', async () => {
    const product = await request(app).post('/api/produtos').set('Authorization', `Bearer ${ownerToken}`).send({ nome: 'Caderno', preco: 25, estoque: 10 });
    expect(product.status).toBe(201);
    const order = await request(app).post('/api/pedidos').set('Authorization', `Bearer ${employeeToken}`).send({ produtoId: product.body.id, clienteNome: 'Maria', clienteEmail: 'maria@local' });
    expect(order.status).toBe(201);
    expect(order.body.quantidade).toBe(1);
    const quantityOrder = await request(app).post('/api/pedidos').set('Authorization', `Bearer ${employeeToken}`).send({ produtoId: product.body.id, quantidade: 2, clienteNome: 'Joao', clienteEmail: 'joao@local' });
    expect(quantityOrder.status).toBe(201);
    expect(quantityOrder.body.quantidade).toBe(2);
    const invalidQuantity = await request(app).post('/api/pedidos').set('Authorization', `Bearer ${employeeToken}`).send({ produtoId: product.body.id, quantidade: 0, clienteNome: 'Joao', clienteEmail: 'joao@local' });
    expect(invalidQuantity.status).toBe(400);
    const changed = await request(app).patch(`/api/pedidos/${order.body.id}/status`).set('Authorization', `Bearer ${employeeToken}`).send({ status: 'ENVIADO' });
    expect(changed.status).toBe(200);
    expect(changed.body.status).toBe('ENVIADO');
  });

  test('dono pode editar e excluir produto, funcionario nao', async () => {
    const product = await request(app).post('/api/produtos').set('Authorization', `Bearer ${ownerToken}`).send({ nome: 'Caneta', preco: 3, estoque: 4 });
    const denied = await request(app).put(`/api/produtos/${product.body.id}`).set('Authorization', `Bearer ${employeeToken}`).send({ nome: 'Bloqueado', preco: 4, estoque: 5 });
    expect(denied.status).toBe(403);

    const updated = await request(app).put(`/api/produtos/${product.body.id}`).set('Authorization', `Bearer ${ownerToken}`).send({ nome: 'Caneta azul', preco: 4, estoque: 5 });
    expect(updated.status).toBe(200);
    expect(updated.body.nome).toBe('Caneta azul');
    const deleted = await request(app).delete(`/api/produtos/${product.body.id}`).set('Authorization', `Bearer ${ownerToken}`);
    expect(deleted.status).toBe(204);
  });
});