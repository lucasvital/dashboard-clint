import Papa from 'papaparse'

/**
 * Função para carregar e processar um arquivo CSV
 * @param {String} filePath - Caminho para o arquivo CSV 
 * @returns {Promise} Promise com os dados processados
 */
export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    // Adicionar configurações detalhadas para melhor parsing
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ',',  // Definir explicitamente o delimitador
      comments: '#',   // Ignorar linhas começando com #
      encoding: 'UTF-8', // Garantir codificação correta
      error: (error) => {
        console.error("❌ Erro durante o parsing do CSV:", error);
        reject(error);
      },
      complete: (results) => {
        console.log(`📊 CSV parseado com ${results.data.length} registros`);
        if (results.errors && results.errors.length > 0) {
          console.warn(`⚠️ Avisos durante o parsing:`, results.errors);
        }
        if (results.meta) {
          console.log(`ℹ️ Metadados do CSV:`, {
            delimitador: results.meta.delimiter,
            linhasProcessadas: results.meta.cursor,
            colunas: results.meta.fields
          });
        }
        resolve(results.data);
      }
    });
  });
}

/**
 * Função para examinar um arquivo CSV diretamente
 * @param {String} filePath - Caminho para o arquivo CSV 
 * @returns {Promise} Promise com informações sobre o arquivo
 */
export const examineCSV = (filePath) => {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(text => {
      const linhas = text.split('\n');
      const totalLinhas = linhas.length;
      const primeiraLinha = linhas[0];
      const colunas = primeiraLinha.split(',');
      
      // Verificar delimitador alternativo
      const temTab = primeiraLinha.includes('\t');
      const temPontoVirgula = primeiraLinha.includes(';');
      
      const deteccaoDelimitador = {
        virgula: primeiraLinha.split(',').length,
        pontoEVirgula: primeiraLinha.split(';').length,
        tab: primeiraLinha.split('\t').length
      };
      
      // Determinar o provável delimitador real
      const delimitadores = Object.entries(deteccaoDelimitador);
      delimitadores.sort((a, b) => b[1] - a[1]);
      const provávelDelimitador = delimitadores[0][0];
      
      return {
        totalLinhas,
        colunas: colunas.length,
        primeiraLinha,
        ultimaLinha: linhas[totalLinhas - 1],
        tamanhoArquivo: text.length,
        temTab,
        temPontoVirgula,
        provávelDelimitador,
        deteccaoDelimitador
      };
    });
}

/**
 * Extrair grupos únicos do CSV
 * @param {Array} data - Dados do CSV processado
 * @returns {Array} Array de grupos únicos
 */
export const extractGroups = (data) => {
  const groups = new Set()
  
  data.forEach(item => {
    if (item.grupo_origem) {
      groups.add(item.grupo_origem)
    }
  })
  
  return Array.from(groups).sort()
}

/**
 * Extrair origens por grupo
 * @param {Array} data - Dados do CSV processado
 * @param {String} group - Nome do grupo para filtrar
 * @returns {Array} Array de origens únicas para o grupo
 */
export const extractOriginsByGroup = (data, group) => {
  const origins = new Set()
  
  data
    .filter(item => item.grupo_origem === group)
    .forEach(item => {
      if (item.nome_origem) {
        origins.add(item.nome_origem)
      }
    })
  
  return Array.from(origins).sort()
}

/**
 * Filtrar dados por grupo e origem
 * @param {Array} data - Dados do CSV processado
 * @param {String} group - Nome do grupo (opcional)
 * @param {String} origin - Nome da origem (opcional)
 * @returns {Array} Dados filtrados
 */
export const filterData = (data, group = null, origin = null) => {
  let filtered = [...data]
  
  if (group) {
    filtered = filtered.filter(item => item.grupo_origem === group)
  }
  
  if (origin) {
    filtered = filtered.filter(item => item.nome_origem === origin)
  }
  
  return filtered
}

/**
 * Calcular estatísticas básicas dos dados
 * @param {Array} data - Dados filtrados
 * @returns {Object} Objeto com as estatísticas
 */
export const calculateStats = (data) => {
  return {
    total: data.length,
    byStatus: {
      aberto: data.filter(item => item.status === 'Aberto').length,
      ganho: data.filter(item => item.status === 'Ganho' || item.status === 'WON').length,
      perdido: data.filter(item => item.status === 'Perdido' || item.status === 'LOST').length
    }
  }
} 