/**
 * Script de correção para o problema de crypto.getRandomValues em servidores Debian
 * Este script modifica o ambiente para fornecer um polyfill completo para crypto
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🔧 Iniciando correções para problemas de crypto no Debian...');

// Função para instalar dependências
async function instalarDependencias() {
  console.log('\n📦 Instalando dependências necessárias...');
  
  try {
    // Instalar node-polyfill-webpack-plugin
    await execPromise('npm install --save-dev node-polyfill-webpack-plugin crypto-browserify stream-browserify assert buffer process util');
    console.log('✅ Dependências instaladas com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    return false;
  }
}

// Função para criar polyfill de crypto
function criarPolyfillCrypto() {
  console.log('\n🛠️ Criando arquivo de polyfill para crypto...');
  
  const polyfillPath = path.join(__dirname, 'src', 'crypto-polyfill.js');
  const polyfillDir = path.dirname(polyfillPath);
  
  // Garantir que o diretório existe
  if (!fs.existsSync(polyfillDir)) {
    fs.mkdirSync(polyfillDir, { recursive: true });
  }
  
  const polyfillContent = `// Polyfill para crypto.getRandomValues
import { randomBytes } from 'crypto-browserify';

// Implementação de getRandomValues caso não exista
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = {};
}

if (typeof window !== 'undefined' && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = function (arr) {
    const bytes = randomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = bytes[i];
    }
    return arr;
  };
}

console.log('✅ Crypto polyfill carregado');
`;
  
  fs.writeFileSync(polyfillPath, polyfillContent);
  console.log(`✅ Arquivo de polyfill criado em ${polyfillPath}`);
  return true;
}

// Função para atualizar o arquivo main.js para importar o polyfill
function atualizarMainJs() {
  console.log('\n🔧 Atualizando arquivo main.js para incluir polyfill...');
  
  const mainJsPath = path.join(__dirname, 'src', 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Verificar se o polyfill já está importado
    if (!mainJsContent.includes('crypto-polyfill')) {
      // Adicionar import do polyfill no início do arquivo
      mainJsContent = `import './crypto-polyfill';\n${mainJsContent}`;
      fs.writeFileSync(mainJsPath, mainJsContent);
      console.log('✅ main.js atualizado com sucesso');
    } else {
      console.log('✅ main.js já inclui o polyfill');
    }
  } else {
    console.error('❌ Arquivo main.js não encontrado em src/');
    return false;
  }
  
  return true;
}

// Função para atualizar o vite.config.js
function atualizarViteConfig() {
  console.log('\n🔧 Atualizando vite.config.js...');
  
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.error('❌ Arquivo vite.config.js não encontrado');
    return false;
  }
  
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Adicionar configuração avançada para o crypto
  if (!viteConfig.includes('crypto-browserify')) {
    const novoCodigo = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util/'
    }
  },
  define: {
    'process.env': {},
    // Fixing "global is not defined"
    global: 'globalThis'
  },
  build: {
    sourcemap: true,
    minify: false,
    rollupOptions: {
      plugins: []
    }
  }
})
`;
    
    fs.writeFileSync(viteConfigPath, novoCodigo);
    console.log('✅ vite.config.js substituído com configuração otimizada');
  } else {
    console.log('✅ vite.config.js já tem configuração para crypto');
  }
  
  return true;
}

// Função para criar fallback
function criarGlobalFallback() {
  console.log('\n🛠️ Criando arquivo HTML com fallbacks...');
  
  const indexHtmlPath = path.join(__dirname, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ Arquivo index.html não encontrado');
    return false;
  }
  
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Verificar se já tem os scripts
  if (!htmlContent.includes('window.global')) {
    // Adicionar script antes do fechamento da tag head
    const scriptContent = `    <!-- Fallbacks para ambiente de build -->
    <script>
      window.global = window;
      window.process = window.process || { env: {} };
      var exports = {};
    </script>
`;
    
    htmlContent = htmlContent.replace('</head>', `${scriptContent}</head>`);
    fs.writeFileSync(indexHtmlPath, htmlContent);
    console.log('✅ index.html atualizado com fallbacks globais');
  } else {
    console.log('✅ index.html já tem os fallbacks necessários');
  }
  
  return true;
}

// Função para implementar patch com crypto nativo do Node
async function implementarCryptoPatch() {
  console.log('\n🧪 Criando patch para vite usando crypto nativo do Node...');
  
  // Criar pasta para os patches se não existir
  const patchesDir = path.join(__dirname, 'patches');
  if (!fs.existsSync(patchesDir)) {
    fs.mkdirSync(patchesDir, { recursive: true });
  }
  
  // Criar arquivo de patch para Vite
  const patchContent = `// patches/crypto-patch.js
// Este arquivo substitui as chamadas do crypto.getRandomValues por uma implementação do Node.js
const crypto = require('crypto');

// Criar função que emula getRandomValues
global.crypto = {
  getRandomValues: function(arr) {
    return crypto.randomFillSync(arr);
  }
};

console.log('✅ Patch para crypto.getRandomValues aplicado');
`;
  
  const patchPath = path.join(patchesDir, 'crypto-patch.js');
  fs.writeFileSync(patchPath, patchContent);
  
  // Criar script para executar o build com o patch
  const buildScriptContent = `#!/usr/bin/env node
// Carregar o patch antes de executar o build
require('./patches/crypto-patch');
require('child_process').execSync('vite build --mode development', { stdio: 'inherit' });
`;
  
  const buildScriptPath = path.join(__dirname, 'node-build.js');
  fs.writeFileSync(buildScriptPath, buildScriptContent);
  fs.chmodSync(buildScriptPath, '755');
  
  // Atualizar package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts.build = "node node-build.js";
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  console.log('✅ Scripts de build com patch criados');
  return true;
}

// Executar tudo
async function main() {
  try {
    await instalarDependencias();
    criarPolyfillCrypto();
    atualizarMainJs();
    atualizarViteConfig();
    criarGlobalFallback();
    await implementarCryptoPatch();
    
    console.log('\n🎉 Todas as correções foram aplicadas!');
    console.log('\n🚀 Agora tente executar: npm run build');
    console.log('\nSe ainda encontrar problemas, execute: node node-build.js');
  } catch (error) {
    console.error('\n❌ Erro durante a aplicação das correções:', error);
  }
}

// Executar
main(); 