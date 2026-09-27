const permissions = {
  FUNCIONARIO: new Set(['pedido:create', 'pedido:read', 'pedido:status']),
  DONO: new Set(['pedido:create', 'pedido:read', 'pedido:update', 'pedido:delete', 'pedido:status', 'produto:create', 'produto:update', 'produto:delete'])
};

function can(role, permission) {
  return Boolean(permissions[role] && permissions[role].has(permission));
}

module.exports = { can, permissions };