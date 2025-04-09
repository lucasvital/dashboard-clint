/**
 * Módulo para lidar com chamadas de API relacionadas a autenticação
 */

// Importar o serviço de usuários diretamente (em produção seria substituído por chamadas de API REST)
// Esta abordagem permite que você comece com banco de dados local e migre para uma API REST posteriormente
const userService = require('./userService');

/**
 * Realizar login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário e token
 */
async function login(email, senha) {
  try {
    // Verificar credenciais
    const usuario = await userService.verificarCredenciais(email, senha);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }
    
    // Gerar token (em uma implementação real, usaria JWT ou similar)
    const token = generateToken(usuario);
    
    // Retornar dados do usuário e token
    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        admin: usuario.admin
      },
      token
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

/**
 * Registrar novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Usuário criado e token
 */
async function registrar(userData) {
  try {
    // Criar usuário
    const usuario = await userService.criarUsuario(userData);
    
    // Gerar token
    const token = generateToken(usuario);
    
    // Retornar dados do usuário e token
    return {
      usuario,
      token
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
}

/**
 * Verificar se um token é válido
 * @param {string} token - Token do usuário
 * @returns {Promise<boolean>} Se o token é válido
 */
async function verificarToken(token) {
  try {
    // Em uma implementação real, verificaria o token JWT
    // Por enquanto, apenas verifica se há um token
    return !!token;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}

/**
 * Função auxiliar para gerar um token
 * @param {Object} usuario - Dados do usuário
 * @returns {string} Token gerado
 */
function generateToken(usuario) {
  // Em uma implementação real, usaria JWT
  // Por enquanto, apenas retorna um token simulado
  return `token_${usuario.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

module.exports = {
  login,
  registrar,
  verificarToken
}; 