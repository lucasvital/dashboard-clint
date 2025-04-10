import { reactive, readonly } from 'vue'
import Papa from 'papaparse'
import { formatDate, calculateDateRange } from '../utils/date-utils'

// Estado inicial da store
const state = reactive({
  // Dados originais carregados do CSV
  rawData: [],
  
  // Filtros ativos
  filters: {
    searchText: '',
    user: null,
    status: null,
    tags: [],
    dateRange: {
      start: null,
      end: null
    }
  },
  
  // Estado para grupos e origens selecionados
  selectedGroup: null,
  selectedOrigin: null
})

/**
 * Analisa e formata os dados do CSV
 * @param {Array} data - Dados brutos do CSV
 * @returns {Array} Dados formatados
 */
function parseCSVData(data) {
  return data.map(item => {
    const parsedItem = { ...item }
    
    // Converte strings de data para objetos Date de forma simplificada
    // Os CSVs já vêm formatados corretamente, então apenas criamos o objeto Date
    if (parsedItem.created_at) {
      try {
        // Formato esperado: dd/mm/aaaa
        const [day, month, year] = parsedItem.created_at.split(' ')[0].split('/').map(num => parseInt(num, 10));
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          parsedItem.dataObj = new Date(year, month - 1, day);
        } else {
          // Fallback para formato padrão
          parsedItem.dataObj = new Date(parsedItem.created_at);
        }
      } catch (error) {
        // Silenciosamente falha e continua
      }
    }
    else if (parsedItem.data) {
      try {
        const [day, month, year] = parsedItem.data.split('/').map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);
        if (!isNaN(date)) {
          parsedItem.dataObj = date;
        }
      } catch (error) {
        // Silenciosamente falha e continua
      }
    }
    
    // Normaliza tags (converte string para array)
    if (parsedItem.tags && typeof parsedItem.tags === 'string') {
      parsedItem.tags = parsedItem.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    } else {
      parsedItem.tags = []
    }
    
    return parsedItem
  })
}

