/**
 * Servidor Express para o Sistema Clint
 * Este servidor combina uma API REST com o serviço do aplicativo Vue
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importar serviços
const userService = require('./src/services/userService');

// Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint para login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const usuario = await userService.verificarCredenciais(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Registrar o login
    await userService.registrarLogin(usuario.id, req.ip);
    
    // Gerar um token simples (em produção, usar JWT)
    const token = `token_${usuario.id}_${Date.now()}`;
    
    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      },
      token
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API endpoint para registro (signup)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se o email já existe
    const usuarioExistente = await userService.buscarPorEmail(email);
    
    if (usuarioExistente) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Criar o usuário
    const novoUsuario = await userService.criarUsuario({
      nome,
      email,
      senha,
      cargo
    });
    
    // Gerar um token simples
    const token = `token_${novoUsuario.id}_${Date.now()}`;
    
    res.status(201).json({
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo
      },
      token
    });
    
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API endpoint para verificar se o usuário está autenticado
app.get('/api/auth/me', async (req, res) => {
  try {
    // Obter o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Em uma implementação real, verificaria o token JWT
    // Por enquanto, vamos extrair o ID do usuário do token simulado
    const userId = token.split('_')[1];
    
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Buscar o usuário pelo ID
    const usuario = await userService.buscarPorId(userId);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar os dados do usuário
    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      },
      autenticado: true
    });
    
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Servir o aplicativo Vue para todas as outras rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
}); 