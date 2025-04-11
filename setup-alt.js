/**
 * Script alternativo de configuração do Clint Dashboard
 * Configuração completa que instala Node.js, npm e dependências em uma VPS virgem
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const util = require('util');
const execPromise = util.promisify(exec);

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

console.log('🚀 Iniciando configuração completa do Sistema Clint');

// Função para executar comando com output em tempo real
function executarComando(comando, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${comando}`);
    
    const childProcess = spawn(comando, {
      shell: true,
      cwd,
      stdio: 'inherit'
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}: ${comando}`));
      }
    });
  });
}

// Verificar se um programa está instalado
async function verificarInstalacao(programa) {
  try {
    await execPromise(`which ${programa} || command -v ${programa}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Instalar dependências do sistema
async function instalarDependenciasSistema() {
  console.log('\n🔧 Verificando e instalando dependências do sistema...');
  
  try {
    // Atualizar repositórios
    console.log('📦 Atualizando repositórios...');
    await executarComando('apt-get update');
    
    // Instalar dependências básicas
    console.log('📦 Instalando dependências básicas...');
    await executarComando('apt-get install -y curl wget gnupg git build-essential');
    
    // Verificar se Node.js está instalado
    const nodeInstalado = await verificarInstalacao('node');
    if (!nodeInstalado) {
      console.log('📦 Instalando Node.js e npm...');
      // Usar NodeSource para obter versão LTS do Node.js (v18.x)
      await executarComando('curl -fsSL https://deb.nodesource.com/setup_18.x | bash -');
      await executarComando('apt-get install -y nodejs');
      
      // Verificar instalação
      await executarComando('node --version');
      await executarComando('npm --version');
    } else {
      console.log('✅ Node.js já está instalado');
    }
    
    // Verificar se PostgreSQL está instalado
    const postgresInstalado = await verificarInstalacao('psql');
    if (!postgresInstalado) {
      console.log('📦 Instalando PostgreSQL...');
      await executarComando('apt-get install -y postgresql postgresql-contrib');
      
      // Iniciar serviço PostgreSQL
      await executarComando('systemctl start postgresql');
      await executarComando('systemctl enable postgresql');
    } else {
      console.log('✅ PostgreSQL já está instalado');
    }
    
    // Instalar PM2 globalmente
    console.log('📦 Instalando PM2...');
    await executarComando('npm install -g pm2');
    
    console.log('✅ Todas as dependências do sistema foram instaladas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    
    // Tentar instalação manual de Node.js em caso de falha
    const continuar = await pergunta('\n⚠️ Houve um erro na instalação automática. Deseja tentar a instalação manual do Node.js? (s/n): ');
    if (continuar.toLowerCase() === 's') {
      console.log('\nSiga estas instruções para instalar o Node.js manualmente:');
      console.log('1. Execute: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash');
      console.log('2. Feche e reabra o terminal, ou execute: source ~/.bashrc');
      console.log('3. Execute: nvm install 18');
      console.log('4. Reinicie este script após a instalação manual\n');
      
      const prosseguir = await pergunta('Deseja prosseguir mesmo sem todas as dependências? (s/n): ');
      return prosseguir.toLowerCase() === 's';
    }
    return false;
  }
}

// Verificar e configurar PostgreSQL
async function configurarPostgreSQL(dbUser, dbPassword, dbName) {
  console.log('\n🗄️ Configurando PostgreSQL...');
  
  try {
    // Verificar se o usuário já existe
    const userExists = await execPromise(`sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${dbUser}'"`)
      .then(({ stdout }) => stdout.trim() === '1')
      .catch(() => false);
    
    if (!userExists) {
      console.log(`Criando usuário ${dbUser}...`);
      await executarComando(`sudo -u postgres psql -c "CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}'"`);
    }
    
    // Verificar se o banco de dados já existe
    const dbExists = await execPromise(`sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${dbName}'"`)
      .then(({ stdout }) => stdout.trim() === '1')
      .catch(() => false);
    
    if (!dbExists) {
      console.log(`Criando banco de dados ${dbName}...`);
      await executarComando(`sudo -u postgres psql -c "CREATE DATABASE ${dbName} OWNER ${dbUser}"`);
    }
    
    // Garantir privilégios
    await executarComando(`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}"`);
    
    console.log('✅ PostgreSQL configurado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar PostgreSQL:', error.message);
    console.log('⚠️ Você precisará configurar o PostgreSQL manualmente.');
    
    const prosseguir = await pergunta('Deseja prosseguir mesmo sem a configuração do PostgreSQL? (s/n): ');
    return prosseguir.toLowerCase() === 's';
  }
}

// Função principal
async function main() {
  try {
    // Verificar permissões de superusuário
    const ehRoot = process.getuid && process.getuid() === 0;
    if (!ehRoot) {
      console.log('⚠️ Este script precisa ser executado como superusuário para instalar dependências.');
      console.log('Por favor, execute como: sudo node setup-alt.js');
      
      const continuar = await pergunta('Deseja tentar continuar mesmo sem permissões de superusuário? (s/n): ');
      if (continuar.toLowerCase() !== 's') {
        rl.close();
        return;
      }
    }
    
    // Instalar dependências do sistema
    const dependenciasOk = await instalarDependenciasSistema();
    if (!dependenciasOk) {
      console.log('❌ Instalação cancelada devido a problemas com as dependências.');
      rl.close();
      return;
    }
    
    console.log('\n⚙️ Configuração do sistema');
    
    // URL base (sem protocolo, apenas domínio ou IP)
    const urlBase = await pergunta(`URL base (IP ou domínio sem http://) [localhost]: `) || 'localhost';
    
    // Frontend
    console.log('\n🌐 Configuração do Frontend:');
    const portaFrontend = await pergunta(`Porta do Frontend [3000]: `) || '3000';
    
    // Backend
    console.log('\n🖥️ Configuração do Backend:');
    const portaBackend = await pergunta(`Porta do Backend [3001]: `) || '3001';
    
    // Gerar URLs completas
    const config = {
      frontend_url: `http://${urlBase}:${portaFrontend}`,
      backend_url: `http://${urlBase}:${portaBackend}`,
      port: portaBackend,
      node_env: 'production'
    };
    
    // Definir API URL automaticamente
    config.api_url = `${config.backend_url}/api`;
    
    // Banco de dados
    console.log('\n📊 Configuração do banco de dados PostgreSQL:');
    config.db_host = await pergunta(`Host do banco de dados [localhost]: `) || 'localhost';
    config.db_user = await pergunta(`Usuário do PostgreSQL [postgres]: `) || 'postgres';
    config.db_password = await pergunta(`Senha do PostgreSQL [postgres]: `) || 'postgres';
    config.db_port = await pergunta(`Porta do PostgreSQL [5432]: `) || '5432';
    config.db_name = await pergunta(`Nome do banco de dados [clint_db]: `) || 'clint_db';
    
    // Configurar PostgreSQL se for local
    if (config.db_host === 'localhost' || config.db_host === '127.0.0.1') {
      const postgresOk = await configurarPostgreSQL(config.db_user, config.db_password, config.db_name);
      if (!postgresOk) {
        console.log('⚠️ Prosseguindo sem configuração completa do PostgreSQL');
      }
    }
    
    // Credenciais API Clint
    config.clint_email = 'alberto@shortmidia.com.br';
    config.clint_senha = 'zenkaJ-jyghyg-gojqo0';
    config.clint_token = 'U2FsdGVkX1++EGmKUX1DI+e5KAB399FRzzdz50p/pzZg9E6jco79favQHXzIct2fZg5Vop+5UEct0XnXfAbzmA==';
    
    // Resumo das configurações
    console.log('\n📝 Resumo da configuração:');
    console.log(`Frontend URL: ${config.frontend_url}`);
    console.log(`Backend URL: ${config.backend_url}`);
    console.log(`API URL: ${config.api_url}`);
    console.log(`Porta do servidor: ${config.port}`);
    console.log(`Database: PostgreSQL em ${config.db_host}:${config.db_port}/${config.db_name}`);
    
    const confirma = await pergunta('\nAs configurações estão corretas? (s/n): ');
    if (confirma.toLowerCase() !== 's') {
      rl.close();
      return main();
    }
    
    // Criar arquivo .env
    console.log('\n📝 Criando arquivo .env...');
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
email=${config.clint_email}
senha=${config.clint_senha}
api-token=${config.clint_token}

# Configuração do token automático (Playwright)
HEADLESS=true
TOKEN_TIMEOUT=3600
`;
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Arquivo .env criado com sucesso');
    
    // Executar o script principal
    console.log('\n🚀 Executando instalação do sistema...');
    
    try {
      // Instalar dependências
      console.log('\n📦 Instalando dependências...');
      await executarComando('npm install');
      
      // Detectar sistema operacional para tratamento específico
      const platform = process.platform;
      let distro = '';
      
      if (platform === 'linux') {
        try {
          const { stdout } = await execPromise('cat /etc/os-release');
          if (stdout.includes('Ubuntu')) {
            distro = 'ubuntu';
          } else if (stdout.includes('Debian')) {
            distro = 'debian';
          } else {
            distro = 'linux';
          }
        } catch (error) {
          distro = 'linux';
        }
      }
      
      // Instalando dependências para Playwright
      console.log('\n📦 Instalando dependências para automação de token...');
      await executarComando('npm install playwright playwright-core');
      await executarComando('npx playwright install chromium');
      console.log('✅ Playwright instalado com sucesso');
      
      // Compilar frontend com tratamento para Debian
      console.log('\n🔨 Compilando front-end...');
      if (distro === 'debian' || distro === 'ubuntu') {
        console.log('Detectado sistema Debian/Ubuntu, aplicando correções específicas...');
        if (fs.existsSync(path.join(__dirname, 'debian-build-fix.sh'))) {
          await executarComando('chmod +x debian-build-fix.sh && ./debian-build-fix.sh');
          await executarComando('./build.sh');
        } else {
          await executarComando('npm install --save crypto-browserify');
          await executarComando('npm install --save-dev cross-env stream-browserify assert buffer process util');
          await executarComando('NODE_ENV=production npx vite build');
        }
      } else {
        await executarComando('npm run build');
      }
      
      // Configurar banco de dados
      const setupDbPath = path.join(__dirname, 'database', 'setup.js');
      if (fs.existsSync(setupDbPath)) {
        console.log('\n🗄️ Configurando banco de dados...');
        // Atualizar arquivo setup.js com as credenciais configuradas
        let setupContent = fs.readFileSync(setupDbPath, 'utf8');
        setupContent = setupContent.replace(/host: '.*?',/, `host: '${config.db_host}',`);
        setupContent = setupContent.replace(/user: '.*?',/, `user: '${config.db_user}',`);
        setupContent = setupContent.replace(/password: '.*?',/, `password: '${config.db_password}',`);
        setupContent = setupContent.replace(/port: \d+/, `port: ${config.db_port}`);
        setupContent = setupContent.replace(/const dbName = '.*?';/, `const dbName = '${config.db_name}';`);
        fs.writeFileSync(setupDbPath, setupContent);
        
        await executarComando('node setup.js', {
          cwd: path.join(__dirname, 'database')
        });
      }
      
      // Iniciar servidor com PM2
      console.log('\n🚀 Iniciando servidor com PM2...');
      
      // Iniciar ou reiniciar servidor
      try {
        const { stdout } = await execPromise('pm2 list');
        if (stdout.includes('clint-dashboard')) {
          await executarComando('pm2 reload clint-dashboard');
        } else {
          await executarComando(`pm2 start ${path.join(__dirname, 'server.js')} --name clint-dashboard`);
        }
        
        // Configurar inicialização automática com o sistema
        await executarComando('pm2 startup');
        
        // Salvar configuração PM2
        await executarComando('pm2 save');
        
        // Mostrar status
        await executarComando('pm2 status');
      } catch (error) {
        console.log('⚠️ Erro ao configurar PM2:', error.message);
        console.log('Iniciando servidor diretamente...');
        console.log('Para iniciar manualmente, execute: node server.js');
      }
      
      console.log(`\n✅ Sistema configurado e iniciado com sucesso!`);
      console.log(`\n🌐 Frontend disponível em: ${config.frontend_url}`);
      console.log(`🖥️ Backend disponível em: ${config.backend_url}`);
      console.log(`🔌 API disponível em: ${config.api_url}`);
      
      console.log('\n🔒 Configuração de Firewall:');
      console.log(`Se você estiver usando UFW, execute os seguintes comandos para abrir as portas necessárias:`);
      console.log(`sudo ufw allow ${portaFrontend}/tcp`);
      console.log(`sudo ufw allow ${portaBackend}/tcp`);
    } catch (error) {
      console.error('❌ Erro durante a instalação:', error.message);
    }
    
    // Fechar interface de readline após a configuração
    rl.close();
    
    console.log('\n🎉 Configuração completa concluída!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error);
    rl.close();
    process.exit(1);
  }
}

// Executar função principal
main(); 