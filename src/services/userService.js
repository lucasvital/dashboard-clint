/**
 * Serviço para gerenciamento de usuários
 * Este módulo lida com operações de banco de dados relacionadas a usuários
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuração do pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clint_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Verificar credenciais de usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null se as credenciais forem inválidas
 */
async function verificarCredenciais(email, senha) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, senha, cargo, admin FROM usuarios WHERE email = ? AND ativo = TRUE',
      [email]
    );

    // Se não encontrou o usuário
    if (rows.length === 0) {
      return null;
    }

    const usuario = rows[0];
    
    // Verificar senha usando bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return null;
    }

    // Remover a senha do objeto retornado
    delete usuario.senha;

    // Registrar o login (opcional)
    await registrarLogin(usuario.id);
    
    return usuario;
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    throw error;
  }
}

/**
 * Registrar login do usuário
 * @param {number} usuarioId - ID do usuário
 * @param {string} ip - Endereço IP do usuário (opcional)
 */
async function registrarLogin(usuarioId, ip = null) {
  try {
    await pool.query(
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
      [usuarioId]
    );

    await pool.query(
      'INSERT INTO log_atividades (usuario_id, acao, descricao, ip) VALUES (?, ?, ?, ?)',
      [usuarioId, 'LOGIN', 'Login realizado', ip]
    );
  } catch (error) {
    console.error('Erro ao registrar login:', error);
    // Não propagar o erro, pois isso é apenas um registro
  }
}

/**
 * Buscar usuário por email
 * @param {string} email - Email do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null se não encontrado
 */
async function buscarPorEmail(email) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, cargo, admin, ultimo_login, data_criacao FROM usuarios WHERE email = ?',
      [email]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
}

/**
 * Buscar usuário por ID
 * @param {number} id - ID do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null se não encontrado
 */
async function buscarPorId(id) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, cargo, admin, ultimo_login, data_criacao FROM usuarios WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
}

/**
 * Criar novo usuário
 * @param {Object} usuario - Dados do usuário
 * @param {string} usuario.nome - Nome do usuário
 * @param {string} usuario.email - Email do usuário
 * @param {string} usuario.senha - Senha do usuário (em texto puro)
 * @param {string} usuario.cargo - Cargo do usuário (opcional)
 * @param {boolean} usuario.admin - Se o usuário é admin (opcional)
 * @returns {Promise<Object>} Usuário criado com ID
 */
async function criarUsuario({ nome, email, senha, cargo = null, admin = false }) {
  try {
    // Verificar se o email já existe
    const usuarioExistente = await buscarPorEmail(email);
    if (usuarioExistente) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir o usuário
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, cargo, admin) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cargo, admin]
    );

    // Retornar o usuário criado (sem a senha)
    return {
      id: result.insertId,
      nome,
      email,
      cargo,
      admin
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

/**
 * Atualizar dados do usuário
 * @param {number} id - ID do usuário
 * @param {Object} dados - Dados a serem atualizados
 * @returns {Promise<boolean>} True se atualizado com sucesso
 */
async function atualizarUsuario(id, dados) {
  try {
    // Verificar quais campos estão sendo atualizados
    const camposPermitidos = ['nome', 'cargo', 'ativo', 'admin'];
    const campos = {};
    
    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos[campo] = dados[campo];
      }
    }
    
    // Se não há campos para atualizar
    if (Object.keys(campos).length === 0) {
      return false;
    }
    
    // Construir query de atualização
    const setClauses = Object.keys(campos).map(campo => `${campo} = ?`).join(', ');
    const valores = [...Object.values(campos), id];
    
    const [result] = await pool.query(
      `UPDATE usuarios SET ${setClauses} WHERE id = ?`,
      valores
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

/**
 * Alterar senha do usuário
 * @param {number} id - ID do usuário
 * @param {string} senhaAtual - Senha atual
 * @param {string} novaSenha - Nova senha
 * @returns {Promise<boolean>} True se a senha foi alterada com sucesso
 */
async function alterarSenha(id, senhaAtual, novaSenha) {
  try {
    // Verificar a senha atual
    const [rows] = await pool.query('SELECT senha FROM usuarios WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const senhaValida = await bcrypt.compare(senhaAtual, rows[0].senha);
    
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar a senha
    const [result] = await pool.query(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [novaSenhaHash, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
}

/**
 * Listar todos os usuários
 * @param {Object} filtros - Filtros opcionais
 * @param {boolean} filtros.apenasAtivos - Filtrar apenas usuários ativos
 * @param {number} limite - Limite de resultados
 * @param {number} offset - Offset para paginação
 * @returns {Promise<Array>} Lista de usuários
 */
async function listarUsuarios(filtros = {}, limite = 100, offset = 0) {
  try {
    let query = `
      SELECT id, nome, email, cargo, admin, ativo, data_criacao, ultimo_login
      FROM usuarios
      WHERE 1=1
    `;
    
    const parametros = [];
    
    // Aplicar filtros
    if (filtros.apenasAtivos) {
      query += ' AND ativo = TRUE';
    }
    
    // Adicionar ordenação e limites
    query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
    parametros.push(limite, offset);
    
    const [rows] = await pool.query(query, parametros);
    
    return rows;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

module.exports = {
  verificarCredenciais,
  buscarPorEmail,
  buscarPorId,
  criarUsuario,
  atualizarUsuario,
  alterarSenha,
  listarUsuarios,
  registrarLogin
}; 