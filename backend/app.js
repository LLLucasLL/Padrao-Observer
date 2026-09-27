require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const MemoryRepository = require('./repositories/memoryRepository');
const MysqlRepository = require('./repositories/mysqlRepository');
const OrderService = require('./services/orderService');
const EmailGoogleProvider = require('./providers/EmailGoogleProvider');
const InfobipSmsProvider = require('./providers/InfobipSmsProvider');
const WindowsNotificationProvider = require('./providers/WindowsNotificationProvider');
const BaileysWhatsAppProvider = require('./providers/BaileysWhatsAppProvider');
const UserRepository = require('./repositories/userRepository');
const database = require('./config/database');
const { ensureQuantityColumn } = require('./config/migrations');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const repository = process.env.NODE_ENV === 'test' ? new MemoryRepository() : new MysqlRepository(database);
const userRepository = new UserRepository(database);
const orderService = new OrderService(repository, {
  email: new EmailGoogleProvider(),
  sms: new InfobipSmsProvider(),
  windows: new WindowsNotificationProvider(),
  whatsapp: new BaileysWhatsAppProvider()
});

app.use(cors());
app.use(express.json());
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

app.post('/api/auth/register', async (request, response) => {
  const { nome, email, senha, papel = 'FUNCIONARIO' } = request.body;
  if (!nome || !email || !senha || senha.length < 6) {
    return response.status(400).json({ erro: 'Nome, e-mail e senha com pelo menos 6 caracteres sao obrigatorios' });
  }
  if (!['DONO', 'FUNCIONARIO'].includes(papel)) {
    return response.status(400).json({ erro: 'Papel invalido' });
  }
  try {
    if (await userRepository.findByEmail(email)) return response.status(409).json({ erro: 'E-mail ja cadastrado' });
    const user = await userRepository.create({ nome, email, senha, papel });
    return response.status(201).json({ user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ erro: 'E-mail ja cadastrado' });
    return response.status(500).json({ erro: 'Nao foi possivel cadastrar o usuario' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  const user = await userRepository.findByEmail(request.body.email);
  if (!user || !await bcrypt.compare(request.body.senha || '', user.senha_hash)) {
    return response.status(401).json({ erro: 'Credenciais invalidas' });
  }
  const token = jwt.sign({ id: user.id, nome: user.nome, papel: user.papel }, process.env.JWT_SECRET || 'development-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  return response.json({ token, user: { nome: user.nome, papel: user.papel } });
});

app.get('/api/produtos', authenticate, async (request, response) => response.json(await repository.listProducts()));
app.post('/api/produtos', authenticate, authorize('produto:create'), async (request, response) => {
  const { nome, descricao = '', preco, estoque = 0, ativo = true } = request.body;
  if (!nome || Number(preco) < 0 || Number(estoque) < 0 || !Number.isFinite(Number(preco)) || !Number.isInteger(Number(estoque))) {
    return response.status(400).json({ erro: 'Nome, preco valido e estoque inteiro sao obrigatorios' });
  }
  return response.status(201).json(await repository.createProduct({ nome, descricao, preco: Number(preco), estoque: Number(estoque), ativo: Boolean(ativo) }));
});
app.put('/api/produtos/:id', authenticate, authorize('produto:update'), async (request, response) => {
  const { nome, descricao = '', preco, estoque, ativo = true } = request.body;
  if (!nome || Number(preco) < 0 || Number(estoque) < 0 || !Number.isFinite(Number(preco)) || !Number.isInteger(Number(estoque))) {
    return response.status(400).json({ erro: 'Nome, preco valido e estoque inteiro sao obrigatorios' });
  }
  const product = await repository.updateProduct(request.params.id, { nome, descricao, preco: Number(preco), estoque: Number(estoque), ativo: Boolean(ativo) });
  return product ? response.json(product) : response.status(404).json({ erro: 'Produto nao encontrado' });
});
app.delete('/api/produtos/:id', authenticate, authorize('produto:delete'), async (request, response) => {
  const deleted = await repository.deleteProduct(request.params.id);
  return deleted ? response.status(204).send() : response.status(404).json({ erro: 'Produto nao encontrado' });
});

app.get('/api/pedidos', authenticate, authorize('pedido:read'), async (request, response) => response.json(await orderService.listOrders()));
app.post('/api/pedidos', authenticate, authorize('pedido:create'), async (request, response) => {
  const quantidade = Number(request.body.quantidade ?? 1);
  if (!Number.isInteger(quantidade) || quantidade < 1) return response.status(400).json({ erro: 'Quantidade deve ser um inteiro maior que zero' });
  try {
    const order = await orderService.createOrder({ ...request.body, quantidade, criadoPor: request.user.id });
    return response.status(201).json(order);
  } catch (error) {
    return response.status(error.statusCode || 500).json({ erro: error.message || 'Nao foi possivel criar o pedido' });
  }
});
app.patch('/api/pedidos/:id/status', authenticate, authorize('pedido:status'), async (request, response) => {
  const order = await orderService.changeStatus(request.params.id, request.body.status, request.user.id);
  return order ? response.json(order) : response.status(404).json({ erro: 'Pedido nao encontrado' });
});

app.get('*', (request, response) => response.sendFile(path.join(frontendPath, 'index.html')));

if (require.main === module) {
  ensureQuantityColumn(database)
    .then(() => orderService.providers.whatsapp.initialize())
    .then(() => app.listen(process.env.PORT || 3000, () => console.log('Laboratory Observer em http://localhost:3000')))
    .catch((error) => {
      console.error('Nao foi possivel preparar o banco de dados:', error.message);
      process.exitCode = 1;
    });
}
module.exports = app;
app.locals.userRepository = userRepository;