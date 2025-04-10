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
        
        <div v-if="error" class="mt-4 p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
          <p class="font-semibold">Erro ao carregar dados:</p>
          <p>{{ error }}</p>
          <p class="text-sm mt-2">
            O arquivo de dados pode não ter sido gerado ainda. Execute a exportação 
            para criar o arquivo CSV e tente novamente.
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

// Estado
const getCSVUrl = () => {
  // Obtém a data atual no formato dd-mm-yyyy
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  
  // Retorna a URL com a data atual
  return `/resultados_api/[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}.csv`;
};

const csvUrl = ref(getCSVUrl())
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
  
  for (let i = 0; i < daysToTry; i++) {
    // Tenta a data atual menos i dias
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    const fileUrl = `/resultados_api/[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}.csv`;
    csvUrl.value = fileUrl;
    
    try {
      console.log(`Tentando carregar arquivo: ${fileUrl}`);
      await store.loadCSVData(fileUrl);
      csvLoaded.value = true;
      loading.value = false;
      console.log(`Arquivo carregado com sucesso: ${fileUrl}`);
      break; // Sai do loop se carregar com sucesso
    } catch (err) {
      console.log(`Erro ao carregar ${fileUrl}: ${err.message}`);
      // Continua tentando com a próxima data
    }
  }
  
  // Se chegou aqui e ainda não carregou, mostrar erro
  if (!csvLoaded.value) {
    error.value = "Não foi possível encontrar um arquivo CSV válido nos últimos dias.";
    loading.value = false;
  }
};

// Carregar dados do CSV
const loadCSV = () => {
  loading.value = true;
  error.value = null;
  
  console.log(`Tentando carregar o arquivo: ${csvUrl.value}`);
  
  // Tenta o arquivo atual primeiro, depois tenta datas anteriores
  store.loadCSVData(csvUrl.value)
    .then((data) => {
      csvLoaded.value = true;
      loading.value = false;
      console.log(`✅ Arquivo carregado com sucesso: ${csvUrl.value}`);
      console.log(`📊 Total de registros carregados: ${data.length}`);
      
      // Verificar se há poucos registros (menos de 100)
      if (data.length < 100) {
        console.log(`⚠️ Atenção: Apenas ${data.length} registros foram carregados. Este valor parece baixo.`);
        
        // Examinar o CSV diretamente para verificar o problema
        fetch(csvUrl.value)
          .then(response => response.text())
          .then(text => {
            const linhas = text.split('\n').length;
            console.log(`🔍 O arquivo original possui ${linhas} linhas (incluindo cabeçalho)`);
            
            // Mostrar as primeiras 5 linhas para diagnóstico
            const primeiraLinhas = text.split('\n').slice(0, 5).join('\n');
            console.log('📄 Primeiras linhas do arquivo:');
            console.log(primeiraLinhas);
            
            if (linhas > data.length + 5) {
              console.log(`⚠️ Possível problema de parsing: o arquivo tem ${linhas} linhas, mas apenas ${data.length} registros foram processados`);
            }
          })
          .catch(err => {
            console.log(`❌ Erro ao examinar arquivo diretamente: ${err.message}`);
          });
      }
    })
    .catch(err => {
      console.log(`Erro ao carregar o arquivo atual: ${err.message}. Tentando arquivos anteriores...`);
      tryPreviousDates();
    });
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