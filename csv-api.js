/**
 * API para servir arquivos CSV
 * 
 * Este arquivo implementa uma API Express que fornece acesso a arquivos CSV
 * através de endpoints HTTP, permitindo que aplicações web acessem os dados.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Papa = require('papaparse');
const { promisify } = require('util');

// Promisificar funções do fs
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const app = express();
const PORT = process.env.PORT || 3001;

// Habilitar CORS
app.use(cors());

// Parsear JSON no body
app.use(express.json());

// Diretórios onde os arquivos CSV podem estar
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
 * Encontra o primeiro diretório existente
 */
async function findExistingDirectory() {
  for (const dir of DIRECTORIES) {
    if (await fileExists(dir)) {
      console.log(`✅ Diretório encontrado: ${dir}`);
      return dir;
    }
  }
  console.error('❌ Nenhum diretório de dados encontrado');
  return null;
}

/**
 * Encontra o arquivo CSV mais recente
 */
async function findLatestCSV(baseDir) {
  if (!baseDir) return null;
  
  try {
    let files = await readdir(baseDir);
    let csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      // Verificar no subdiretório export se existir
      const exportDir = path.join(baseDir, 'export');
      if (await fileExists(exportDir)) {
        files = await readdir(exportDir);
        csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'))
          .map(file => path.join('export', file));
      }
    }
    
    if (csvFiles.length === 0) {
      return null;
    }
    
    // Ordenar por data de modificação (mais recente primeiro)
    const fileStats = await Promise.all(
      csvFiles.map(async (file) => {
        const filePath = path.join(baseDir, file);
        const fileStat = await stat(filePath);
        return { file, mtime: fileStat.mtime };
      })
    );
    
    fileStats.sort((a, b) => b.mtime - a.mtime);
    return path.join(baseDir, fileStats[0].file);
  } catch (err) {
    console.error(`❌ Erro ao buscar arquivos CSV: ${err.message}`);
    return null;
  }
}

// Endpoint para obter o arquivo CSV mais recente
app.get('/api/csv/latest', async (req, res) => {
  try {
    const baseDir = await findExistingDirectory();
    if (!baseDir) {
      return res.status(404).json({ error: 'Nenhum diretório de dados encontrado' });
    }
    
    const latestCSV = await findLatestCSV(baseDir);
    if (!latestCSV) {
      return res.status(404).json({ error: 'Nenhum arquivo CSV encontrado' });
    }
    
    console.log(`📊 Enviando CSV mais recente: ${latestCSV}`);
    
    const csvContent = await readFile(latestCSV, 'utf8');
    
    // Se o cliente solicitar JSON
    if (req.query.format === 'json') {
      const jsonData = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      return res.json(jsonData.data);
    }
    
    // Caso contrário, enviar o CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(latestCSV)}"`);
    return res.send(csvContent);
  } catch (err) {
    console.error(`❌ Erro ao processar requisição: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obter um arquivo CSV específico por nome
app.get('/api/csv/file/:filename', async (req, res) => {
  try {
    const baseDir = await findExistingDirectory();
    if (!baseDir) {
      return res.status(404).json({ error: 'Nenhum diretório de dados encontrado' });
    }
    
    const filename = req.params.filename;
    let extensions = ['.csv', '.json', ''];
    let filePath = null;
    
    // Tentar encontrar o arquivo com várias extensões
    for (const ext of extensions) {
      const testPath = path.join(baseDir, `${filename}${ext}`);
      if (await fileExists(testPath)) {
        filePath = testPath;
        break;
      }
      
      // Verificar no subdiretório export se existir
      const exportPath = path.join(baseDir, 'export', `${filename}${ext}`);
      if (await fileExists(exportPath)) {
        filePath = exportPath;
        break;
      }
    }
    
    if (!filePath) {
      return res.status(404).json({ error: `Arquivo ${filename} não encontrado` });
    }
    
    console.log(`📊 Enviando arquivo específico: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Se é JSON ou o cliente solicitou JSON
    if (fileExt === '.json' || req.query.format === 'json') {
      let jsonData;
      
      if (fileExt === '.json') {
        // Se já é um arquivo JSON
        jsonData = JSON.parse(fileContent);
      } else {
        // Converter CSV para JSON
        jsonData = Papa.parse(fileContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        }).data;
      }
      
      return res.json(jsonData);
    }
    
    // Caso contrário, enviar como CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    return res.send(fileContent);
  } catch (err) {
    console.error(`❌ Erro ao processar requisição: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para listar todos os arquivos CSV disponíveis
app.get('/api/csv/list', async (req, res) => {
  try {
    const baseDir = await findExistingDirectory();
    if (!baseDir) {
      return res.status(404).json({ error: 'Nenhum diretório de dados encontrado' });
    }
    
    const files = await readdir(baseDir);
    let csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv') || file.toLowerCase().endsWith('.json'));
    
    // Verificar no subdiretório export se existir
    const exportDir = path.join(baseDir, 'export');
    if (await fileExists(exportDir)) {
      const exportFiles = await readdir(exportDir);
      const exportCsvFiles = exportFiles
        .filter(file => file.toLowerCase().endsWith('.csv') || file.toLowerCase().endsWith('.json'))
        .map(file => path.join('export', file));
      
      csvFiles = csvFiles.concat(exportCsvFiles);
    }
    
    // Obter informações sobre os arquivos
    const fileDetails = await Promise.all(
      csvFiles.map(async (file) => {
        const filePath = path.join(baseDir, file);
        const fileStat = await stat(filePath);
        return {
          name: file,
          path: filePath,
          size: fileStat.size,
          modified: fileStat.mtime,
          type: path.extname(file).substring(1).toUpperCase()
        };
      })
    );
    
    // Ordenar por data de modificação (mais recente primeiro)
    fileDetails.sort((a, b) => b.modified - a.modified);
    
    return res.json(fileDetails);
  } catch (err) {
    console.error(`❌ Erro ao listar arquivos: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor CSV API rodando na porta ${PORT}`);
  console.log(`Endpoints disponíveis:`);
  console.log(`- GET /api/csv/latest`);
  console.log(`- GET /api/csv/file/:filename`);
  console.log(`- GET /api/csv/list`);
}); 