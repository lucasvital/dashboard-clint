/**
 * Script para diagnosticar problemas com os arquivos CSV na VPS
 * Execute com: node debug-csv.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para testar diferentes localizações de arquivo
const localizarArquivosCSV = () => {
  console.log('🔍 Buscando arquivos CSV em diferentes localizações...');
  
  // Data atual
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  
  // Nomes de arquivo possíveis
  const fileNames = [
    `[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}.csv`,
    // Testar também datas anteriores
    `[alberto_at_shortmidia.com.br]_Dados_Gerais_${day}-${month}-${Number(year)-1}.csv`,
  ];
  
  // Caminhos possíveis
  const basePaths = [
    '/www/wwwroot/Clintr/resultados_api',
    './resultados_api',
    '../resultados_api',
    '/resultados_api',
    path.resolve('./resultados_api'),
    process.cwd() + '/resultados_api',
  ];
  
  // Buscar arquivos recursivamente no diretório atual
  try {
    console.log('📂 Buscando arquivos CSV recursivamente...');
    const findCmd = 'find . -name "*.csv" -type f | sort';
    const findResults = execSync(findCmd).toString().trim();
    
    if (findResults) {
      console.log('🟢 Arquivos CSV encontrados com find:');
      console.log(findResults);
      console.log('----------------------------');
    } else {
      console.log('🔴 Nenhum arquivo CSV encontrado com find.');
    }
  } catch (error) {
    console.log('❌ Erro ao executar find:', error.message);
  }
  
  // Tentar localizar cada arquivo
  const arquivosEncontrados = [];
  
  for (const basePath of basePaths) {
    for (const fileName of fileNames) {
      const filePath = path.join(basePath, fileName);
      
      try {
        if (fs.existsSync(filePath)) {
          console.log(`🟢 Arquivo encontrado: ${filePath}`);
          
          // Verificar tipo MIME
          try {
            const fileCmd = `file --mime-type "${filePath}"`;
            const mimeType = execSync(fileCmd).toString().trim();
            console.log(`   📋 Tipo MIME: ${mimeType}`);
          } catch (error) {
            console.log(`   ❌ Não foi possível determinar o tipo MIME: ${error.message}`);
          }
          
          // Verificar permissões
          try {
            const lsCmd = `ls -la "${filePath}"`;
            const fileInfo = execSync(lsCmd).toString().trim();
            console.log(`   📋 Permissões: ${fileInfo}`);
          } catch (error) {
            console.log(`   ❌ Não foi possível verificar permissões: ${error.message}`);
          }
          
          // Verificar conteúdo
          try {
            const fileStats = fs.statSync(filePath);
            console.log(`   📊 Tamanho: ${fileStats.size} bytes`);
            
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n');
            console.log(`   📊 Linhas: ${lines.length}`);
            
            // Verificar se é realmente um CSV
            const firstLine = lines[0] || '';
            const isHTML = firstLine.toLowerCase().includes('<html') || 
                           firstLine.toLowerCase().includes('<!doctype');
            
            if (isHTML) {
              console.log(`   🔴 O arquivo parece conter HTML, não CSV!`);
              console.log(`   🔍 Primeiras linhas:`);
              console.log(lines.slice(0, 5).join('\n'));
            } else {
              const delimiters = {
                comma: firstLine.split(',').length - 1,
                semicolon: firstLine.split(';').length - 1,
                tab: firstLine.split('\t').length - 1
              };
              
              let probableDelimiter = 'unknown';
              let maxCount = 0;
              
              for (const [delimiter, count] of Object.entries(delimiters)) {
                if (count > maxCount) {
                  maxCount = count;
                  probableDelimiter = delimiter;
                }
              }
              
              console.log(`   🟢 Parece ser um CSV válido. Provável delimitador: ${probableDelimiter}`);
              console.log(`   🔍 Primeiras linhas:`);
              console.log(lines.slice(0, 3).join('\n'));
            }
          } catch (error) {
            console.log(`   ❌ Erro ao ler conteúdo: ${error.message}`);
          }
          
          arquivosEncontrados.push(filePath);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${filePath}: ${error.message}`);
      }
    }
  }
  
  if (arquivosEncontrados.length === 0) {
    console.log('🔴 Nenhum arquivo CSV encontrado em nenhuma das localizações testadas.');
    console.log('💡 Sugestões:');
    console.log('1. Verifique se os arquivos foram realmente gerados');
    console.log('2. Verifique o caminho correto onde os arquivos são salvos');
    console.log('3. Verifique as permissões dos diretórios e arquivos');
  }
  
  return arquivosEncontrados;
};

// Verificar configuração do servidor web
const verificarServidorWeb = () => {
  console.log('\n🌐 Verificando configuração do servidor web...');
  
  // Tentar detectar servidor web
  let servidor = 'desconhecido';
  
  try {
    const processOutput = execSync('ps aux | grep -E "nginx|apache|httpd" | grep -v grep').toString();
    
    if (processOutput.includes('nginx')) {
      servidor = 'nginx';
    } else if (processOutput.includes('apache') || processOutput.includes('httpd')) {
      servidor = 'apache';
    }
    
    console.log(`🟢 Servidor web detectado: ${servidor}`);
  } catch (error) {
    console.log('🔶 Não foi possível detectar o servidor web automaticamente');
  }
  
  // Verificar configurações específicas
  if (servidor === 'nginx') {
    try {
      console.log('📋 Verificando configuração do Nginx para arquivos .csv:');
      const nginxConfig = execSync('grep -r "text/csv\\|csv" /etc/nginx/').toString();
      console.log(nginxConfig || '🔶 Nenhuma configuração específica para CSV encontrada no Nginx');
      
      console.log('💡 Se os arquivos CSV estão sendo servidos como HTML, adicione a seguinte configuração ao nginx:');
      console.log(`
server {
    # ... outras configurações ...
    
    location ~ \\.csv$ {
        add_header Content-Type "text/csv";
        add_header Content-Disposition "attachment; filename=$basename";
    }
}
`);
    } catch (error) {
      console.log('❌ Erro ao verificar configuração do Nginx:', error.message);
    }
  } else if (servidor === 'apache') {
    try {
      console.log('📋 Verificando configuração do Apache para arquivos .csv:');
      const apacheConfig = execSync('grep -r "text/csv\\|csv" /etc/apache2/').toString();
      console.log(apacheConfig || '🔶 Nenhuma configuração específica para CSV encontrada no Apache');
      
      console.log('💡 Se os arquivos CSV estão sendo servidos como HTML, adicione a seguinte configuração ao .htaccess:');
      console.log(`
<Files *.csv>
    ForceType text/csv
    Header set Content-Disposition "attachment; filename=%{basename}s"
</Files>
`);
    } catch (error) {
      console.log('❌ Erro ao verificar configuração do Apache:', error.message);
    }
  }
};

// Executar diagnóstico
console.log('🔧 Iniciando diagnóstico de problemas com arquivos CSV...');
console.log('Sistema operacional:', process.platform);
console.log('Diretório atual:', process.cwd());

const arquivosEncontrados = localizarArquivosCSV();
verificarServidorWeb();

console.log('\n📝 Possíveis soluções:');
console.log('1. Verifique se o servidor web está configurado para servir arquivos .csv corretamente');
console.log('2. Tente adicionar um arquivo .htaccess para forçar o tipo MIME correto para arquivos CSV');
console.log('3. Tente acessar o arquivo diretamente usando um caminho absoluto');
console.log('4. Verifique se o arquivo foi realmente salvo como CSV e não como HTML');
console.log('5. Adicione um link direto de download para o arquivo CSV na interface do usuário');

console.log('\n✅ Diagnóstico concluído.'); 