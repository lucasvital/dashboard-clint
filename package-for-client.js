/**
 * Script para criar um pacote de distribuição para o cliente
 * Este script copia apenas os arquivos necessários para o cliente instalar o sistema
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Diretório de saída para o pacote
const outputDir = path.join(__dirname, 'dist-package');

// Arquivos e diretórios a serem incluídos no pacote
const filesToInclude = [
  // Arquivos de setup e configuração
  'setup-all.js',
  'config.js',
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  
  // Diretório do banco de dados (excluindo node_modules)
  'database/schema.sql',
  'database/setup.js',
  'database/package.json',
  
  // Frontend compilado (será gerado antes de empacotar)
  'dist/'
];

// Limpar diretório de saída
async function limparDiretorioSaida() {
  console.log('🧹 Limpando diretório de saída...');
  
  if (fs.existsSync(outputDir)) {
    if (process.platform === 'win32') {
      await execPromise(`rmdir /s /q "${outputDir}"`);
    } else {
      await execPromise(`rm -rf "${outputDir}"`);
    }
  }
  
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Diretório de saída limpo');
}

// Compilar frontend
async function compilarFrontend() {
  console.log('🔨 Compilando frontend...');
  try {
    await execPromise('npm run build');
    console.log('✅ Frontend compilado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao compilar frontend:', error.message);
    throw error;
  }
}

// Copiar arquivos para o diretório de saída
async function copiarArquivos() {
  console.log('📂 Copiando arquivos para o pacote...');
  
  for (const filePath of filesToInclude) {
    const srcPath = path.join(__dirname, filePath);
    const destPath = path.join(outputDir, filePath);
    
    // Verificar se o arquivo/diretório existe
    if (!fs.existsSync(srcPath)) {
      console.log(`⚠️ Arquivo ou diretório não encontrado: ${filePath}`);
      continue;
    }
    
    // Obter informações do arquivo
    const stats = fs.statSync(srcPath);
    
    if (stats.isDirectory()) {
      // Copiar diretório recursivamente
      fs.mkdirSync(destPath, { recursive: true });
      
      // Se for o diretório database, criar também o node_modules vazio para evitar erros
      if (filePath === 'database') {
        fs.mkdirSync(path.join(destPath, 'node_modules'), { recursive: true });
      }
      
      const files = fs.readdirSync(srcPath);
      
      for (const file of files) {
        // Pular node_modules
        if (file === 'node_modules') continue;
        
        const srcFilePath = path.join(srcPath, file);
        const destFilePath = path.join(destPath, file);
        
        // Verificar se é um diretório ou arquivo
        if (fs.statSync(srcFilePath).isDirectory()) {
          // Copiar diretório recursivamente (chamada recursiva)
          await copiarDiretorioRecursivo(srcFilePath, destFilePath);
        } else {
          // Copiar arquivo
          fs.copyFileSync(srcFilePath, destFilePath);
        }
      }
      
      console.log(`📁 Diretório copiado: ${filePath}`);
    } else {
      // Criar diretórios pai se não existirem
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      // Copiar arquivo
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Arquivo copiado: ${filePath}`);
    }
  }
  
  console.log('✅ Arquivos copiados com sucesso');
}

// Função auxiliar para copiar diretório recursivamente
async function copiarDiretorioRecursivo(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Pular node_modules
    if (entry.name === 'node_modules') continue;
    
    if (entry.isDirectory()) {
      await copiarDiretorioRecursivo(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Criar arquivo .env.example
async function criarEnvExample() {
  console.log('📝 Criando arquivo .env.example...');
  
  const envContent = `# Configurações de ambiente do Clint Dashboard

# URLs
VITE_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:3000

# Banco de dados PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432
DB_NAME=clint_db

# Configurações do servidor
PORT=3000
NODE_ENV=production

# Credenciais da API Clint
email=
senha=
api-token=
`;
  
  fs.writeFileSync(path.join(outputDir, '.env.example'), envContent);
  console.log('✅ Arquivo .env.example criado');
}

// Criar arquivo README com instruções
async function criarReadme() {
  console.log('📝 Criando README com instruções...');
  
  const readmeContent = `# Clint Dashboard - Instalação

Este pacote contém o sistema Clint Dashboard pronto para instalação.

## Requisitos

- Node.js 14 ou superior
- PostgreSQL 12 ou superior

## Passos para Instalação

1. Extraia este pacote em um diretório no servidor
2. Abra um terminal no diretório extraído
3. Execute o comando: \`node setup-all.js\`
4. Siga as instruções na tela para configurar o sistema
5. O sistema será instalado e iniciado automaticamente com PM2

## Gerenciamento com PM2

O sistema utiliza PM2 para gerenciar o processo Node.js em produção. Isso garante que o sistema continue rodando e seja reiniciado automaticamente em caso de falhas.

Comandos úteis do PM2:
- \`pm2 status\` - Verificar status do servidor
- \`pm2 logs clint-dashboard\` - Ver logs em tempo real
- \`pm2 restart clint-dashboard\` - Reiniciar o servidor
- \`pm2 stop clint-dashboard\` - Parar o servidor
- \`pm2 delete clint-dashboard\` - Remover o servidor do PM2

Durante a instalação, o sistema também tentará configurar o PM2 para iniciar automaticamente quando o servidor for reiniciado.

## Suporte

Em caso de problemas na instalação, entre em contato com suporte@shortmidia.com.br.
`;
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
  console.log('✅ README.md criado');
}

// Criar pacote ZIP
async function criarZip() {
  console.log('📦 Criando arquivo ZIP...');
  
  try {
    const zipName = `clint-dashboard-install-${new Date().toISOString().slice(0, 10)}.zip`;
    
    if (process.platform === 'win32') {
      // No Windows, usar o comando powershell para compactar
      await execPromise(`powershell Compress-Archive -Path "${outputDir}/*" -DestinationPath "${zipName}" -Force`);
    } else {
      // No Linux/Mac, usar zip
      await execPromise(`cd "${outputDir}" && zip -r "../${zipName}" ./*`);
    }
    
    console.log(`✅ Pacote ZIP criado: ${zipName}`);
  } catch (error) {
    console.error('❌ Erro ao criar arquivo ZIP:', error.message);
    console.log('⚠️ Você pode compactar manualmente o diretório dist-package');
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando empacotamento para distribuição...');
    
    await limparDiretorioSaida();
    await compilarFrontend();
    await copiarArquivos();
    await criarEnvExample();
    await criarReadme();
    await criarZip();
    
    console.log('\n🎉 Pacote de instalação gerado com sucesso!');
    console.log('O pacote está pronto para ser enviado ao cliente.');
  } catch (error) {
    console.error('\n❌ Erro durante o empacotamento:', error);
    process.exit(1);
  }
}

// Executar função principal
main(); 