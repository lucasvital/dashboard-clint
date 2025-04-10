/**
 * Script para configuração inicial do banco de dados PostgreSQL
 * Este script cria o banco de dados, tabelas e insere dados iniciais
 * 
 * Como usar:
 * 1. Ajuste os dados de conexão conforme seu ambiente
 * 2. Execute: node setup.js
 */

const { Pool } = require('pg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const util = require('util');
const execPromise = util.promisify(exec);

// Configurações de conexão com o PostgreSQL
const dbConfig = {
  host: 'localhost',      // Host do banco de dados (altere conforme necessário)
  user: 'postgres',       // Usuário do PostgreSQL (altere conforme necessário)
  password: '1512',       // Senha do PostgreSQL (altere conforme necessário)
  port: 5433              // Porta do PostgreSQL configurada pelo usuário
};

// Nome do banco de dados
const dbName = 'clint_db';

// Caminho para os executáveis do PostgreSQL (ajuste conforme necessário)
const pgBinPath = ''; // Deixe vazio para usar as variáveis de ambiente

/**
 * Cria o banco de dados usando o comando psql do PostgreSQL
 */
async function createDatabase() {
  try {
    console.log(`Criando banco de dados ${dbName}...`);
    // Usar psql para criar o banco de dados
    const createDbCmd = `${pgBinPath}psql -h ${dbConfig.host} -U ${dbConfig.user} -p ${dbConfig.port} -c "CREATE DATABASE ${dbName};"`;
    
    console.log(`Executando: ${createDbCmd}`);
    await execPromise(createDbCmd, {
      env: { ...process.env, PGPASSWORD: dbConfig.password }
    });
    
    console.log(`Banco de dados ${dbName} criado com sucesso!`);
    return true;
  } catch (error) {
    if (error.stderr && error.stderr.includes('already exists')) {
      console.log(`Banco de dados ${dbName} já existe, continuando...`);
      return true;
    }
    console.error('Erro ao criar banco de dados:', error.message);
    return false;
  }
}

/**
 * Executa o script SQL no banco de dados
 */
async function executeSqlScript() {
  try {
    console.log('Aplicando script SQL...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    // Usando psql para executar o script SQL
    const psqlCmd = `${pgBinPath}psql -h ${dbConfig.host} -U ${dbConfig.user} -p ${dbConfig.port} -d ${dbName} -f "${schemaPath}"`;
    
    console.log(`Executando: ${psqlCmd}`);
    const { stdout, stderr } = await execPromise(psqlCmd, {
      env: { ...process.env, PGPASSWORD: dbConfig.password }
    });
    
    if (stderr && !stderr.includes('NOTICE')) {
      throw new Error(stderr);
    }
    
    console.log('Script SQL executado com sucesso!');
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('Erro ao executar script SQL:', error.message);
    return false;
  }
}

/**
 * Verifica a configuração do banco de dados usando psql
 */
async function verifySetup() {
  try {
    console.log('Verificando configuração do banco de dados...');
    
    // Usando psql para verificar a tabela de usuários
    const checkUsersCmd = `${pgBinPath}psql -h ${dbConfig.host} -U ${dbConfig.user} -p ${dbConfig.port} -d ${dbName} -c "SELECT COUNT(*) FROM usuarios;"`;
    
    console.log(`Executando: ${checkUsersCmd}`);
    const { stdout } = await execPromise(checkUsersCmd, {
      env: { ...process.env, PGPASSWORD: dbConfig.password }
    });
    
    // Extrair o número de usuários do resultado
    const userCount = parseInt(stdout.trim().split('\n')[2].trim());
    console.log(`Encontrados ${userCount} usuários no banco de dados.`);
    
    if (userCount > 0) {
      // Listar usuários cadastrados
      const listUsersCmd = `${pgBinPath}psql -h ${dbConfig.host} -U ${dbConfig.user} -p ${dbConfig.port} -d ${dbName} -c "SELECT id, nome, email, cargo, admin FROM usuarios;"`;
      const { stdout: usersOutput } = await execPromise(listUsersCmd, {
        env: { ...process.env, PGPASSWORD: dbConfig.password }
      });
      
      console.log('Usuários cadastrados:');
      console.log(usersOutput);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar configuração:', error.message);
    return false;
  }
}

/**
 * Função principal que executa todo o processo de setup
 */
async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados PostgreSQL...');
  
  // Criar banco de dados
  const dbCreated = await createDatabase();
  if (!dbCreated) return;
  
  // Executar script SQL
  const scriptExecuted = await executeSqlScript();
  if (!scriptExecuted) return;
  
  // Verificar configuração
  await verifySetup();
  
  console.log('Processo de configuração finalizado!');
}

// Função auxiliar para gerar hash de senha
function hashSenha(senha) {
  return bcrypt.hashSync(senha, 10);
}

// Executar a configuração
setupDatabase().catch(console.error);

// Exemplo de como usar a função hashSenha para gerar novos hashes:
// console.log('Hash para nova senha:', hashSenha('minhasenha123')); 