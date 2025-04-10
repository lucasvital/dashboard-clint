/**
 * Script interativo para configurar todo o ambiente do Clint em uma VPS
 * Configura o frontend, backend e banco de dados PostgreSQL
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuração das perguntas interativas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisificar a função de pergunta
function pergunta(questao) {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => {
      resolve(resposta);
    });
  });
}

// Configurações padrão
const config = {
  // URLs e portas
  frontend_url: 'http://localhost:3000',
  backend_url: 'http://localhost:3000',
  api_url: 'http://localhost:3000/api',
  port: '3000',
  
  // Banco de dados
  db_host: 'localhost',
  db_user: 'postgres',
  db_password: 'postgres',
  db_port: '5432',
  db_name: 'clint_db',
  
  // Configurações gerais
  node_env: 'development'
};

console.log('🚀 Iniciando configuração do Sistema Clint para VPS');

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
      
      if (stdout) {
        console.log(stdout);
      }
      
      console.log(`✅ Comando concluído`);
      resolve(stdout);
    });
  });
}

// Função para detectar o sistema operacional
async function detectarSistemaOperacional() {
  try {
    const platform = process.platform;
    console.log(`\n🖥️ Sistema operacional detectado: ${platform}`);
    
    let distro = '';
    
    if (platform === 'linux') {
      try {
        const { stdout } = await execPromise('cat /etc/os-release');
        if (stdout.includes('Ubuntu')) {
          distro = 'ubuntu';
        } else if (stdout.includes('Debian')) {
          distro = 'debian';
        } else if (stdout.includes('CentOS') || stdout.includes('Red Hat')) {
          distro = 'centos';
        } else {
          distro = 'linux';
        }
      } catch (error) {
        distro = 'linux';
      }
    } else if (platform === 'win32') {
      distro = 'windows';
    } else if (platform === 'darwin') {
      distro = 'macos';
    }
    
    console.log(`Distribuição detectada: ${distro}`);
    return { platform, distro };
  } catch (error) {
    console.error('Erro ao detectar sistema operacional:', error);
    return { platform: process.platform, distro: 'desconhecido' };
  }
}

// Função para verificar dependências
async function verificarDependencias() {
  console.log('\n🔍 Verificando dependências...');
  
  try {
    // Verificar Node.js
    await execPromise('node --version');
    
    // Verificar npm
    await execPromise('npm --version');
    
    // Verificar PM2
    try {
      await execPromise('pm2 --version');
      console.log('✅ PM2 encontrado');
    } catch (error) {
      console.log('⚠️ PM2 não encontrado. Será instalado automaticamente.');
      await execPromise('npm install -g pm2');
      console.log('✅ PM2 instalado globalmente');
    }
    
    // Verificar PostgreSQL
    try {
      await execPromise('psql --version');
      console.log('✅ PostgreSQL encontrado');
      return true;
    } catch (error) {
      console.log('⚠️ PostgreSQL não encontrado. Será necessário instalar.');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar dependências:', error);
    process.exit(1);
  }
}

// Função para instalar PostgreSQL de acordo com a distribuição
async function instalarPostgreSQL(distro) {
  console.log('\n📦 Instalando PostgreSQL...');
  
  try {
    if (distro === 'ubuntu' || distro === 'debian') {
      await execPromise('sudo apt-get update');
      await execPromise('sudo apt-get install -y postgresql postgresql-contrib');
    } else if (distro === 'centos') {
      await execPromise('sudo dnf -y install postgresql-server postgresql-contrib');
      await execPromise('sudo postgresql-setup --initdb');
      await execPromise('sudo systemctl start postgresql');
      await execPromise('sudo systemctl enable postgresql');
    } else if (distro === 'windows') {
      console.log('⚠️ Para Windows, você precisa instalar o PostgreSQL manualmente:');
      console.log('1. Acesse https://www.postgresql.org/download/windows/');
      console.log('2. Baixe e instale a versão mais recente');
      console.log('3. Durante a instalação, anote as credenciais configuradas');
      
      const confirma = await pergunta('Você já instalou o PostgreSQL? (s/n): ');
      if (confirma.toLowerCase() !== 's') {
        throw new Error('PostgreSQL precisa ser instalado manualmente no Windows');
      }
    } else {
      throw new Error(`Instalação de PostgreSQL não suportada para ${distro}`);
    }
    
    console.log('✅ PostgreSQL instalado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao instalar PostgreSQL:', error);
    return false;
  }
}

// Função para configurar PostgreSQL
async function configurarPostgreSQL() {
  console.log('\n🛠️ Configurando PostgreSQL...');
  
  try {
    if (process.platform === 'linux') {
      // Definir senha para o usuário postgres
      await execPromise(`sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '${config.db_password}';"`, {
        env: { ...process.env, PGPASSWORD: config.db_password }
      });
      
      // Iniciar PostgreSQL se não estiver rodando
      await execPromise('sudo systemctl start postgresql');
    }
    
    console.log('✅ PostgreSQL configurado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar PostgreSQL:', error);
    return false;
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

// Função para configurar arquivo .env
async function configurarEnv() {
  console.log('\n📝 Configurando arquivo .env...');
  
  try {
    // Gerar conteúdo do .env
    const envContent = `# Configurações de ambiente do Clint Dashboard

# URLs
VITE_API_URL=${config.api_url}
BACKEND_URL=${config.backend_url}

# Banco de dados PostgreSQL
DB_HOST=${config.db_host}
DB_USER=${config.db_user}
DB_PASSWORD=${config.db_password}
DB_PORT=${config.db_port}
DB_NAME=${config.db_name}

# Configurações do servidor
PORT=${config.port}
NODE_ENV=${config.node_env}

# Credenciais da API Clint
email=${config.clint_email || 'alberto@shortmidia.com.br'}
senha=${config.clint_senha || 'zenkaJ-jyghyg-gojqo0'}
api-token=${config.clint_token || 'U2FsdGVkX1++EGmKUX1DI+e5KAB399FRzzdz50p/pzZg9E6jco79favQHXzIct2fZg5Vop+5UEct0XnXfAbzmA=='}
`;
    
    // Salvar arquivo .env
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    
    console.log('✅ Arquivo .env criado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar .env:', error);
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
    
    // Atualizar arquivo setup.js com as credenciais configuradas
    let setupContent = fs.readFileSync(setupPath, 'utf8');
    
    // Substituir configurações de conexão
    setupContent = setupContent.replace(/host: '.*?',/, `host: '${config.db_host}',`);
    setupContent = setupContent.replace(/user: '.*?',/, `user: '${config.db_user}',`);
    setupContent = setupContent.replace(/password: '.*?',/, `password: '${config.db_password}',`);
    setupContent = setupContent.replace(/port: \d+/, `port: ${config.db_port}`);
    setupContent = setupContent.replace(/const dbName = '.*?';/, `const dbName = '${config.db_name}';`);
    
    // Salvar as alterações
    fs.writeFileSync(setupPath, setupContent);
    
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
    // Verificar se estamos em um ambiente Debian
    const { platform, distro } = await detectarSistemaOperacional();
    
    if (distro === 'debian' || distro === 'ubuntu') {
      console.log('\n🔧 Ambiente Debian/Ubuntu detectado, aplicando correções específicas para build...');
      
      // Verificar se o script debian-build-fix.sh existe
      if (fs.existsSync(path.join(__dirname, 'debian-build-fix.sh'))) {
        console.log('Executando script de correção para Debian...');
        await execPromise('chmod +x debian-build-fix.sh && ./debian-build-fix.sh');
        console.log('✅ Correções para Debian aplicadas com sucesso');
        
        // Usar o script de build direto criado pelo debian-build-fix.sh
        await execPromise('./build.sh');
      } else {
        // Instalar dependências necessárias
        console.log('Instalando dependências para build em Debian...');
        await execPromise('npm install --save crypto-browserify');
        await execPromise('npm install --save-dev cross-env stream-browserify assert buffer process util');
        
        // Executar build com NODE_ENV explícito
        await execPromise('NODE_ENV=development npx vite build --mode development');
      }
    } else {
      // Para outros sistemas, executar build normal
      await execPromise('npm run build');
    }
    
    console.log('✅ Front-end compilado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao compilar front-end:', error);
    throw error;
  }
}

// Função para iniciar o servidor
async function iniciarServidor() {
  console.log('\n🚀 Iniciando servidor com PM2...');
  
  try {
    // Verificar se já existe uma instância do app rodando no PM2
    try {
      const { stdout } = await execPromise('pm2 list');
      if (stdout.includes('clint-dashboard')) {
        // Se já existir, recarregar
        console.log('Aplicação já existe no PM2, recarregando...');
        await execPromise('pm2 reload clint-dashboard');
      } else {
        // Caso contrário, iniciar
        console.log('Iniciando aplicação no PM2...');
        await execPromise(`pm2 start ${path.join(__dirname, 'server.js')} --name clint-dashboard`);
      }
    } catch (error) {
      // Se houver erro ao verificar, tentar iniciar
      console.log('Iniciando aplicação no PM2...');
      await execPromise(`pm2 start ${path.join(__dirname, 'server.js')} --name clint-dashboard`);
    }
    
    // Configurar PM2 para iniciar no boot do sistema
    if (process.platform === 'linux' || process.platform === 'darwin') {
      try {
        console.log('\n🔄 Configurando PM2 para iniciar no boot do sistema...');
        const startupCommand = await execPromise('pm2 startup');
        
        // Extrair comando sudo se necessário
        const cmdMatch = startupCommand.stdout.match(/sudo\s+.+/);
        if (cmdMatch) {
          const sudoCmd = cmdMatch[0];
          console.log(`Execute o seguinte comando com privilégios de administrador para habilitar o início automático:`);
          console.log(`\n${sudoCmd}\n`);
        }
        
        // Salvar configuração atual
        await execPromise('pm2 save');
        console.log('✅ PM2 configurado para iniciar automaticamente');
      } catch (error) {
        console.log('⚠️ Não foi possível configurar o início automático do PM2.');
        console.log('Execute manualmente: pm2 startup && pm2 save');
      }
    } else if (process.platform === 'win32') {
      try {
        console.log('\n🔄 Configurando PM2 para iniciar automaticamente no Windows...');
        await execPromise('pm2-startup install');
        await execPromise('pm2 save');
        console.log('✅ PM2 configurado para iniciar automaticamente');
      } catch (error) {
        console.log('⚠️ Não foi possível configurar o início automático do PM2.');
        console.log('Execute manualmente: pm2-startup install && pm2 save');
      }
    }
    
    // Mostrar status do PM2
    await execPromise('pm2 status');
    
    console.log(`\n✅ Servidor Clint iniciado com PM2 e configurado!`);
    console.log(`\nComandos úteis do PM2:`);
    console.log(`- 'pm2 status' - Verificar status do servidor`);
    console.log(`- 'pm2 logs clint-dashboard' - Ver logs em tempo real`);
    console.log(`- 'pm2 restart clint-dashboard' - Reiniciar o servidor`);
    console.log(`- 'pm2 stop clint-dashboard' - Parar o servidor`);
    console.log(`- 'pm2 delete clint-dashboard' - Remover o servidor do PM2`);
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor com PM2:', error);
    throw error;
  }
}

// Função para configuração interativa
async function configuracaoInterativa() {
  console.log('\n⚙️ Configuração interativa do sistema');
  
  // URLs e portas
  config.frontend_url = await pergunta(`URL do frontend (${config.frontend_url}): `) || config.frontend_url;
  config.backend_url = await pergunta(`URL do backend (${config.backend_url}): `) || config.backend_url;
  
  // Definir API URL automaticamente com base no backend
  config.api_url = `${config.backend_url}/api`;
  console.log(`URL da API configurada automaticamente: ${config.api_url}`);
  
  config.port = await pergunta(`Porta do servidor (${config.port}): `) || config.port;
  
  // Banco de dados
  console.log('\n📊 Configuração do banco de dados PostgreSQL:');
  config.db_host = await pergunta(`Host do banco de dados (${config.db_host}): `) || config.db_host;
  config.db_user = await pergunta(`Usuário do PostgreSQL (${config.db_user}): `) || config.db_user;
  config.db_password = await pergunta(`Senha do PostgreSQL (${config.db_password}): `) || config.db_password;
  config.db_port = await pergunta(`Porta do PostgreSQL (${config.db_port}): `) || config.db_port;
  config.db_name = await pergunta(`Nome do banco de dados (${config.db_name}): `) || config.db_name;
  
  // Credenciais Clint (opcionais)
  console.log('\n🔑 Credenciais da API Clint (opcional, pressione Enter para manter padrão):');
  config.clint_email = await pergunta('Email: ');
  config.clint_senha = await pergunta('Senha: ');
  config.clint_token = await pergunta('API Token: ');
  
  // Revisar configurações
  console.log('\n📝 Resumo da configuração:');
  console.log(JSON.stringify(config, null, 2));
  
  const confirma = await pergunta('\nAs configurações estão corretas? (s/n): ');
  if (confirma.toLowerCase() !== 's') {
    return configuracaoInterativa();
  }
  
  rl.close();
}

// Função principal
async function main() {
  try {
    const { platform, distro } = await detectarSistemaOperacional();
    
    await configuracaoInterativa();
    
    const postgresqlInstalado = await verificarDependencias();
    
    if (!postgresqlInstalado) {
      await instalarPostgreSQL(distro);
      if (platform === 'linux') {
        await configurarPostgreSQL();
      }
    }
    
    await instalarDependencias();
    await configurarEnv();
    await configurarBancoDados();
    await compilarFrontend();
    await iniciarServidor();
    
    console.log('\n🎉 Instalação concluída com sucesso!');
    console.log(`Acesse o sistema em: ${config.frontend_url}`);
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar função principal
main(); 