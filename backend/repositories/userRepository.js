const bcrypt = require('bcryptjs');

class UserRepository {
  constructor(pool, useMemory = process.env.NODE_ENV === 'test') {
    this.pool = pool;
    this.useMemory = useMemory;
    this.users = [];
    this.nextId = 1;
  }

  async findByEmail(email) {
    if (this.useMemory) return this.users.find((user) => user.email === email) || null;
    const [rows] = await this.pool.query('SELECT id, nome, email, senha_hash, papel FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async count() {
    if (this.useMemory) return this.users.length;
    const [rows] = await this.pool.query('SELECT COUNT(*) AS total FROM usuarios');
    return Number(rows[0].total);
  }

  async create({ nome, email, senha, papel = 'FUNCIONARIO' }) {
    const senhaHash = await bcrypt.hash(senha, 12);
    if (this.useMemory) {
      const user = { id: this.nextId++, nome, email, senha_hash: senhaHash, papel };
      this.users.push(user);
      return user;
    }
    const [result] = await this.pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, papel]
    );
    return { id: result.insertId, nome, email, papel };
  }
}

module.exports = UserRepository;