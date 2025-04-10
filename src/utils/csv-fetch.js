/**
 * Utilidades para manipulação de CSV e contorno de problemas com o servidor
 */

/**
 * Faz o download de um arquivo CSV diretamente como blob
 * Contorna problemas de configuração do servidor que serve arquivos CSV como HTML
 * 
 * @param {string} url - URL do arquivo CSV
 * @param {string} filename - Nome para salvar o arquivo (opcional)
 * @returns {Promise} Promise resolvida quando o download é iniciado
 */
export const downloadCSVAsBlob = async (url, filename = null) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    // Pegar o conteúdo como texto para verificar se é HTML
    const text = await response.text();
    
    // Verificar se o conteúdo parece ser HTML (servidor está servindo CSV como HTML)
    if (text.trim().toLowerCase().startsWith('<!doctype') || 
        text.trim().toLowerCase().startsWith('<html')) {
      throw new Error('O servidor está servindo o CSV como HTML. Use o método de upload direto.');
    }
    
    // Converter o texto para um blob do tipo CSV
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    
    // Determinar o nome do arquivo para download
    const downloadFilename = filename || url.split('/').pop() || 'downloaded_data.csv';
    
    // Criar um link para download e clicar automaticamente
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer download do CSV:', error);
    throw error;
  }
};

/**
 * Verifica se um arquivo CSV é válido
 * @param {string} text - Conteúdo do arquivo
 * @returns {boolean} True se o conteúdo parece ser um CSV válido
 */
export const isValidCSV = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Verificar se o conteúdo começa com tags HTML
  if (text.trim().toLowerCase().startsWith('<!doctype') || 
      text.trim().toLowerCase().startsWith('<html')) {
    return false;
  }
  
  // Verificar se há pelo menos uma linha com delimitador
  const primeiraLinha = text.split('\n')[0];
  return primeiraLinha.includes(',') || primeiraLinha.includes(';') || primeiraLinha.includes('\t');
};

/**
 * Tenta obter o conteúdo de um CSV a partir de várias URLs possíveis
 * @param {Array<string>} urls - Lista de URLs para tentar
 * @returns {Promise<{content: string, url: string}>} Promise com o conteúdo e a URL que funcionou
 */
export const fetchCSVFromMultipleURLs = async (urls) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error('Nenhuma URL fornecida para tentar carregar o CSV');
  }
  
  let lastError = null;
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ Arquivo não encontrado em: ${url}`);
        continue;
      }
      
      const text = await response.text();
      
      if (!isValidCSV(text)) {
        console.log(`❌ Conteúdo não parece ser um CSV válido em: ${url}`);
        continue;
      }
      
      return { content: text, url };
    } catch (error) {
      console.log(`❌ Erro ao carregar ${url}: ${error.message}`);
      lastError = error;
    }
  }
  
  // Se chegou aqui, nenhuma URL funcionou
  throw lastError || new Error('Não foi possível carregar o CSV de nenhuma das URLs fornecidas');
}; 