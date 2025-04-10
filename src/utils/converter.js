/**
 * Utilidades para conversão entre formatos CSV e JSON
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

/**
 * Converte um arquivo CSV para JSON e salva no mesmo diretório
 * @param {string} csvFilePath - Caminho completo para o arquivo CSV
 * @returns {Promise<string>} Caminho do arquivo JSON criado
 */
export const convertCSVtoJSON = (csvFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(csvFilePath)) {
        return reject(new Error(`Arquivo CSV não encontrado: ${csvFilePath}`));
      }
      
      // Ler o conteúdo do arquivo CSV
      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
      
      // Parsear o CSV para JSON
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors && results.errors.length > 0) {
              console.warn('⚠️ Avisos ao converter CSV para JSON:', results.errors);
            }
            
            // Criar o caminho para o arquivo JSON
            const jsonFilePath = csvFilePath.replace(/\.csv$/i, '.json');
            
            // Salvar o JSON
            fs.writeFileSync(jsonFilePath, JSON.stringify(results.data, null, 2), 'utf8');
            console.log(`✅ Arquivo JSON criado: ${jsonFilePath}`);
            
            resolve(jsonFilePath);
          } catch (err) {
            reject(new Error(`Erro ao salvar arquivo JSON: ${err.message}`));
          }
        },
        error: (error) => {
          reject(new Error(`Erro ao parsear CSV: ${error.message}`));
        }
      });
    } catch (err) {
      reject(new Error(`Erro ao processar arquivo CSV: ${err.message}`));
    }
  });
};

/**
 * Converte um arquivo JSON para CSV e salva no mesmo diretório
 * @param {string} jsonFilePath - Caminho completo para o arquivo JSON
 * @returns {Promise<string>} Caminho do arquivo CSV criado
 */
export const convertJSONtoCSV = (jsonFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar se o arquivo existe
      if (!fs.existsSync(jsonFilePath)) {
        return reject(new Error(`Arquivo JSON não encontrado: ${jsonFilePath}`));
      }
      
      // Ler o conteúdo do arquivo JSON
      const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
      
      try {
        // Parsear o JSON
        const jsonData = JSON.parse(jsonContent);
        
        if (!Array.isArray(jsonData)) {
          return reject(new Error('O arquivo JSON não contém um array de objetos'));
        }
        
        // Converter para CSV
        const csvContent = Papa.unparse(jsonData);
        
        // Criar o caminho para o arquivo CSV
        const csvFilePath = jsonFilePath.replace(/\.json$/i, '.csv');
        
        // Salvar o CSV
        fs.writeFileSync(csvFilePath, csvContent, 'utf8');
        console.log(`✅ Arquivo CSV criado: ${csvFilePath}`);
        
        resolve(csvFilePath);
      } catch (err) {
        reject(new Error(`Erro ao processar JSON: ${err.message}`));
      }
    } catch (err) {
      reject(new Error(`Erro ao processar arquivo JSON: ${err.message}`));
    }
  });
};

/**
 * Processa um diretório e converte todos os arquivos CSV para JSON
 * @param {string} directoryPath - Caminho do diretório a ser processado
 * @returns {Promise<Array>} Lista dos arquivos JSON criados
 */
export const convertDirectoryCSVtoJSON = async (directoryPath) => {
  try {
    // Verificar se o diretório existe
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`Diretório não encontrado: ${directoryPath}`);
    }
    
    // Listar todos os arquivos do diretório
    const files = fs.readdirSync(directoryPath);
    
    // Filtrar apenas arquivos CSV
    const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    console.log(`🔍 Encontrados ${csvFiles.length} arquivos CSV em ${directoryPath}`);
    
    // Converter cada arquivo
    const jsonFiles = [];
    
    for (const csvFile of csvFiles) {
      const csvFilePath = path.join(directoryPath, csvFile);
      try {
        const jsonFilePath = await convertCSVtoJSON(csvFilePath);
        jsonFiles.push(jsonFilePath);
      } catch (err) {
        console.error(`❌ Erro ao converter ${csvFilePath}: ${err.message}`);
      }
    }
    
    console.log(`✅ Convertidos ${jsonFiles.length} de ${csvFiles.length} arquivos CSV para JSON`);
    
    return jsonFiles;
  } catch (err) {
    console.error(`❌ Erro ao processar diretório: ${err.message}`);
    return [];
  }
}; 