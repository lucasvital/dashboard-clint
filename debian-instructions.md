# Correção para erro de build em servidor Debian

## Problema

Em servidores Debian, o build do Vite apresenta o seguinte erro:

```
TypeError: crypto$2.getRandomValues is not a function
    at resolveConfig (file:///www/wwwroot/Clintr/node_modules/vite/dist/node/chunks/dep-Dyl6b77n.js:66592:16)
```

Isto ocorre porque o Vite tenta usar a função `crypto.getRandomValues()` durante o build, mas em alguns ambientes Linux/Debian essa função não está disponível no Node.js da mesma forma que estaria em um navegador.

## Solução Rápida

Para resolver este problema, siga as instruções abaixo:

### 1. Baixe o script de correção

Baixe o arquivo `fix-debian.js` para seu servidor:

```bash
wget https://raw.githubusercontent.com/lucasvital/dashboard-clint/master/fix-debian.js
```

### 2. Execute o script de correção

```bash
node fix-debian.js
```

Este script vai:
- Instalar as dependências necessárias
- Criar um polyfill para crypto.getRandomValues
- Atualizar os arquivos de configuração
- Modificar o processo de build

### 3. Execute o build

```bash
npm run build
```

Se ainda encontrar problemas, use o script alternativo:

```bash
node node-build.js
```

## Solução Manual (se o script não funcionar)

Se o script automático não resolver o problema, siga estas etapas manualmente:

### 1. Instale as dependências necessárias

```bash
npm install --save-dev crypto-browserify stream-browserify assert buffer process util
```

### 2. Crie uma pasta para patches

```bash
mkdir -p patches
```

### 3. Crie um arquivo de patch para crypto

Crie o arquivo `patches/crypto-patch.js` com o seguinte conteúdo:

```javascript
// Este arquivo substitui as chamadas do crypto.getRandomValues por uma implementação do Node.js
const crypto = require('crypto');

// Criar função que emula getRandomValues
global.crypto = {
  getRandomValues: function(arr) {
    return crypto.randomFillSync(arr);
  }
};

console.log('✅ Patch para crypto.getRandomValues aplicado');
```

### 4. Crie um script de build alternativo

Crie um arquivo `node-build.js` na raiz do projeto:

```javascript
#!/usr/bin/env node
// Carregar o patch antes de executar o build
require('./patches/crypto-patch');
require('child_process').execSync('vite build --mode development', { stdio: 'inherit' });
```

### 5. Torne o script executável

```bash
chmod +x node-build.js
```

### 6. Execute o build usando o script alternativo

```bash
node node-build.js
```

## Observações Importantes

1. **Não usar NODE_ENV=production** - O Vite não suporta NODE_ENV=production no arquivo .env. Sempre use development.

2. **Versões do Node.js** - Este problema é mais comum em versões mais antigas do Node.js. Se possível, atualize para o Node.js 16 ou superior.

3. **Reinicialização do PM2** - Após um build bem-sucedido, reinicie o serviço:
   ```bash
   pm2 restart clint-dashboard
   ``` 