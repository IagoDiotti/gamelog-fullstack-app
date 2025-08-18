// authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // 1. Buscar o token do cabeçalho da requisição
  // O formato padrão é "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Pega só a parte do TOKEN

  // 2. Se não houver token, bloquear o acesso
  if (token == null) {
    return res.status(401).json({ error: 'Token não fornecido' }); // 401 Unauthorized
  }

  // 3. Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      // Se o token não for válido (expirado, malformado, etc.)
      return res.status(403).json({ error: 'Token inválido' }); // 403 Forbidden
    }

    // 4. Se o token for válido, adicionamos o payload (os dados do usuário)
    // à requisição para que a rota final possa usá-lo
    req.user = userPayload;

    // 5. Chamar a função next() para passar para a próxima etapa (a rota em si)
    next();
  });
}

module.exports = authenticateToken;