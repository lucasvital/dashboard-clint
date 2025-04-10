/**
 * Script para instalar dependências necessárias para o build no Debian
 * Instala cross-env, crypto-browserify e outras dependências essenciais
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🔧 Instalando dependências essenciais para build...');

async function instalarDependencias() {
  try {
    console.log('\n📦 Instalando cross-env...');
    await execPromise('npm install --save-dev cross-env');
    console.log('✅ cross-env instalado com sucesso');
    
    console.log('\n📦 Instalando crypto-browserify...');
    await execPromise('npm install --save crypto-browserify');
    console.log('✅ crypto-browserify instalado com sucesso');
    
    console.log('\n📦 Instalando dependências adicionais...');
    await execPromise('npm install --save-dev stream-browserify assert buffer process util');
    console.log('✅ Dependências adicionais instaladas com sucesso');
    
    console.log('\n🔄 Criando script de build local...');
    // Criar um script local que não depende de cross-env
    await execPromise('echo "NODE_ENV=development vite build --mode development" > build.sh');
    await execPromise('chmod +x build.sh');
    console.log('✅ Script build.sh criado');
    
    console.log('\n🎉 Todas as dependências foram instaladas com sucesso!');
    console.log('\n🚀 Agora você pode executar o build usando:');
    console.log('   npm run build');
    console.log('   ou');
    console.log('   ./build.sh');
  } catch (error) {
    console.error('\n❌ Erro ao instalar dependências:', error);
    process.exit(1);
  }
}

instalarDependencias(); 