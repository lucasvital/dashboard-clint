#!/bin/bash
# Script shell para corrigir problemas de build no Debian
# Este script não depende de módulos Node adicionais

echo "🔧 Iniciando correções para build no Debian..."

# Instalar dependências necessárias
echo "📦 Instalando dependências..."
npm install --save crypto-browserify
npm install --save-dev cross-env stream-browserify assert buffer process util

# Verificar se o arquivo .env existe e corrigir NODE_ENV
if [ -f .env ]; then
  echo "📝 Verificando arquivo .env..."
  # Substituir NODE_ENV=production por NODE_ENV=development
  sed -i 's/NODE_ENV=production/NODE_ENV=development/g' .env
  echo "✅ Arquivo .env verificado"
else
  echo "⚠️ Arquivo .env não encontrado."
fi

# Atualizar vite.config.js
if [ -f vite.config.js ]; then
  echo "📝 Criando backup do vite.config.js..."
  cp vite.config.js vite.config.js.bak
  
  echo "📝 Atualizando vite.config.js..."
  cat > vite.config.js << EOL
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
    global: 'globalThis'
  },
  build: {
    sourcemap: true,
    minify: false
  }
})
EOL
  echo "✅ vite.config.js atualizado"
else
  echo "⚠️ Arquivo vite.config.js não encontrado."
fi

# Criar script de build direto
echo "📝 Criando script de build direto..."
cat > build.sh << EOL
#!/bin/bash
# Script para build sem depender de cross-env
export NODE_ENV=development
npx vite build --mode development
EOL

chmod +x build.sh
echo "✅ Script build.sh criado"

# Criar patch para crypto
echo "📝 Criando patch para crypto..."
mkdir -p patches

cat > patches/crypto-patch.js << EOL
// patches/crypto-patch.js
// Este arquivo substitui as chamadas do crypto.getRandomValues por uma implementação do Node.js
const crypto = require('crypto');

// Criar função que emula getRandomValues
global.crypto = {
  getRandomValues: function(arr) {
    return crypto.randomFillSync(arr);
  }
};

console.log('✅ Patch para crypto.getRandomValues aplicado');
EOL

cat > node-build.js << EOL
#!/usr/bin/env node
// Carregar o patch antes de executar o build
require('./patches/crypto-patch');
require('child_process').execSync('npx vite build --mode development', { stdio: 'inherit' });
EOL

chmod +x node-build.js
echo "✅ Script node-build.js criado"

echo -e "\n🎉 Todas as correções foram aplicadas!"
echo -e "\n🚀 Agora você pode executar o build usando:"
echo "   ./build.sh"
echo "   ou"
echo "   node node-build.js" 