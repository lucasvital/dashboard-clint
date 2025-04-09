/**
 * Script para configuração inicial do banco de dados
 * Este script pode ser executado para configurar o banco de dados em um novo ambiente
 * 
 * Como usar:
 * 1. Ajuste os dados de conexão conforme seu ambiente
 * 2. Execute: node setup.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configurações de conexão com o banco de dados
const dbConfig = {
  host: 'localhost',      // Host do banco de dados (altere conforme necessário)
  user: 'root',           // Usuário do MySQL (altere conforme necessário)
  password: '',           // Senha do MySQL (altere conforme necessário)
  multipleStatements: true // Permitir múltiplos comandos SQL
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Iniciando configuração do banco de dados...');
    
    // Conectar ao MySQL (sem especificar o banco de dados ainda)
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado ao MySQL');
    
    // Ler o arquivo de esquema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, { encoding: 'utf8' });
    
    // Executar os comandos SQL
    console.log('Executando scripts SQL...');
    await connection.query(schemaSql);
    
    console.log('Banco de dados configurado com sucesso!');
    
    // Verificar se os usuários foram criados
    const [users] = await connection.query('USE clint_db; SELECT * FROM usuarios');
    console.log(`${users.length} usuários encontrados no banco de dados:`);
    users.forEach(user => {
      console.log(`- ${user.nome} (${user.email}), cargo: ${user.cargo}`);
    });
    
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão com o banco de dados encerrada');
    }
  }
}

// Função auxiliar para gerar hash de senha (útil para adicionar mais usuários)
function hashSenha(senha) {
  return bcrypt.hashSync(senha, 10);
}

// Executar a configuração
setupDatabase().catch(console.error);

// Exemplo de como usar a função hashSenha para gerar novos hashes:
// console.log('Hash para nova senha:', hashSenha('minhasenha123')); 