const statuses = ['CRIADO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

const productFields = 'id, nome, descricao, preco, estoque, ativo, criado_em AS criadoEm, atualizado_em AS atualizadoEm';
const orderFields = 'id, produto_id AS produtoId, quantidade, cliente_nome AS clienteNome, cliente_email AS clienteEmail, cliente_telefone AS clienteTelefone, status, criado_por AS criadoPor, criado_em AS criadoEm, atualizado_em AS atualizadoEm';

class MysqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listProducts() {
    const [rows] = await this.pool.query(`SELECT ${productFields} FROM produtos WHERE ativo = TRUE ORDER BY id DESC`);
    return rows;
  }

  async createProduct(data) {
    const [result] = await this.pool.query(
      'INSERT INTO produtos (nome, descricao, preco, estoque, ativo) VALUES (?, ?, ?, ?, ?)',
      [data.nome, data.descricao || null, data.preco, data.estoque, data.ativo]
    );
    const [rows] = await this.pool.query(`SELECT ${productFields} FROM produtos WHERE id = ?`, [result.insertId]);
    return rows[0];
  }

  async updateProduct(id, data) {
    const [result] = await this.pool.query(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, estoque = ?, ativo = ? WHERE id = ?',
      [data.nome, data.descricao || null, data.preco, data.estoque, data.ativo, id]
    );
    if (!result.affectedRows) return null;
    const [rows] = await this.pool.query(`SELECT ${productFields} FROM produtos WHERE id = ?`, [id]);
    return rows[0];
  }

  async deleteProduct(id) {
    const [result] = await this.pool.query('UPDATE produtos SET ativo = FALSE WHERE id = ?', [id]);
    return Boolean(result.affectedRows);
  }

  async listOrders() {
    const [rows] = await this.pool.query(`SELECT ${orderFields} FROM pedidos ORDER BY id DESC`);
    return rows;
  }

  async createOrder(data) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [products] = await connection.query('SELECT id, estoque, ativo FROM produtos WHERE id = ? FOR UPDATE', [data.produtoId]);
      const product = products[0];
      if (!product || !product.ativo) {
        const error = new Error('Produto nao encontrado');
        error.statusCode = 404;
        throw error;
      }
      if (product.estoque < data.quantidade) {
        const error = new Error('Estoque insuficiente');
        error.statusCode = 409;
        throw error;
      }
      await connection.query('UPDATE produtos SET estoque = estoque - ? WHERE id = ?', [data.quantidade, data.produtoId]);
      const [result] = await connection.query(
        'INSERT INTO pedidos (produto_id, quantidade, cliente_nome, cliente_email, cliente_telefone, criado_por) VALUES (?, ?, ?, ?, ?, ?)',
        [data.produtoId, data.quantidade, data.clienteNome, data.clienteEmail, data.clienteTelefone || null, data.criadoPor]
      );
      await connection.commit();
      const [rows] = await this.pool.query(`SELECT ${orderFields} FROM pedidos WHERE id = ?`, [result.insertId]);
      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateOrderStatus(id, status, userId) {
    if (!statuses.includes(status)) return null;
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [currentRows] = await connection.query('SELECT status FROM pedidos WHERE id = ? FOR UPDATE', [id]);
      if (!currentRows[0]) {
        await connection.rollback();
        return null;
      }
      await connection.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, id]);
      await connection.query(
        'INSERT INTO pedido_status_historico (pedido_id, status_anterior, status_novo, alterado_por) VALUES (?, ?, ?, ?)',
        [id, currentRows[0].status, status, userId]
      );
      await connection.commit();
      const [rows] = await this.pool.query(`SELECT ${orderFields} FROM pedidos WHERE id = ?`, [id]);
      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = MysqlRepository;