/**
 * Script para converter arquivos CSV para JSON
 * 
 * Execute com: node csv-to-json.js
 * 
 * Este script procura por arquivos CSV na pasta resultados_api e os converte para JSON
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Papa = require('papaparse');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Diretório onde os arquivos CSV e JSON estão
const DIRECTORIES = [
  './resultados_api',
  './resultados_api/export',
  '/www/wwwroot/Clintr/resultados_api',
  '/resultados_api'
];

/**
 * Verifica se um arquivo existe
 */
const fileExists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Converte um arquivo CSV para JSON
 */
async function convertCSVtoJSON(csvFilePath) {
  console.log(`🔄 Convertendo: ${csvFilePath}`);
  
  try {
    // Verificar se o arquivo existe
    if (!(await fileExists(csvFilePath))) {
      console.error(`❌ Arquivo não encontrado: ${csvFilePath}`);
      return null;
    }
    
    // Determinar o caminho do arquivo JSON
    const jsonFilePath = csvFilePath.replace(/\.csv$/i, '.json');
    
    // Verificar se o JSON já existe e é mais recente que o CSV
    const csvExists = await fileExists(csvFilePath);
    const jsonExists = await fileExists(jsonFilePath);
    
    if (csvExists && jsonExists) {
      const csvStats = await stat(csvFilePath);
      const jsonStats = await stat(jsonFilePath);
      
      // Se o JSON já é mais recente que o CSV, não fazer nada
      if (jsonStats.mtime > csvStats.mtime) {
        console.log(`✅ JSON já está atualizado: ${jsonFilePath}`);
        return jsonFilePath;
      }
    }
    
    // Ler o arquivo CSV
    const csvContent = await readFile(csvFilePath, 'utf8');
    
    // Parsear o CSV para um array de objetos
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Verificar se há erros
            if (results.errors && results.errors.length > 0) {
              // Mostrar apenas os primeiros 5 erros para não poluir o console
              console.warn(`⚠️ ${results.errors.length} erros ao parsear o CSV. Primeiros 5 erros:`);
              results.errors.slice(0, 5).forEach(error => {
                console.warn(`   - ${error.message} (linha ${error.row})`);
              });
            }
            
            // Salvar como JSON
            const jsonContent = JSON.stringify(results.data, null, 2);
            await writeFile(jsonFilePath, jsonContent, 'utf8');
            console.log(`✅ JSON criado: ${jsonFilePath} (${results.data.length} registros)`);
            resolve(jsonFilePath);
          } catch (err) {
            console.error(`❌ Erro ao processar CSV: ${err.message}`);
            reject(err);
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao parsear CSV: ${error.message}`);
          reject(error);
        }
      });
    });
  } catch (err) {
    console.error(`❌ Erro ao processar ${csvFilePath}: ${err.message}`);
    return null;
  }
}

/**
 * Processa um diretório e converte todos os arquivos CSV para JSON
 */
async function processDirectory(directory) {
  try {
    // Verificar se o diretório existe
    if (!(await fileExists(directory))) {
      console.log(`🔶 Diretório não encontrado: ${directory}`);
      return [];
    }
    
    console.log(`🔎 Verificando diretório: ${directory}`);
    
    // Listar todos os arquivos no diretório
    const files = await readdir(directory);
    
    // Filtrar apenas os arquivos CSV
    const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      console.log(`ℹ️ Nenhum arquivo CSV encontrado em: ${directory}`);
      return [];
    }
    
    console.log(`🔍 Encontrados ${csvFiles.length} arquivos CSV em: ${directory}`);
    
    // Converter cada arquivo CSV para JSON
    const results = [];
    
    for (const csvFile of csvFiles) {
      const csvFilePath = path.join(directory, csvFile);
      const jsonFilePath = await convertCSVtoJSON(csvFilePath);
      
      if (jsonFilePath) {
        results.push(jsonFilePath);
      }
    }
    
    return results;
  } catch (err) {
    console.error(`❌ Erro ao processar diretório ${directory}: ${err.message}`);
    return [];
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando conversão de CSV para JSON...');
  
  const startTime = Date.now();
  const allResults = [];
  
  // Processar cada diretório configurado
  for (const directory of DIRECTORIES) {
    const results = await processDirectory(directory);
    allResults.push(...results);
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('');
  console.log(`✅ Processamento concluído em ${duration.toFixed(2)} segundos.`);
  console.log(`📊 Total de arquivos convertidos: ${allResults.length}`);
  
  if (allResults.length > 0) {
    console.log('📄 Arquivos JSON criados:');
    allResults.forEach(file => console.log(`   - ${file}`));
  }
}

// Executar o script
main().catch(err => {
  console.error(`❌ Erro fatal: ${err.message}`);
  process.exit(1);
}); 