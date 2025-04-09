import Papa from 'papaparse'

/**
 * Função para carregar e processar um arquivo CSV
 * @param {String} filePath - Caminho para o arquivo CSV 
 * @returns {Promise} Promise com os dados processados
 */
export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
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