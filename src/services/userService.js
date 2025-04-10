/**
 * Serviço para gerenciamento de usuários
 * Este módulo lida com operações de banco de dados relacionadas a usuários
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('../../config');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool(config.db);

/**
 * Verificar credenciais de usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object|null>} Dados do usuário ou null se as credenciais forem inválidas
 */
async function verificarCredenciais(email, senha) {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, senha, cargo, admin FROM usuarios WHERE email = $1 AND ativo = TRUE',
      [email]
    );

    // Se não encontrou o usuário
    if (result.rows.length === 0) {
      return null;
    }

    const usuario = result.rows[0];
    
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
      'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
      [usuarioId]
    );

    await pool.query(
      'INSERT INTO log_atividades (usuario_id, acao, descricao, ip) VALUES ($1, $2, $3, $4)',
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
    const result = await pool.query(
      'SELECT id, nome, email, cargo, admin, ultimo_login, data_criacao FROM usuarios WHERE email = $1',
      [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
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
    const result = await pool.query(
      'SELECT id, nome, email, cargo, admin, ultimo_login, data_criacao FROM usuarios WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
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
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, cargo, admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nome, email, senhaHash, cargo, admin]
    );

    // Retornar o usuário criado (sem a senha)
    return {
      id: result.rows[0].id,
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
    
    // Construir query de atualização para PostgreSQL
    const setClauses = Object.keys(campos).map((campo, index) => `${campo} = $${index + 1}`).join(', ');
    const valores = [...Object.values(campos), id];
    const paramIndex = Object.keys(campos).length + 1;
    
    const result = await pool.query(
      `UPDATE usuarios SET ${setClauses} WHERE id = $${paramIndex}`,
      valores
    );
    
    return result.rowCount > 0;
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
    const result = await pool.query('SELECT senha FROM usuarios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const senhaValida = await bcrypt.compare(senhaAtual, result.rows[0].senha);
    
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar a senha
    const updateResult = await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2',
      [novaSenhaHash, id]
    );
    
    return updateResult.rowCount > 0;
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
    `;
    
    const condicoes = [];
    const parametros = [];
    let paramIndex = 1;
    
    // Aplicar filtros
    if (filtros.apenasAtivos) {
      condicoes.push(`ativo = $${paramIndex++}`);
      parametros.push(true);
    }
    
    if (condicoes.length > 0) {
      query += ' WHERE ' + condicoes.join(' AND ');
    }
    
    // Adicionar ordenação
    query += ' ORDER BY nome ASC';
    
    // Adicionar paginação
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    parametros.push(limite, offset);
    
    const result = await pool.query(query, parametros);
    return result.rows;
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