/**
 * Script para configurar todo o ambiente do Clint de uma vez
 * Executa a configuração do banco de dados e prepara o servidor
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando configuração do Sistema Clint');

// Função para executar comando com promessa
function execPromise(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Executando: ${cmd}`);
    
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.log(`⚠️ Stderr: ${stderr}`);
      }
      
      console.log(`✅ Comando concluído`);
      resolve(stdout);
    });
  });
}

// Função para verificar dependências
async function verificarDependencias() {
  console.log('\n🔍 Verificando dependências...');
  
  try {
    // Verificar Node.js
    await execPromise('node --version');
    
    // Verificar npm
    await execPromise('npm --version');
    
    // Verificar MySQL (pode falhar se não estiver no PATH)
    try {
      await execPromise('mysql --version');
    } catch (error) {
      console.log('⚠️ MySQL não encontrado no PATH. Certifique-se de que o MySQL está instalado.');
    }
    
    console.log('✅ Dependências verificadas');
  } catch (error) {
    console.error('❌ Erro ao verificar dependências:', error);
    process.exit(1);
  }
}

// Função para instalar dependências
async function instalarDependencias() {
  console.log('\n📦 Instalando dependências principais...');
  
  try {
    // Instalar dependências principais
    await execPromise('npm install');
    
    // Instalar dependências do banco de dados
    console.log('\n📦 Instalando dependências do banco de dados...');
    
    // Verificar se o diretório database existe
    if (!fs.existsSync(path.join(__dirname, 'database'))) {
      console.log('Criando diretório database...');
      fs.mkdirSync(path.join(__dirname, 'database'));
    }
    
    // Verificar se o arquivo package.json do banco de dados existe
    if (!fs.existsSync(path.join(__dirname, 'database', 'package.json'))) {
      console.log('⚠️ Arquivo package.json do banco de dados não encontrado. Pulando instalação.');
    } else {
      await execPromise('npm install', {
        cwd: path.join(__dirname, 'database')
      });
    }
    
    console.log('✅ Dependências instaladas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error);
    process.exit(1);
  }
}

// Função para configurar banco de dados
async function configurarBancoDados() {
  console.log('\n🗄️ Configurando banco de dados...');
  
  try {
    // Verificar se o arquivo setup.js do banco de dados existe
    const setupPath = path.join(__dirname, 'database', 'setup.js');
    
    if (!fs.existsSync(setupPath)) {
      console.log('⚠️ Arquivo setup.js do banco de dados não encontrado. Pulando configuração.');
      return;
    }
    
    // Executar script de configuração
    await execPromise('node setup.js', {
      cwd: path.join(__dirname, 'database')
    });
    
    console.log('✅ Banco de dados configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    console.log('⚠️ Continuando com a configuração...');
  }
}

// Função para compilar o front-end
async function compilarFrontend() {
  console.log('\n🔨 Compilando front-end...');
  
  try {
    await execPromise('npm run build');
    console.log('✅ Front-end compilado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao compilar front-end:', error);
    process.exit(1);
  }
}

// Função para iniciar o servidor
async function iniciarServidor() {
  console.log('\n🚀 Iniciando servidor...');
  
  const servidor = spawn('node', ['server.js'], {
    stdio: 'inherit'
  });
  
  servidor.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  });
  
  servidor.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Servidor encerrado com código ${code}`);
      process.exit(1);
    }
  });
  
  console.log('✅ Servidor iniciado');
}

// Função principal
async function main() {
  try {
    await verificarDependencias();
    await instalarDependencias();
    await configurarBancoDados();
    await compilarFrontend();
    await iniciarServidor();
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar função principal
main(); 