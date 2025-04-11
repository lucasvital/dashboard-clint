/**
 * Servidor Express para o Sistema Clint
 * Este servidor combina uma API REST com o serviço do aplicativo Vue
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const dotenv = require('dotenv');
const fs = require('fs');

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviços
const userService = require('./src/services/userService');

// Inicializar o aplicativo Express
const app = express();
const PORT = config.server.port;

// Middlewares - Usar configurações CORS do arquivo config
app.use(cors(config.cors));
app.use(bodyParser.json());

// Log para monitorar requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Middleware para servir arquivos CSV com o Content-Type correto
app.use((req, res, next) => {
  if (req.path.endsWith('.csv')) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(req.path)}"`);
  }
  next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Servir arquivos da pasta resultados_api
app.use('/resultados_api', express.static(path.join(__dirname, 'resultados_api')));

// Middleware de verificação de credenciais
const verificarCredenciais = async (req, res, next) => {
  const { email, senha } = req.body;
  
  // Verificar se as credenciais foram fornecidas
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Buscar usuário no banco de dados
  try {
    const usuario = await userService.verificarCredenciais(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// API endpoint para login
app.post('/api/auth/login', verificarCredenciais, async (req, res) => {
  try {
    const usuario = req.usuario;
    
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

// API endpoint para download de arquivos CSV
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Verificar se o arquivo solicitado é um CSV
  if (!filename.endsWith('.csv')) {
    return res.status(400).json({ error: 'Apenas arquivos CSV são permitidos' });
  }
  
  // Caminho do arquivo
  const filePath = path.join(__dirname, 'resultados_api', 'csvs', filename);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }
  
  // Configurar cabeçalhos para download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Enviar o arquivo
  res.sendFile(filePath);
});

// Servir o aplicativo Vue para todas as outras rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.server.env}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:' + PORT}`);
  console.log(`CORS permitido para: ${config.cors.origin}`);
}); 