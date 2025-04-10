/**
 * Configurações do aplicativo
 * Este arquivo carrega variáveis de ambiente e exporta configurações para o aplicativo
 */

const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Configurações do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1512',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'clint_db'
};

// Configurações do servidor
const serverConfig = {
  port: parseInt(process.env.PORT || '3000'),
  env: process.env.NODE_ENV || 'development',
  apiUrl: process.env.BACKEND_URL || 'http://localhost:3000'
};

// Exportar configurações
module.exports = {
  db: dbConfig,
  server: serverConfig
}; 