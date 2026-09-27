async function ensureQuantityColumn(pool) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'pedidos'
        AND COLUMN_NAME = 'quantidade'`
  );

  if (Number(rows[0].total) === 0) {
    await pool.query('ALTER TABLE pedidos ADD COLUMN quantidade INT UNSIGNED NOT NULL DEFAULT 1 AFTER produto_id');
  }
}

module.exports = { ensureQuantityColumn };