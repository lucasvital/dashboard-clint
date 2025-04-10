/**
 * Script para corrigir problemas de build do Vite em VPS
 * Este script resolve problemas comuns como:
 * - NODE_ENV=production no .env (não suportado pelo Vite)
 * - crypto.getRandomValues não disponível
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🔧 Iniciando correções para build do Vite em VPS...');

// 1. Corrigir .env
console.log('\n📝 Verificando arquivo .env...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NODE_ENV=production')) {
    envContent = envContent.replace('NODE_ENV=production', 'NODE_ENV=development');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ NODE_ENV alterado para development no arquivo .env');
  } else {
    console.log('✅ NODE_ENV já está configurado corretamente');
  }
} else {
  console.log('⚠️ Arquivo .env não encontrado');
}

// 2. Verificar e instalar dependências necessárias
async function instalarDependencias() {
  console.log('\n📦 Verificando e instalando dependências...');
  
  try {
    // Instalar crypto-browserify
    await execPromise('npm install crypto-browserify');
    console.log('✅ crypto-browserify instalado');
    
    // Instalar cross-env
    await execPromise('npm install --save-dev cross-env');
    console.log('✅ cross-env instalado');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    return false;
  }
}

// 3. Atualizar vite.config.js
function atualizarViteConfig() {
  console.log('\n🔧 Atualizando vite.config.js...');
  
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Verificar se já tem o alias para crypto
    if (!viteConfig.includes("'crypto': 'crypto-browserify'")) {
      // Adicionar alias para crypto
      viteConfig = viteConfig.replace(
        /resolve: \{/,
        `resolve: {
    alias: {
      ...alias,
      'crypto': 'crypto-browserify'
    },`
      );
      
      // Se não tinha seção resolve
      if (!viteConfig.includes('resolve: {')) {
        viteConfig = viteConfig.replace(
          /plugins: \[[^\]]*\],/,
          `plugins: [vue()],
  resolve: {
    alias: {
      'crypto': 'crypto-browserify'
    },
  },`
        );
      }
      
      // Adicionar configuração de build
      if (!viteConfig.includes('build: {')) {
        viteConfig = viteConfig.replace(
          /}\)/,
          `  build: {
    sourcemap: true,
    minify: false
  }
})`
        );
      }
      
      fs.writeFileSync(viteConfigPath, viteConfig);
      console.log('✅ vite.config.js atualizado com alias para crypto');
    } else {
      console.log('✅ vite.config.js já tem alias para crypto');
    }
  } else {
    console.log('⚠️ vite.config.js não encontrado, criando...');
    
    const newViteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'crypto': 'crypto-browserify'
    },
  },
  build: {
    sourcemap: true,
    minify: false
  }
})`;
    
    fs.writeFileSync(viteConfigPath, newViteConfig);
    console.log('✅ vite.config.js criado');
  }
}

// 4. Atualizar package.json
function atualizarPackageJson() {
  console.log('\n🔧 Atualizando package.json...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Atualizar script de build
    if (packageJson.scripts && packageJson.scripts.build !== "cross-env NODE_ENV=development vite build --mode development") {
      packageJson.scripts.build = "cross-env NODE_ENV=development vite build --mode development";
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json atualizado com script de build modificado');
    } else {
      console.log('✅ package.json já tem o script de build correto');
    }
  } else {
    console.log('⚠️ package.json não encontrado');
  }
}

// Função principal
async function main() {
  try {
    await instalarDependencias();
    atualizarViteConfig();
    atualizarPackageJson();
    
    console.log('\n🎉 Correções aplicadas com sucesso!');
    console.log('\n🚀 Agora você pode executar: npm run build');
  } catch (error) {
    console.error('\n❌ Erro ao aplicar correções:', error);
  }
}

// Executar função principal
main(); 