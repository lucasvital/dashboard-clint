/**
 * Script para instalar dependências e iniciar a API CSV
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar se o package.json existe
const hasPackageJson = fs.existsSync('./package.json');

// Dependências necessárias
const dependencies = ['express', 'cors', 'papaparse'];

console.log('🔍 Verificando dependências...');

// Função para instalar dependências
function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📦 Instalando dependências...');
    
    const npmInstall = spawn('npm', ['install', '--save', ...dependencies]);
    
    npmInstall.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    npmInstall.stderr.on('data', (data) => {
      console.error(`⚠️ ${data.toString()}`);
    });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependências instaladas com sucesso!');
        resolve();
      } else {
        console.error(`❌ Erro ao instalar dependências (código ${code})`);
        reject(new Error(`Falha ao instalar dependências (código ${code})`));
      }
    });
  });
}

// Função para verificar se as dependências já estão instaladas
function checkDependencies() {
  if (!hasPackageJson) {
    console.log('📄 package.json não encontrado, criando um novo...');
    exec('npm init -y', (error) => {
      if (error) {
        console.error(`❌ Erro ao criar package.json: ${error.message}`);
        return;
      }
      installDependencies().then(startAPI).catch(console.error);
    });
    return;
  }
  
  // Ler o package.json
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Verificar se todas as dependências estão instaladas
  const missingDependencies = dependencies.filter(dep => {
    return !packageJson.dependencies || !packageJson.dependencies[dep];
  });
  
  if (missingDependencies.length > 0) {
    console.log(`📦 Instalando dependências faltantes: ${missingDependencies.join(', ')}`);
    
    const npmInstall = spawn('npm', ['install', '--save', ...missingDependencies]);
    
    npmInstall.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    npmInstall.stderr.on('data', (data) => {
      console.error(`⚠️ ${data.toString()}`);
    });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependências instaladas com sucesso!');
        startAPI();
      } else {
        console.error(`❌ Erro ao instalar dependências (código ${code})`);
      }
    });
  } else {
    console.log('✅ Todas as dependências já estão instaladas');
    startAPI();
  }
}

// Função para iniciar a API
function startAPI() {
  console.log('🚀 Iniciando API CSV...');
  
  // Verificar se o arquivo csv-api.js existe
  if (!fs.existsSync('./csv-api.js')) {
    console.error('❌ Arquivo csv-api.js não encontrado!');
    return;
  }
  
  const apiProcess = spawn('node', ['csv-api.js']);
  
  apiProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  apiProcess.stderr.on('data', (data) => {
    console.error(`❌ ${data.toString()}`);
  });
  
  apiProcess.on('close', (code) => {
    console.log(`⚠️ API encerrada com código ${code}`);
  });
  
  console.log('✅ API iniciada em segundo plano');
  console.log('⚠️ Pressione Ctrl+C para encerrar');
}

// Iniciar a verificação de dependências
checkDependencies(); 