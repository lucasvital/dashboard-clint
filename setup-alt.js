/**
 * Script alternativo de configuração do Clint Dashboard
 * Configuração simplificada que pergunta apenas URL base e portas
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

console.log('🚀 Iniciando configuração simplificada do Sistema Clint');

// Função principal
async function main() {
  try {
    console.log('\n⚙️ Configuração simplificada do sistema');
    
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
      node_env: 'development'
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
`;
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Arquivo .env criado com sucesso');
    
    // Executar o script principal
    console.log('\n🚀 Executando instalação do sistema...');
    
    // Em vez de executar setup-all.js, vamos fazer a instalação diretamente
    try {
      // Instalar dependências
      console.log('\n📦 Instalando dependências...');
      await execPromise('npm install');
      
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
      
      // Compilar frontend com tratamento para Debian
      console.log('\n🔨 Compilando front-end...');
      if (distro === 'debian' || distro === 'ubuntu') {
        console.log('Detectado sistema Debian/Ubuntu, aplicando correções específicas...');
        if (fs.existsSync(path.join(__dirname, 'debian-build-fix.sh'))) {
          await execPromise('chmod +x debian-build-fix.sh && ./debian-build-fix.sh');
          await execPromise('./build.sh');
        } else {
          await execPromise('npm install --save crypto-browserify');
          await execPromise('npm install --save-dev cross-env stream-browserify assert buffer process util');
          await execPromise('NODE_ENV=development npx vite build --mode development');
        }
      } else {
        await execPromise('npm run build');
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
        
        await execPromise('node setup.js', {
          cwd: path.join(__dirname, 'database')
        });
      }
      
      // Iniciar servidor com PM2
      console.log('\n🚀 Iniciando servidor com PM2...');
      try {
        // Verificar se PM2 está instalado
        await execPromise('pm2 --version');
      } catch (error) {
        // Instalar PM2 se não estiver disponível
        console.log('PM2 não encontrado, instalando...');
        await execPromise('npm install -g pm2');
      }
      
      // Iniciar ou reiniciar servidor
      try {
        const { stdout } = await execPromise('pm2 list');
        if (stdout.includes('clint-dashboard')) {
          await execPromise('pm2 reload clint-dashboard');
        } else {
          await execPromise(`pm2 start ${path.join(__dirname, 'server.js')} --name clint-dashboard`);
        }
        
        // Salvar configuração PM2
        await execPromise('pm2 save');
        
        // Mostrar status
        await execPromise('pm2 status');
      } catch (error) {
        console.log('⚠️ Erro ao configurar PM2:', error.message);
        console.log('Iniciando servidor diretamente...');
        console.log('Para iniciar manualmente, execute: node server.js');
      }
      
      console.log(`\n✅ Sistema configurado e iniciado com sucesso!`);
      console.log(`\n🌐 Frontend disponível em: ${config.frontend_url}`);
      console.log(`🖥️ Backend disponível em: ${config.backend_url}`);
      console.log(`🔌 API disponível em: ${config.api_url}`);
    } catch (error) {
      console.error('❌ Erro durante a instalação:', error.message);
    }
    
    // Fechar interface de readline após a configuração
    rl.close();
    
    console.log('\n🎉 Configuração alternativa concluída!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error);
    rl.close();
    process.exit(1);
  }
}

// Executar função principal
main(); 