// Métodos públicos da store
const store = {
  /**
   * Retorna estado somente leitura
   */
  getState() {
    return readonly(state)
  },
  
  /**
   * Retorna dados brutos
   */
  getRawData() {
    return state.rawData
  },
  
  /**
   * Retorna dados filtrados com base nos filtros atuais
   */
  getFilteredData() {
    return state.rawData.filter(item => {
      // Filtro de texto de busca (verifica em múltiplos campos)
      if (state.filters.searchText.trim()) {
        const searchTextLower = state.filters.searchText.toLowerCase()
        const searchFields = ['name', 'email', 'phone', 'nome_origem', 'grupo_origem', 'status']
        
        const matchesSearch = searchFields.some(field => {
          return item[field] && item[field].toString().toLowerCase().includes(searchTextLower)
        })
        
        if (!matchesSearch) return false
      }
      
      // Filtro de usuário
      if (state.filters.user && item.user_name !== state.filters.user) {
        return false
      }
      
      // Filtro de status
      if (state.filters.status && item.status !== state.filters.status) {
        return false
      }
      
      // Filtro de tags
      if (state.filters.tags.length > 0) {
        const hasMatchingTag = state.filters.tags.some(tag => 
          item.tags && item.tags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }
      
      // Filtro de período de data
      if (state.filters.dateRange.start && state.filters.dateRange.end) {
        if (!item.dataObj) return false
        
        const startTime = state.filters.dateRange.start.getTime();
        const endTime = state.filters.dateRange.end.getTime();
        const itemTime = item.dataObj.getTime();
        
        if (itemTime < startTime || itemTime > endTime) {
          return false;
        }
      }
      
      // Filtro de grupo
      if (state.selectedGroup && item.grupo_origem !== state.selectedGroup) {
        return false
      }
      
      // Filtro de origem - aplicado apenas se houver um valor selecionado
      if (state.selectedOrigin && item.nome_origem !== state.selectedOrigin) {
        return false
      }
      
      return true
    })
  },
  
  /**
   * Carrega dados de CSV a partir de uma URL
   * @param {String} url - URL do arquivo CSV para carregar
   * @returns {Promise} Promessa resolvida quando dados são carregados
   */
  loadCSVData(url) {
    return new Promise((resolve, reject) => {
      // Verifica se a URL é válida
      if (!url) {
        const error = new Error('URL do CSV não fornecida')
        reject(error)
        return
      }
      
      // Extrair o nome do arquivo da URL para exibição
      const fileName = url.split('/').pop();
      console.log(`🔄 Tentando carregar o arquivo CSV: ${fileName}`);
      
      // Primeiro vamos examinar o arquivo para detectar possíveis problemas
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro ao acessar arquivo (${response.status}): ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          const linhas = text.split('\n');
          const totalLinhas = linhas.length;
          
          if (totalLinhas <= 1) {
            throw new Error('Arquivo CSV vazio ou com apenas cabeçalho');
          }
          
          const primeiraLinha = linhas[0];
          
          // Detectar o delimitador mais provável
          const delimitadores = {
            virgula: primeiraLinha.split(',').length,
            pontoEVirgula: primeiraLinha.split(';').length,
            tab: primeiraLinha.split('\t').length
          };
          
          let maiorContagem = 0;
          let melhorDelimitador = ','; // padrão
          
          for (const [delim, contagem] of Object.entries(delimitadores)) {
            if (contagem > maiorContagem) {
              maiorContagem = contagem;
              if (delim === 'virgula') melhorDelimitador = ',';
              else if (delim === 'pontoEVirgula') melhorDelimitador = ';';
              else if (delim === 'tab') melhorDelimitador = '\t';
            }
          }
          
          console.log(`🔍 Análise prévia do CSV: ${totalLinhas} linhas, delimitador provável: "${melhorDelimitador === '\t' ? 'TAB' : melhorDelimitador}"`);
          
          // Agora podemos fazer o parsing com o delimitador correto
          Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            delimiter: melhorDelimitador,
            encoding: 'UTF-8',
            complete: (results) => {
              if (results.errors && results.errors.length > 0) {
                // Decidir se deve continuar mesmo com erros, baseado na gravidade
                const fatalErrors = results.errors.filter(e => e.type === 'Abort' || e.type === 'File');
                if (fatalErrors.length > 0) {
                  const error = new Error(`Erro fatal ao processar CSV: ${fatalErrors[0].message}`)
                  reject(error)
                  return
                }
                
                // Registrar erros não-fatais
                console.warn('⚠️ Avisos durante o parsing do CSV:', results.errors);
              }
              
              if (!results.data || results.data.length === 0) {
                const error = new Error('O arquivo CSV está vazio ou não contém dados válidos')
                reject(error)
                return
              }
              
              // Verificar discrepância entre linhas do arquivo e registros processados
              if (results.data.length < totalLinhas - 10) { // considerando cabeçalho e algumas linhas em branco
                console.warn(`⚠️ Possível perda de dados: arquivo tem ${totalLinhas} linhas, mas apenas ${results.data.length} registros foram processados`);
              }
              
              console.log(`✅ CSV carregado com sucesso: ${fileName}`);
              console.log(`📊 Total de registros: ${results.data.length}`);
              console.log(`📋 Metadados: ${results.meta.fields?.length || 0} colunas, delimitador: "${results.meta.delimiter === '\t' ? 'TAB' : results.meta.delimiter}"`);
              
              state.rawData = parseCSVData(results.data)
              resolve(state.rawData)
            },
            error: (error) => {
              console.error('❌ Erro ao carregar CSV:', error)
              // Personaliza a mensagem de erro para ser mais amigável
              let mensagemErro = 'Não foi possível carregar o arquivo CSV'
              
              if (error.code === 404 || (error.message && error.message.includes('not found'))) {
                mensagemErro = 'Arquivo CSV não encontrado. Verifique se o caminho está correto.'
              } else if (error.code === 401 || error.code === 403) {
                mensagemErro = 'Sem permissão para acessar o arquivo CSV.'
              } else if (error.message && error.message.includes('CORS')) {
                mensagemErro = 'Erro de CORS: O servidor não permite acesso ao arquivo CSV.'
              } else if (error.message && error.message.includes('timeout')) {
                mensagemErro = 'O servidor demorou muito para responder. Tente novamente mais tarde.'
              }
              
              const errorObj = new Error(mensagemErro)
              errorObj.originalError = error
              reject(errorObj)
            }
          })
        })
        .catch(error => {
          console.error('❌ Erro ao examinar arquivo CSV:', error);
          reject(error);
        });
    })
  },
  
  /**
   * Define um filtro específico
   * @param {String} filterName - Nome do filtro (searchText, user, status, tags)
   * @param {any} value - Valor do filtro
   */
  setFilter(filterName, value) {
    if (Object.prototype.hasOwnProperty.call(state.filters, filterName)) {
      state.filters[filterName] = value
    } else {
      console.warn(`Filtro '${filterName}' não existe`)
    }
  },
  
  /**
   * Define um intervalo de datas para filtrar os dados
   * @param {Date|null} startDate - Data de início (ou null para limpar)
   * @param {Date|null} endDate - Data de fim (ou null para limpar)
   */
  setDateRange(startDate, endDate) {
    // Verificar se as datas são válidas antes de definir
    let validStartDate = null;
    let validEndDate = null;
    
    if (startDate) {
      try {
        // Converter para objeto Date se ainda não for
        const dateObj = startDate instanceof Date ? startDate : new Date(startDate);
        
        // Verificar se é uma data válida
        if (!isNaN(dateObj.getTime())) {
          validStartDate = dateObj;
        } else {
          console.warn('Data de início inválida:', startDate);
        }
      } catch (error) {
        console.error('Erro ao processar data de início:', error);
      }
    }
    
    if (endDate) {
      try {
        // Converter para objeto Date se ainda não for
        const dateObj = endDate instanceof Date ? endDate : new Date(endDate);
        
        // Verificar se é uma data válida
        if (!isNaN(dateObj.getTime())) {
          validEndDate = dateObj;
        } else {
          console.warn('Data de fim inválida:', endDate);
        }
      } catch (error) {
        console.error('Erro ao processar data de fim:', error);
      }
    }
    
    // Definir o intervalo de datas no estado
    state.filters.dateRange = {
      start: validStartDate,
      end: validEndDate
    };
    
    console.log('Intervalo de datas definido:', 
      validStartDate ? validStartDate.toLocaleDateString() : 'não definido',
      'até',
      validEndDate ? validEndDate.toLocaleDateString() : 'não definido'
    );
  },
  
  /**
   * Define um intervalo de datas predefinido
   * @param {String} period - Período predefinido (today, week, month, etc.)
   */
  setDateRangePeriod(period) {
    const range = calculateDateRange(period)
    if (range) {
      state.filters.dateRange = range
    } else {
      // Limpa o intervalo de datas se período for inválido
      state.filters.dateRange = { start: null, end: null }
    }
  },
  
  /**
   * Limpa todos os filtros
   */
  resetFilters() {
    state.filters = {
      searchText: '',
      user: null,
      status: null,
      tags: [],
      dateRange: { start: null, end: null }
    }
  },
  
  /**
   * Obtém uma lista de todos os usuários disponíveis
   * @returns {Array} Lista de usuários únicos
   */
  getUniqueUsers() {
    const users = new Set()
    state.rawData.forEach(item => {
      if (item.email) users.add(item.email)
    })
    return Array.from(users).sort()
  },
  
  /**
   * Obtém uma lista de todos os status disponíveis
   * @returns {Array} Lista de status únicos
   */
  getUniqueStatuses() {
    const statuses = new Set()
    state.rawData.forEach(item => {
      if (item.status) statuses.add(item.status)
    })
    return Array.from(statuses).sort()
  },
  
  /**
   * Obtém uma lista de todas as tags disponíveis
   * @returns {Array} Lista de tags únicas
   */
  getUniqueTags() {
    const tags = new Set()
    state.rawData.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  },
  
  /**
   * Obtém uma lista de todos os grupos disponíveis
   * @returns {Array} Lista de grupos únicos
   */
  getGroups() {
    const groups = new Set()
    state.rawData.forEach(item => {
      if (item.grupo_origem) groups.add(item.grupo_origem)
    })
    return Array.from(groups).sort()
  },
  
  /**
   * Obtém uma lista de todas as origens disponíveis
   * @returns {Array} Lista de origens únicas
   */
  getOrigins() {
    // Se um grupo está selecionado, filtra origens por esse grupo
    if (state.selectedGroup) {
      const origins = new Set()
      state.rawData
        .filter(item => item.grupo_origem === state.selectedGroup)
        .forEach(item => {
          if (item.nome_origem) origins.add(item.nome_origem)
        })
      return Array.from(origins).sort()
    }
    
    // Caso contrário, retorna todas as origens
    const origins = new Set()
    state.rawData.forEach(item => {
      if (item.nome_origem) origins.add(item.nome_origem)
    })
    return Array.from(origins).sort()
  },
  
  /**
   * Seleciona um grupo
   * @param {String} group - Nome do grupo
   */
  selectGroup(group) {
    state.selectedGroup = group
  },
  
  /**
   * Seleciona uma origem
   * @param {String} origin - Nome da origem
   */
  selectOrigin(origin) {
    state.selectedOrigin = origin
  },
  
  /**
   * Obtém o grupo selecionado atualmente
   * @returns {String} Nome do grupo selecionado
   */
  getSelectedGroup() {
    return state.selectedGroup
  },
  
  /**
   * Obtém a origem selecionada atualmente
   * @returns {String} Nome da origem selecionada
   */
  getSelectedOrigin() {
    return state.selectedOrigin
  },
  
  /**
   * Verifica se já existem dados carregados na store
   * @returns {Boolean} True se existem dados, False caso contrário
   */
  hasData() {
    return state.rawData && state.rawData.length > 0
  },
  
  /**
   * Limpa filtros de grupo e origem
   */
  clearFilters() {
    state.selectedGroup = null
    state.selectedOrigin = null
    
    state.filters = {
      searchText: '',
      user: null,
      status: null,
      tags: [],
      dateRange: { start: null, end: null }
    }
  },
  
  /**
   * Aplica os filtros atuais
   */
  applyFilters() {
    console.log('Aplicando filtros aos dados...');
    
    // Verificar se as datas são objetos Date antes de chamar toLocaleDateString
    let startDateStr = 'não definido';
    let endDateStr = 'não definido';
    
    if (state.filters.dateRange.start) {
      // Garantir que a data é um objeto Date válido
      const startDate = state.filters.dateRange.start instanceof Date ? 
                       state.filters.dateRange.start : 
                       new Date(state.filters.dateRange.start);
      
      if (!isNaN(startDate.getTime())) {
        startDateStr = startDate.toLocaleDateString();
      }
    }
    
    if (state.filters.dateRange.end) {
      // Garantir que a data é um objeto Date válido
      const endDate = state.filters.dateRange.end instanceof Date ? 
                     state.filters.dateRange.end : 
                     new Date(state.filters.dateRange.end);
      
      if (!isNaN(endDate.getTime())) {
        endDateStr = endDate.toLocaleDateString();
      }
    }
    
    console.log('Filtro de data:', startDateStr, 'até', endDateStr);
    console.log('Filtro de grupo:', state.selectedGroup || 'não definido');
    console.log('Filtro de origem:', state.selectedOrigin || 'não definido');
    console.log('Filtro de usuário:', state.filters.user || 'não definido');
    console.log('Filtro de tags:', state.filters.tags.length ? state.filters.tags.join(', ') : 'não definido');
    
    // Importante: NÃO MODIFICAR os dados brutos originais
    // Apenas filtrar e retornar o resultado filtrado
    // Esta função agora apenas registra que os filtros foram aplicados
    
    // Os filtros já são aplicados na função getFilteredData()
    console.log('Filtros aplicados com sucesso');
    return this.getFilteredData();
  },
  
  /**
   * Seleciona um usuário/vendedor
   * @param {String} user - Nome do vendedor/usuário
   */
  selectUser(user) {
    state.filters.user = user
  },
  
  /**
   * Seleciona uma tag
   * @param {String} tag - Tag para selecionar
   */
  selectTag(tag) {
    if (tag) {
      state.filters.tags = [tag]
    } else {
      state.filters.tags = []
    }
  },
  
  /**
   * Obtém o usuário/vendedor selecionado atualmente
   * @returns {String} Nome do vendedor/usuário selecionado
   */
  getSelectedUser() {
    return state.filters.user
  },
  
  /**
   * Obtém a tag selecionada atualmente
   * @returns {String} Tag selecionada (retorna a primeira tag se houver múltiplas)
   */
  getSelectedTag() {
    return state.filters.tags.length > 0 ? state.filters.tags[0] : null
  },
  
  // Obter opções de grupo
  getGroupOptions() {
    const uniqueGroups = new Set()
    
    state.rawData.forEach(item => {
      if (item.grupo_origem) {
        uniqueGroups.add(item.grupo_origem)
      }
    })
    
    return Array.from(uniqueGroups)
      .sort()
      .map(group => ({ value: group, label: group }))
  },
  
  // Obter opções de origem
  getOriginOptions() {
    const origins = []
    const originMap = new Map()
    
    state.rawData.forEach(item => {
      if (item.nome_origem && !originMap.has(item.nome_origem)) {
        originMap.set(item.nome_origem, true)
        origins.push({
          value: item.nome_origem,
          label: item.nome_origem,
          groupId: item.grupo_origem || ''
        })
      }
    })
    
    return origins.sort((a, b) => a.label.localeCompare(b.label))
  },
  
  // Aplicar filtros aos dados
  setFilters(filters) {
    state.filters = { ...filters }
    this.applyFilters()
  },
  
  getUsers() {
    if (!state.rawData || !state.rawData.length) return []
    const users = []
    state.rawData.forEach(row => {
      if (row.user_name && !users.includes(row.user_name)) {
        users.push(row.user_name)
      }
    })
    return users
  },
  
  getTags() {
    if (!state.rawData || !state.rawData.length) return []
    const tags = new Set()
    
    state.rawData.forEach(row => {
      if (row.tags && Array.isArray(row.tags)) {
        row.tags.forEach(tag => {
          if (tag) tags.add(tag)
        })
      }
    })
    
    return Array.from(tags)
  },
  
  /**
   * Processa dados CSV brutos (para uso com upload de arquivo)
   * @param {Array} rawData - Dados brutos do CSV já parseados
   * @returns {Array} Dados processados
   */
  processRawData(rawData) {
    console.log('📊 Processando dados brutos do CSV...');
    
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      console.error('❌ Dados inválidos fornecidos para processamento');
      return [];
    }
    
    // Processar os dados usando a função parseCSVData
    const processedData = parseCSVData(rawData);
    
    // Atualizar o estado da store
    state.rawData = processedData;
    
    console.log(`✅ Dados processados com sucesso: ${processedData.length} registros`);
    return processedData;
  }
}

export default store 