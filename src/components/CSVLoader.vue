<template>
  <div>
    <!-- Carregamento de CSV -->
    <div v-if="!csvLoaded" class="card mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Carregar dados do CSV</h2>
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">Carregando dados do arquivo mais recente...</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Isso pode levar alguns segundos</p>
      </div>
      
      <div v-else>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL do arquivo CSV</label>
            <input 
              type="text" 
              v-model="csvUrl" 
              placeholder="https://exemplo.com/dados.csv" 
              class="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-opacity-50"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="loadCSV" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-400" 
              :disabled="loading"
            >
              <span v-if="loading">Carregando...</span>
              <span v-else>Carregar dados</span>
            </button>
          </div>
        </div>
        
        <!-- Opção de fazer upload do arquivo -->
        <div class="mt-4">
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Ou carregue um arquivo CSV diretamente:</p>
          <div class="flex items-center space-x-2">
            <label 
              for="csv-upload" 
              class="flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300">Selecionar arquivo</span>
              <input 
                type="file" 
                id="csv-upload" 
                accept=".csv"
                class="hidden" 
                @change="handleFileUpload"
              />
            </label>
            <span v-if="selectedFile" class="text-sm text-gray-600 dark:text-gray-400">
              {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </span>
          </div>
        </div>
        
        <div v-if="error" class="mt-4 p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
          <p class="font-semibold">Erro ao carregar dados:</p>
          <p>{{ error }}</p>
          <p class="text-sm mt-2">
            O arquivo de dados pode não ter sido gerado ainda. Execute a exportação 
            para criar o arquivo CSV e tente novamente ou faça upload manual do arquivo.
          </p>
        </div>
      </div>
    </div>

    <!-- Barra de filtros quando CSV foi carregado -->
    <FilterBar v-if="csvLoaded" />

    <!-- Conteúdo da página -->
    <slot v-if="csvLoaded"></slot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import FilterBar from './FilterBar.vue'
import store from '../store'
import Papa from 'papaparse'

// Estado
const getDataUrls = () => {
  // Obtém a data atual no formato dd-mm-yyyy
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  
  // Nome do arquivo base
  const baseFileName = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}`;
  
  // Verifica se estamos em um ambiente de produção (VPS) ou desenvolvimento
  const isProduction = window.location.hostname !== 'localhost';
  
  // Diferentes tipos de arquivos para tentar carregar
  const fileExtensions = ['.json', '.csv'];
  
  if (isProduction) {
    const urls = [];
    
    // Gerar combinações de caminhos e extensões
    for (const ext of fileExtensions) {
      urls.push(
        `/resultados_api/${baseFileName}${ext}`,
        `/www/wwwroot/Clintr/resultados_api/${baseFileName}${ext}`,
        `./resultados_api/${baseFileName}${ext}`,
        `../resultados_api/${baseFileName}${ext}`
      );
    }
    
    return urls;
  } else {
    // Em desenvolvimento, apenas os caminhos padrão
    return [
      `/resultados_api/${baseFileName}.json`,
      `/resultados_api/${baseFileName}.csv`
    ];
  }
};

// Array de URLs possíveis para tentar
const possibleUrls = ref(getDataUrls());
const csvUrl = ref(possibleUrls.value[0]); // Inicialmente, usa a primeira URL da lista
const csvLoaded = ref(false)
const loading = ref(false)
const error = ref(null)

// Dados derivados do store
const filteredData = computed(() => store.getFilteredData())

// Coleções únicas de utilizadores e tags
const users = computed(() => {
  const uniqueUsers = new Set()
  filteredData.value.forEach(item => {
    if (item.user_name) uniqueUsers.add(item.user_name)
  })
  return Array.from(uniqueUsers).sort()
})

const tags = computed(() => {
  const uniqueTags = new Set()
  filteredData.value.forEach(item => {
    if (item.tags) {
      const tagsList = String(item.tags).split(',')
      tagsList.forEach(tag => {
        if (tag.trim()) uniqueTags.add(tag.trim())
      })
    }
  })
  return Array.from(uniqueTags).sort()
})

// Tenta carregar arquivos com datas anteriores se o arquivo atual não existir
const tryPreviousDates = async (daysToTry = 7) => {
  // Se o arquivo já foi carregado, não fazer nada
  if (csvLoaded.value) return;
  
  const today = new Date();
  
  for (let i = 1; i <= daysToTry; i++) { // Começar do dia anterior (i=1)
    // Tenta a data atual menos i dias
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // Nome do arquivo base para esta data
    const baseFileName = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}`;
    
    // Gerar URLs possíveis para esta data
    const isProduction = window.location.hostname !== 'localhost';
    
    // Diferentes tipos de arquivos para tentar carregar
    const fileExtensions = ['.json', '.csv'];
    
    let urls = [];
    
    // Gerar combinações de caminhos e extensões
    if (isProduction) {
      for (const ext of fileExtensions) {
        urls = urls.concat([
          `/resultados_api/${baseFileName}${ext}`,
          `/www/wwwroot/Clintr/resultados_api/${baseFileName}${ext}`,
          `./resultados_api/${baseFileName}${ext}`
        ]);
      }
    } else {
      for (const ext of fileExtensions) {
        urls.push(`/resultados_api/${baseFileName}${ext}`);
      }
    }
    
    console.log(`🔍 Tentando carregar arquivo de ${formattedDate}...`);
    
    // Tentar cada URL possível para esta data
    for (const url of urls) {
      try {
        // Verificar primeiro se o arquivo existe e é um formato válido
        const response = await fetch(url);
        if (!response.ok) {
          console.log(`❌ Arquivo não encontrado em: ${url}`);
          continue;
        }
        
        const text = await response.text();
        if (!isValidDataFile(text, url)) {
          console.log(`❌ Conteúdo não parece ser válido em: ${url}`);
          continue;
        }
        
        // Verificar se é JSON ou CSV
        const isJsonFile = url.toLowerCase().endsWith('.json');
        
        let data;
        if (isJsonFile) {
          // Processar JSON
          console.log('📊 Processando arquivo JSON...');
          try {
            const jsonData = JSON.parse(text);
            data = await store.processRawData(jsonData);
          } catch (e) {
            console.error('❌ Erro ao processar JSON:', e);
            continue; // Tentar a próxima URL
          }
        } else {
          // Arquivo válido encontrado, carregar com Papa Parse
          console.log('📊 Processando arquivo CSV...');
          csvUrl.value = url;
          data = await store.loadCSVData(url);
        }
        
        csvLoaded.value = true;
        loading.value = false;
        console.log(`✅ Arquivo de ${formattedDate} carregado com sucesso: ${url}`);
        console.log(`📊 Total de registros: ${data.length}`);
        return; // Sair da função se carregou com sucesso
      } catch (err) {
        console.log(`❌ Erro ao carregar ${url}: ${err.message}`);
        // Continuar com a próxima URL
      }
    }
    
    // Se chegou aqui, nenhuma URL para esta data funcionou, tentar a próxima data
  }
  
  // Se chegou aqui e ainda não carregou, mostrar erro
  if (!csvLoaded.value) {
    error.value = "Não foi possível encontrar um arquivo CSV ou JSON válido nos últimos dias.";
    loading.value = false;
    console.error('❌ Falha ao carregar dados: nenhum arquivo válido encontrado para os últimos ' + daysToTry + ' dias');
  }
};

