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

// Verificar se um domínio tem registros DNS válidos
async function verificarDNS(dominio) {
  console.log(`🔍 Verificando registros DNS para ${dominio}...`);
  try {
    const { stdout } = await execPromise(`dig +short ${dominio}`);
    if (stdout && stdout.trim()) {
      console.log(`✅ Domínio ${dominio} tem registros DNS válidos: ${stdout.trim()}`);
      return true;
    } else {
      console.log(`⚠️ Domínio ${dominio} não tem registros DNS!`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ Não foi possível verificar registros DNS para ${dominio}: ${error.message}`);
    return false;
  }
}

// Configurar Nginx e SSL com Certbot
async function configurarDominio(frontendUrl, backendUrl, frontendPort, backendPort, email) {
  console.log('\n🔒 Configurando Nginx e SSL para seus domínios...');
  
  try {
    // Extrair nomes de domínio para verificação antecipada
    const frontendDomain = new URL(frontendUrl).hostname;
    const backendDomain = new URL(backendUrl).hostname;
    
    // Verificar registros DNS antes de prosseguir
    const frontendDNSOk = await verificarDNS(frontendDomain);
    const backendDNSOk = await verificarDNS(backendDomain);
    
    if (!frontendDNSOk || !backendDNSOk) {
      console.log("\n⚠️ AVISO: Um ou mais domínios não têm registros DNS válidos!");
      console.log("Isso impedirá a configuração correta do SSL com o Let's Encrypt.");
      
      const continuar = await pergunta("Deseja continuar sem configurar SSL? Você poderá configurar SSL manualmente mais tarde. (s/n): ");
      if (continuar.toLowerCase() !== 's') {
        console.log("🛑 Configuração de domínio cancelada pelo usuário.");
        return false;
      }

      // Se o usuário optar por continuar sem SSL, definimos uma flag
      var ignorarSSL = true;
    }
    
    // Verificar se as portas necessárias estão livres
    console.log('🔍 Verificando portas utilizadas...');
    try {
      const { stdout: portCheck } = await execPromise('netstat -tuln | grep ":80\\s"');
      if (portCheck) {
        console.log('⚠️ A porta 80 já está em uso por outro serviço:');
        console.log(portCheck);
        
        // Verificar se é Docker que está usando a porta
        const { stdout: dockerCheck } = await execPromise('lsof -i :80 | grep docker');
        if (dockerCheck) {
          console.log('⚠️ Docker está usando a porta 80. Isso pode causar conflitos.');
          
          const pararDocker = await pergunta('Deseja parar o Docker para liberar a porta 80? (s/n): ');
          if (pararDocker.toLowerCase() === 's') {
            console.log('🛑 Parando Docker...');
            await executarComando('systemctl stop docker');
            await executarComando('systemctl stop docker.socket');
          } else {
            // Se o Docker não for parado, necessário usar outra porta para o Nginx
            console.log('⚠️ O Nginx não poderá usar a porta 80. A configuração de SSL pode falhar.');
            console.log('Recomendamos parar o Docker temporariamente ou configurar manualmente depois.');
            
            const prosseguir = await pergunta('Deseja prosseguir mesmo assim? (s/n): ');
            if (prosseguir.toLowerCase() !== 's') {
              console.log("🛑 Configuração de domínio cancelada pelo usuário.");
              return false;
            }
            
            // Se o usuário escolher prosseguir, também ignoramos SSL
            ignorarSSL = true;
          }
        } else {
          // Tentar identificar o serviço que está usando a porta 80
          const { stdout: pidInfo } = await execPromise("lsof -i :80 | grep LISTEN");
          if (pidInfo) {
            console.log('Processo utilizando a porta 80:');
            console.log(pidInfo);
            
            const serviceName = await pergunta('Deseja parar o serviço que está usando a porta 80? (s/n): ');
            if (serviceName.toLowerCase() === 's') {
              // Tentar parar serviços comuns
              console.log('Tentando parar serviços comuns que usam a porta 80...');
              await executarComando('systemctl stop apache2 2>/dev/null || true');
              await executarComando('systemctl stop httpd 2>/dev/null || true');
              
              // Verificar se a porta foi liberada
              try {
                const { stdout: checkAgain } = await execPromise('netstat -tuln | grep ":80\\s"');
                if (checkAgain) {
                  console.log('⚠️ A porta 80 ainda está em uso. Tentando identificar o PID do processo...');
                  const { stdout: pidOutput } = await execPromise("lsof -i :80 | grep LISTEN | awk '{print $2}'");
                  if (pidOutput) {
                    const pid = pidOutput.trim();
                    const matarProcesso = await pergunta(`Deseja encerrar o processo com PID ${pid}? (s/n): `);
                    if (matarProcesso.toLowerCase() === 's') {
                      await executarComando(`kill -9 ${pid}`);
                      console.log(`✅ Processo ${pid} encerrado`);
                    } else {
                      ignorarSSL = true;
                    }
                  }
                } else {
                  console.log('✅ Porta 80 liberada com sucesso!');
                }
              } catch (e) {
                // Se ocorrer um erro, provavelmente a porta foi liberada
                console.log('✅ Porta 80 parece estar liberada agora');
              }
            } else {
              // Se o usuário optar por não parar o serviço, ignoramos SSL
              ignorarSSL = true;
            }
          }
        }
      } else {
        console.log('✅ Porta 80 está livre para o Nginx');
      }
    } catch (e) {
      // Erro ao verificar portas, provavelmente a porta está livre
      console.log('✅ Porta 80 parece estar disponível');
    }
    
    // Verificar se Nginx está instalado
    const nginxInstalado = await verificarInstalacao('nginx');
    if (!nginxInstalado) {
      console.log('📦 Instalando Nginx...');
      await executarComando('apt-get install -y nginx');
    } else {
      console.log('✅ Nginx já está instalado');
      
      // Tentar parar e reiniciar o Nginx para garantir que ele esteja em um estado limpo
      console.log('🔄 Parando Nginx para garantir configuração limpa...');
      await executarComando('systemctl stop nginx');
    }
    
    // Limpar configurações anteriores para os mesmos domínios
    console.log('🧹 Verificando se já existem configurações para estes domínios...');
    const configsExistentes = await execPromise('ls -la /etc/nginx/sites-available/');
    
    if (configsExistentes.stdout.includes(frontendDomain) || configsExistentes.stdout.includes(backendDomain)) {
      console.log('⚠️ Encontradas configurações de domínio anteriores. Removendo...');
      await executarComando(`rm -f /etc/nginx/sites-available/*${frontendDomain}* 2>/dev/null || true`);
      await executarComando(`rm -f /etc/nginx/sites-enabled/*${frontendDomain}* 2>/dev/null || true`);
      await executarComando(`rm -f /etc/nginx/sites-available/*${backendDomain}* 2>/dev/null || true`);
      await executarComando(`rm -f /etc/nginx/sites-enabled/*${backendDomain}* 2>/dev/null || true`);
    }
    
    // Remover configurações padrão que possam interferir
    console.log('🧹 Removendo configurações padrão do Nginx...');
    await executarComando('rm -f /etc/nginx/sites-enabled/default');
    
    // Verificar se Certbot está instalado (apenas se não ignorar SSL)
    if (!ignorarSSL) {
      const certbotInstalado = await verificarInstalacao('certbot');
      if (!certbotInstalado) {
        console.log('📦 Instalando Certbot...');
        await executarComando('apt-get remove certbot');
        
        // Verificar se snap está instalado
        const snapInstalado = await verificarInstalacao('snap');
        if (!snapInstalado) {
          console.log('📦 Instalando Snap...');
          await executarComando('apt-get install -y snapd');
          await executarComando('systemctl enable --now snapd.socket');
        }
        
        await executarComando('snap install --classic certbot');
        await executarComando('ln -sf /snap/bin/certbot /usr/bin/certbot');
      }
    }
    
    // Configurar Nginx para tamanho máximo de upload
    console.log('⚙️ Configurando Nginx para uploads grandes...');
    const configNginx = `client_max_body_size 100M;`;
    fs.writeFileSync('/etc/nginx/conf.d/clint-dashboard.conf', configNginx);
    
    // Criar configuração Nginx para o backend
    console.log(`🔧 Configurando Nginx para o backend (${backendDomain})...`);
    const configBackend = `server {
  server_name ${backendDomain};
  
  location / {
    proxy_pass http://127.0.0.1:${backendPort};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}`;
    
    fs.writeFileSync('/etc/nginx/sites-available/clint-backend', configBackend);
    
    // Criar link simbólico para habilitar o site backend
    await executarComando('ln -sf /etc/nginx/sites-available/clint-backend /etc/nginx/sites-enabled');
    
    // Criar configuração Nginx para o frontend
    console.log(`🔧 Configurando Nginx para o frontend (${frontendDomain})...`);
    const configFrontend = `server {
  server_name ${frontendDomain};
  
  location / {
    proxy_pass http://127.0.0.1:${frontendPort};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}`;
    
    fs.writeFileSync('/etc/nginx/sites-available/clint-frontend', configFrontend);
    
    // Criar link simbólico para habilitar o site frontend
    await executarComando('ln -sf /etc/nginx/sites-available/clint-frontend /etc/nginx/sites-enabled');
    
    // Verificar configuração do Nginx antes de reiniciar
    console.log('✅ Testando configuração do Nginx...');
    await executarComando('nginx -t');
    
    // Reiniciar Nginx
    console.log('🔄 Reiniciando Nginx...');
    await executarComando('systemctl restart nginx');
    
    // Verificar se Nginx está rodando
    try {
      const { stdout: nginxStatus } = await execPromise('systemctl is-active nginx');
      if (nginxStatus.trim() !== 'active') {
        throw new Error('Nginx não está rodando após reiniciar');
      }
      console.log('✅ Nginx reiniciado com sucesso!');
    } catch (e) {
      console.error('⚠️ Nginx não está rodando. Tentando iniciar...');
      await executarComando('systemctl start nginx');
    }
    
    // Configurar SSL com Certbot apenas se não estiver ignorando SSL
    if (!ignorarSSL) {
      console.log('🔒 Configurando certificados SSL com Certbot...');
      if (frontendDomain === backendDomain) {
        // Se for o mesmo domínio, configurar apenas uma vez
        await executarComando(`certbot --nginx --agree-tos --non-interactive -m ${email} --domains ${frontendDomain}`);
      } else {
        // Se forem domínios diferentes, configurar ambos
        await executarComando(`certbot --nginx --agree-tos --non-interactive -m ${email} --domains ${frontendDomain},${backendDomain}`);
      }
      console.log('✅ Configuração SSL concluída com sucesso!');
    } else {
      console.log('⚠️ Configuração SSL ignorada devido a problemas detectados.');
      console.log('Você poderá configurar SSL manualmente mais tarde usando:');
      console.log(`sudo certbot --nginx -d ${frontendDomain} -d ${backendDomain}`);
    }
    
    console.log('✅ Domínios configurados com sucesso!');
    
    // Criar entrada no hosts local para facilitar testes
    const configurarHosts = await pergunta('\nDeseja adicionar entradas no arquivo /etc/hosts para testes locais? (s/n): ');
    if (configurarHosts.toLowerCase() === 's') {
      console.log('📝 Adicionando entradas ao arquivo /etc/hosts...');
      await executarComando(`grep -q "${frontendDomain}" /etc/hosts || echo "127.0.0.1 ${frontendDomain}" >> /etc/hosts`);
      await executarComando(`grep -q "${backendDomain}" /etc/hosts || echo "127.0.0.1 ${backendDomain}" >> /etc/hosts`);
      console.log('✅ Entradas adicionadas ao arquivo /etc/hosts');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar domínios:', error.message);
    console.log('⚠️ Você precisará configurar os domínios manualmente.');
    
    // Tentar detectar e resolver problemas de configuração do Nginx
    try {
      console.log('\n🔍 Verificando erros na configuração do Nginx...');
      const { stdout } = await execPromise('nginx -t');
      console.log('Resultado do teste de configuração:', stdout);
      
      console.log('\n📋 Verificando status do Nginx:');
      await executarComando('systemctl status nginx');
      
      console.log('\n🛠️ Executando diagnóstico adicional:');
      console.log('Verificando portas utilizadas:');
      await executarComando('netstat -tuln | grep ":80\\|:443"');
      
      console.log('\nVerificando processos que usam as portas Web:');
      await executarComando('lsof -i :80 -i :443');
      
      console.log('\nVerificando logs de erro do Nginx:');
      await executarComando('tail -n 50 /var/log/nginx/error.log');
      
      console.log('\nVerificando se os domínios apontam para este servidor:');
      await executarComando(`dig +short ${new URL(frontendUrl).hostname}`);
      await executarComando(`dig +short ${new URL(backendUrl).hostname}`);
      
    } catch (e) {
      console.log('Não foi possível realizar diagnóstico completo:', e.message);
    }
    
    console.log('\n📋 Instruções para configuração manual:');
    console.log('1. Verifique qual serviço está usando a porta 80:');
    console.log('   sudo lsof -i :80');
    console.log('2. Pare o serviço que está usando a porta 80:');
    console.log('   sudo systemctl stop [nome-do-serviço]');
    console.log(`3. Edite /etc/nginx/sites-available/clint-frontend e configure para o domínio ${new URL(frontendUrl).hostname}`);
    console.log(`4. Edite /etc/nginx/sites-available/clint-backend e configure para o domínio ${new URL(backendUrl).hostname}`);
    console.log('5. Verifique erros: sudo nginx -t');
    console.log('6. Reinicie o Nginx: sudo systemctl restart nginx');
    console.log('7. Configure SSL: sudo certbot --nginx');
    console.log('\n8. Verifique se seus domínios têm registros DNS apontando para este servidor:');
    console.log(`   dig +short ${new URL(frontendUrl).hostname}`);
    console.log(`   dig +short ${new URL(backendUrl).hostname}`);
    
    // Perguntar se deseja criar configuração alternativa para IP em vez de domínio
    const usarIP = await pergunta('\nDeseja configurar o acesso por IP até que os domínios estejam disponíveis? (s/n): ');
    if (usarIP.toLowerCase() === 's') {
      try {
        // Obter IP do servidor
        const { stdout: ipAddr } = await execPromise("hostname -I | awk '{print $1}'");
        const serverIP = ipAddr.trim();
        
        console.log(`🔧 Configurando Nginx para acesso direto por IP (${serverIP})...`);
        
        // Criar configuração simples para acesso direto por IP
        const configIP = `server {
  listen 80;
  server_name ${serverIP};
  
  location / {
    proxy_pass http://127.0.0.1:${new URL(frontendUrl).port || 3000};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}

server {
  listen 80;
  server_name ${serverIP}:${new URL(backendUrl).port || 3001};
  
  location / {
    proxy_pass http://127.0.0.1:${new URL(backendUrl).port || 3001};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}`;
        
        fs.writeFileSync('/etc/nginx/sites-available/clint-ip-access', configIP);
        await executarComando('ln -sf /etc/nginx/sites-available/clint-ip-access /etc/nginx/sites-enabled');
        
        // Testar e reiniciar Nginx
        await executarComando('nginx -t');
        await executarComando('systemctl restart nginx');
        
        console.log(`✅ Configuração por IP concluída. Você pode acessar:`);
        console.log(`Frontend: http://${serverIP}`);
        console.log(`Backend: http://${serverIP}:${new URL(backendUrl).port || 3001}`);
      } catch (ipError) {
        console.error('❌ Erro ao configurar acesso por IP:', ipError.message);
      }
    }
    
    const prosseguir = await pergunta('Deseja prosseguir mesmo sem a configuração de domínios? (s/n): ');
    return prosseguir.toLowerCase() === 's';
  }
}

// Função para criar scripts para Debian/Ubuntu
async function criarScriptsDebian() {
  console.log('\n📝 Criando scripts de build para Debian/Ubuntu...');
  
  try {
    // Criar backup do vite.config.js
    console.log('📝 Criando backup do vite.config.js...');
    if (fs.existsSync(path.join(__dirname, 'vite.config.js'))) {
      fs.copyFileSync(
        path.join(__dirname, 'vite.config.js'),
        path.join(__dirname, 'vite.config.js.backup')
      );
    }
    
    // Criar script de build direto
    console.log('📝 Criando script de build direto...');
    const buildScript = `#!/bin/bash
export NODE_OPTIONS=--openssl-legacy-provider
npx vite build
`;
    fs.writeFileSync(path.join(__dirname, 'build.sh'), buildScript);
    await executarComando('chmod +x build.sh');
    
    // Criar script node-build.js
    console.log('📝 Criando patch para crypto...');
    const nodeBuildScript = `const { exec } = require('child_process');

console.log('🔨 Iniciando build com configurações para Debian/Ubuntu...');

// Definir variáveis de ambiente
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

// Executar build
const buildProcess = exec('npx vite build', (error, stdout, stderr) => {
  if (error) {
    console.error(\`❌ Erro durante o build: \${error.message}\`);
    return;
  }
  
  if (stderr) {
    console.log(\`Build warnings: \${stderr}\`);
  }
  
  console.log(stdout);
  console.log('✅ Build concluído com sucesso!');
});

buildProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

buildProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});
`;
    fs.writeFileSync(path.join(__dirname, 'node-build.js'), nodeBuildScript);
    
    // Atualizar vite.config.js para resolver problemas de crypto no Debian
    if (fs.existsSync(path.join(__dirname, 'vite.config.js'))) {
      console.log('📝 Atualizando vite.config.js...');
      let viteConfig = fs.readFileSync(path.join(__dirname, 'vite.config.js'), 'utf8');
      
      // Verificar se já tem a configuração resolve
      if (!viteConfig.includes('resolve:')) {
        // Adicionar configuração para crypto-browserify
        viteConfig = viteConfig.replace(
          'export default defineConfig({',
          `export default defineConfig({
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      buffer: 'buffer',
      process: 'process',
      util: 'util'
    }
  },`
        );
        
        fs.writeFileSync(path.join(__dirname, 'vite.config.js'), viteConfig);
        console.log('✅ vite.config.js atualizado');
      }
    }
    
    console.log('🎉 Todas as correções foram aplicadas!');
    console.log('\n🚀 Agora você pode executar o build usando:');
    console.log('   ./build.sh');
    console.log('   ou');
    console.log('   node node-build.js');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar scripts de build:', error.message);
    return false;
  }
}

// Criar usuário com privilégios sudo
async function criarUsuarioSudo() {
  console.log('\n👤 Configurando usuário administrador...');
  
  try {
    const username = await pergunta('Nome do usuário sudo a ser criado: ');
    
    if (!username || username.trim() === '') {
      console.log('⚠️ Nome de usuário inválido, pulando criação de usuário.');
      return false;
    }
    
    // Verificar se o usuário já existe
    try {
      const { stdout } = await execPromise(`id ${username} &>/dev/null && echo "exists" || echo "not exists"`);
      if (stdout.trim() === 'exists') {
        console.log(`⚠️ Usuário ${username} já existe. Deseja pular ou reconfigurar?`);
        const pular = await pergunta('Pular criação de usuário? (s/n) [s]: ') || 's';
        if (pular.toLowerCase() === 's') {
          console.log('✅ Usando usuário existente');
          return true;
        }
      }
    } catch (e) {
      // Usuário não existe, prosseguir com a criação
    }
    
    // Criar senha segura para o novo usuário
    const senha = await pergunta('Senha para o novo usuário: ');
    if (!senha || senha.length < 6) {
      console.log('⚠️ A senha deve ter pelo menos 6 caracteres!');
      return await criarUsuarioSudo();
    }
    
    // Confirmar senha
    const confirmaSenha = await pergunta('Confirme a senha: ');
    if (senha !== confirmaSenha) {
      console.log('⚠️ As senhas não coincidem!');
      return await criarUsuarioSudo();
    }
    
    // Criar o usuário
    console.log(`📝 Criando usuário ${username}...`);
    await executarComando(`useradd -m -s /bin/bash ${username}`);
    
    // Definir senha para o usuário (de forma segura)
    console.log('🔐 Configurando senha...');
    const comandoSenha = `echo "${username}:${senha}" | chpasswd`;
    await executarComando(comandoSenha);
    
    // Adicionar usuário ao grupo sudo
    console.log('🔑 Adicionando ao grupo sudo...');
    await executarComando(`usermod -aG sudo ${username}`);
    
    // Permitir sudo sem senha (opcional)
    const sudoSemSenha = await pergunta('Permitir sudo sem senha? (s/n) [n]: ') || 'n';
    if (sudoSemSenha.toLowerCase() === 's') {
      console.log('📝 Configurando sudo sem senha...');
      await executarComando(`echo "${username} ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/${username}`);
      await executarComando(`chmod 0440 /etc/sudoers.d/${username}`);
    }
    
    console.log(`✅ Usuário ${username} criado com privilégios sudo!`);
    console.log(`🔑 Você pode fazer login com: ssh ${username}@seu-servidor`);
    
    // Copiar o script para o diretório do novo usuário
    if (fs.existsSync(__filename)) {
      console.log(`📄 Copiando script de configuração para o diretório do usuário ${username}...`);
      const destDir = `/home/${username}`;
      const scriptName = path.basename(__filename);
      await executarComando(`cp ${__filename} ${destDir}/${scriptName}`);
      await executarComando(`chown ${username}:${username} ${destDir}/${scriptName}`);
      console.log(`✅ Script copiado para ${destDir}/${scriptName}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    const continuar = await pergunta('Tentar novamente? (s/n): ');
    if (continuar.toLowerCase() === 's') {
      return await criarUsuarioSudo();
    }
    return false;
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
    } else {
      // Perguntar se deseja criar um usuário com privilégios sudo
      const criarUsuario = await pergunta('\n⚙️ Deseja criar um usuário com privilégios sudo? (s/n) [s]: ') || 's';
      if (criarUsuario.toLowerCase() === 's') {
        await criarUsuarioSudo();
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
    
    // Configuração de URL para frontend e backend
    console.log('\n🌐 Configuração de URLs:');
    console.log('Você pode configurar o frontend e backend em URLs diferentes se necessário.');
    
    // Frontend
    const frontendUrlBase = await pergunta(`URL base do Frontend (IP ou domínio sem http://) [localhost]: `) || 'localhost';
    const portaFrontend = await pergunta(`Porta do Frontend [3000]: `) || '3000';
    const usarHttps = await pergunta(`Usar HTTPS para os domínios? (s/n) [s]: `) || 's';
    const protocolo = usarHttps.toLowerCase() === 's' ? 'https' : 'http';
    
    // Backend
    console.log('\n🖥️ Configuração do Backend:');
    console.log('O Backend e API podem estar em um servidor diferente do Frontend.');
    const backendUrlBase = await pergunta(`URL base do Backend (IP ou domínio sem http://) [${frontendUrlBase}]: `) || frontendUrlBase;
    const portaBackend = await pergunta(`Porta do Backend [3001]: `) || '3001';
    
    // Gerar URLs completas
    const config = {
      frontend_url: `${protocolo}://${frontendUrlBase}`,
      backend_url: `${protocolo}://${backendUrlBase}`,
      port: portaBackend,
      frontend_port: portaFrontend,
      backend_port: portaBackend,
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
    
    // Perguntar se quer configurar Nginx e SSL
    if (usarHttps.toLowerCase() === 's' && (frontendUrlBase !== 'localhost' && backendUrlBase !== 'localhost')) {
      const configurarSSL = await pergunta('\nDeseja configurar Nginx e certificados SSL automaticamente? (s/n) [s]: ') || 's';
      
      if (configurarSSL.toLowerCase() === 's') {
        const email = await pergunta('Email para registros de certificado SSL: ');
        const dominiosOk = await configurarDominio(
          config.frontend_url, 
          config.backend_url, 
          config.frontend_port, 
          config.backend_port,
          email
        );
        
        if (!dominiosOk) {
          console.log('⚠️ Prosseguindo sem configuração completa de domínios');
        }
      }
    }
    
    // Resumo das configurações
    console.log('\n📝 Resumo da configuração:');
    console.log(`Frontend URL: ${config.frontend_url}`);
    console.log(`Backend URL: ${config.backend_url}`);
    console.log(`API URL: ${config.api_url}`);
    console.log(`Porta do servidor: ${config.port}`);
    console.log(`Database: PostgreSQL em ${config.db_host}:${config.db_port}/${config.db_name}`);
    
    if (frontendUrlBase !== backendUrlBase) {
      console.log(`\n⚠️ NOTA: Frontend e Backend estão em servidores diferentes.`);
      console.log(`Certifique-se de configurar CORS corretamente e que o frontend possa acessar o backend.`);
    }
    
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
VITE_BACKEND_URL=${config.backend_url}
BACKEND_URL=${config.backend_url}
FRONTEND_URL=${config.frontend_url}

# Portas locais para serviços
FRONTEND_PORT=${config.frontend_port}
BACKEND_PORT=${config.backend_port}

# Banco de dados PostgreSQL
DB_HOST=${config.db_host}
DB_USER=${config.db_user}
DB_PASSWORD=${config.db_password}
DB_PORT=${config.db_port}
DB_NAME=${config.db_name}

# Configurações do servidor
PORT=${config.port}
NODE_ENV=${config.node_env}

# Configuração de CORS (para servidores frontend/backend separados)
CORS_ORIGIN=${config.frontend_url}

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
      
      // Instalando dependências Python para os scripts de automação
      console.log('\n📦 Verificando e instalando Python e dependências...');
      try {
        // Verificar se Python está instalado
        const { stdout: pythonVersion } = await execPromise('python3 --version || python --version');
        console.log(`Python detectado: ${pythonVersion.trim()}`);
        
        // Verificar se pip está instalado
        await execPromise('pip --version || pip3 --version');
        console.log('Pip detectado, instalando dependências Python...');
        
        // Instalar dependências do requirements.txt
        if (fs.existsSync(path.join(__dirname, 'requirements.txt'))) {
          await executarComando('pip install -r requirements.txt || pip3 install -r requirements.txt');
          console.log('✅ Dependências Python instaladas com sucesso');
        } else {
          console.log('⚠️ Arquivo requirements.txt não encontrado, pulando instalação de dependências Python');
        }
      } catch (error) {
        console.log(`⚠️ Erro ao configurar Python: ${error.message}`);
        console.log('Você precisará instalar Python e as dependências manualmente para usar os scripts de automação');
      }
      
      // Compilar frontend com tratamento para Debian
      console.log('\n🔨 Compilando front-end...');
      if (distro === 'debian' || distro === 'ubuntu') {
        console.log('Detectado sistema Debian/Ubuntu, aplicando correções específicas...');
        
        // Criar scripts de build específicos para Debian/Ubuntu
        await criarScriptsDebian();
        
        // Instalar dependências necessárias
        await executarComando('npm install --save crypto-browserify');
        await executarComando('npm install --save-dev cross-env stream-browserify assert buffer process util');
        
        // Executar o build com o script criado
        await executarComando('./build.sh');
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
        
        // Corrigindo o caminho para o diretório database
        const databaseDir = path.join(__dirname, 'database');
        await executarComando('node setup.js', databaseDir);
      }
      
      // Iniciar servidor com PM2
      console.log('\n🚀 Iniciando servidor com PM2...');
      
      // Iniciar ou reiniciar servidor
      try {
        const { stdout } = await execPromise('pm2 list');
        if (stdout.includes('clint-dashboard')) {
          await executarComando('pm2 reload clint-dashboard');
        } else {
          await executarComando(`pm2 start npm --name clint-dashboard -- run start`);
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
      
      if (frontendUrlBase !== backendUrlBase) {
        console.log(`\n⚠️ IMPORTANTE: Como você configurou o frontend e backend em servidores diferentes,`);
        console.log(`   verifique se a configuração CORS está funcionando corretamente.`);
        console.log(`   Se houver problemas de conexão entre frontend e backend, verifique:`);
        console.log(`   1. O firewall está permitindo conexões externas`);
        console.log(`   2. O servidor backend está configurado para aceitar requisições da URL frontend`);
      }
      
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