const jwt = require('jsonwebtoken');
const { can } = require('../domain/permissions');

function authenticate(request, response, next) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return response.status(401).json({ erro: 'Autenticacao obrigatoria' });
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    return next();
  } catch {
    return response.status(401).json({ erro: 'Token invalido' });
  }
}

function authorize(permission) {
  return (request, response, next) => can(request.user.papel, permission)
    ? next()
    : response.status(403).json({ erro: 'Acesso insuficiente' });
}

module.exports = { authenticate, authorize };