// Verificar se o conteúdo parece um CSV ou JSON válido
const isValidDataFile = (content, url) => {
  // Se o conteúdo estiver vazio, não é válido
  if (!content || typeof content !== 'string') return false;
  
  // Verificar se o conteúdo começa com tags HTML
  if (content.trim().toLowerCase().startsWith('<!doctype') || 
      content.trim().toLowerCase().startsWith('<html')) {
    console.error('❌ O arquivo não é válido, parece ser HTML');
    return false;
  }
  
  // Verificar a extensão do arquivo
  const isJsonFile = url.toLowerCase().endsWith('.json');
  
  if (isJsonFile) {
    // Para arquivos JSON, verificar se é um JSON válido
    try {
      JSON.parse(content);
      return true;
    } catch (e) {
      console.error('❌ O arquivo não é um JSON válido');
      return false;
    }
  } else {
    // Para arquivos CSV, verificar delimitadores
    const primeiraLinha = content.split('\n')[0];
    return primeiraLinha.includes(',') || primeiraLinha.includes(';') || primeiraLinha.includes('\t');
  }
};

// Carregar dados
const loadCSV = async () => {
  loading.value = true;
  error.value = null;
  
  // Tentar cada URL possível na lista
  let loaded = false;
  
  for (let i = 0; i < possibleUrls.value.length; i++) {
    const url = possibleUrls.value[i];
    csvUrl.value = url;
    
    console.log(`🔍 Tentando carregar o arquivo: ${url}`);
    
    try {
      // Primeiro verificar se o arquivo existe e é válido
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ Arquivo não encontrado em: ${url}`);
        continue; // Tentar a próxima URL
      }
      
      const text = await response.text();
      
      // Verificar se o conteúdo parece ser um arquivo válido
      if (!isValidDataFile(text, url)) {
        console.log(`❌ Conteúdo não parece ser válido em: ${url}`);
        console.log('Primeiras linhas do conteúdo:');
        console.log(text.split('\n').slice(0, 5).join('\n'));
        continue; // Tentar a próxima URL
      }
      
      // Verificar se é JSON ou CSV
      const isJsonFile = url.toLowerCase().endsWith('.json');
      
      let data;
      if (isJsonFile) {
        // Processar JSON
        console.log('📊 Processando arquivo JSON...');
        try {
          const jsonData = JSON.parse(text);
          data = await store.processRawData(jsonData);
        } catch (e) {
          console.error('❌ Erro ao processar JSON:', e);
          continue; // Tentar a próxima URL
        }
      } else {
        // Processar CSV
        console.log('📊 Processando arquivo CSV...');
        // Verificar o número aproximado de linhas
        const linhas = text.split('\n').length;
        console.log(`ℹ️ Arquivo encontrado com aproximadamente ${linhas} linhas`);
        
        // Agora que validamos o arquivo, carregar com Papa Parse
        data = await store.loadCSVData(url);
      }
      
      csvLoaded.value = true;
      loading.value = false;
      console.log(`✅ Arquivo carregado com sucesso: ${url}`);
      console.log(`📊 Total de registros carregados: ${data.length}`);
      
      // Se carregou com sucesso, sair do loop
      loaded = true;
      break;
    } catch (err) {
      console.log(`❌ Erro ao carregar ${url}: ${err.message}`);
      // Continuar para tentar a próxima URL
    }
  }
  
  // Se nenhuma URL funcionou, tentar datas anteriores
  if (!loaded) {
    console.log('⚠️ Nenhuma das URLs funcionou. Tentando datas anteriores...');
    tryPreviousDates();
  }
};

// Variáveis para upload de arquivos
const selectedFile = ref(null);

// Função para formatar o tamanho do arquivo
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Função para lidar com o upload de arquivos
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedFile.value = file;
  loading.value = true;
  error.value = null;
  
  console.log(`📂 Arquivo selecionado: ${file.name} (${formatFileSize(file.size)})`);
  
  // Ler o arquivo como texto
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const content = e.target.result;
    
    // Verificar se o conteúdo parece ser um CSV válido
    if (!isValidCSV(content)) {
      console.error('❌ O arquivo não parece ser um CSV válido');
      error.value = 'O arquivo selecionado não parece ser um CSV válido. Verifique o formato do arquivo.';
      loading.value = false;
      return;
    }
    
    try {
      // Processar o CSV usando PapaParse diretamente
      const parseResult = Papa.parse(content, {
        header: true,
        skipEmptyLines: true
      });
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.warn('⚠️ Avisos durante o parsing do CSV:', parseResult.errors);
      }
      
      if (!parseResult.data || parseResult.data.length === 0) {
        error.value = 'O arquivo CSV está vazio ou não contém dados válidos';
        loading.value = false;
        return;
      }
      
      console.log(`✅ CSV carregado com sucesso do arquivo local`);
      console.log(`📊 Total de registros: ${parseResult.data.length}`);
      
      // Atualizar o store com os dados processados
      const processedData = store.processRawData(parseResult.data);
      
      // Atualizar estado
      csvLoaded.value = true;
      loading.value = false;
      
    } catch (err) {
      console.error('❌ Erro ao processar arquivo:', err);
      error.value = `Erro ao processar o arquivo: ${err.message}`;
      loading.value = false;
    }
  };
  
  reader.onerror = () => {
    console.error('❌ Erro ao ler o arquivo');
    error.value = 'Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.';
    loading.value = false;
  };
  
  // Iniciar a leitura do arquivo
  reader.readAsText(file);
};

// Checar se já temos dados no store
onMounted(() => {
  if (store.getRawData().length > 0) {
    csvLoaded.value = true
  } else {
    // Tenta carregar automaticamente o arquivo padrão
    loadCSV()
  }
})

// Fornecer estado e funções aos componentes filhos
provide('csvLoaded', csvLoaded)
provide('filteredData', filteredData)
</script> 