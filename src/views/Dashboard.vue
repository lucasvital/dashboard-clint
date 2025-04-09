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
              class="filter-dropdown w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div class="flex items-end">
            <button @click="loadCSV" class="btn btn-primary bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded transition-colors" :disabled="loading">
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

    <div v-else>
      <!-- Barra de filtros -->
      <FilterBar :users="users" :tags="tags" />
      
      <!-- Estatísticas principais -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Novas conversas" 
          :value="stats.total" 
          subtitle="Total de registros"
        >
          <template #icon>
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span class="text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
            </div>
          </template>
        </StatCard>
        
        <StatCard 
          title="Conversas trabalhadas" 
          :value="stats.byStatus.aberto" 
          subtitle="Status aberto"
        >
          <template #icon>
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span class="text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </template>
        </StatCard>
        
        <StatCard 
          title="Conversas recebidas" 
          :value="stats.byStatus.ganho" 
          subtitle="Status ganho"
        >
          <template #icon>
            <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span class="text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </span>
            </div>
          </template>
        </StatCard>
      </div>
      
      <!-- Gráficos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Novas conversas por dia" 
          :chartConfig="dailyChart"
        />
        
        <ChartCard 
          title="Conversas trabalhadas por usuário" 
          :chartConfig="statusChart"
        />
      </div>
      
      <!-- Resumo por origem - NOVO COMPONENTE -->
      <div class="mb-6">
        <OriginSummary 
          title="Resumo por Origem" 
          :data="filteredData"
        />
      </div>
      
      <!-- Tabela de dados -->
      <DataTable 
        title="Registros" 
        :data="filteredData" 
        :columns="tableColumns"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FilterBar from '../components/FilterBar.vue'
import StatCard from '../components/StatCard.vue'
import ChartCard from '../components/ChartCard.vue'
import DataTable from '../components/DataTable.vue'
import OriginSummary from '../components/OriginSummary.vue'
import store from '../store'
import { calculateStats } from '../utils/csv-parser'
import { 
  createStatusChart, 
  createLineChart, 
  groupDataByDay 
} from '../utils/chart-utils'

// Estado
const csvUrl = ref('/resultados_api/[alberto_at_shortmidia.com.br]_Dados_Gerais_09-04-2025.csv')
const csvLoaded = ref(false)
const loading = ref(false)
const error = ref(null)

// Dados derivados do store
const filteredData = computed(() => store.getFilteredData())
const stats = computed(() => calculateStats(filteredData.value))

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

// Configuração dos gráficos
const dailyChart = computed(() => {
  const groupedData = groupDataByDay(filteredData.value)
  return createLineChart(groupedData, 'Registros por dia')
})

const statusChart = computed(() => {
  return createStatusChart(filteredData.value)
})

// Colunas da tabela
const tableColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefone' },
  { key: 'grupo_origem', label: 'Grupo' },
  { key: 'nome_origem', label: 'Origem' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Data de criação' }
]

// Encontrar o CSV mais recente
const findLatestCSV = async () => {
  try {
    // Usa a data atual para formar o nome do arquivo esperado
    const hoje = new Date()
    const dia = hoje.getDate().toString().padStart(2, '0')
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')
    const ano = hoje.getFullYear()
    
    // Verificar padrão específico primeiro (com data de hoje)
    const dataFormatada = `${dia}-${mes}-${ano}`
    const nomeArquivo = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${dataFormatada}.csv`
    const caminhoArquivo = `/resultados_api/${nomeArquivo}`
    
    console.log(`Tentando encontrar o arquivo CSV mais recente: ${caminhoArquivo}`)
    
    // Se não encontrar com a data de hoje, tenta com datas anteriores (até 7 dias atrás)
    for (let i = 0; i < 7; i++) {
      const dataAnterior = new Date(hoje)
      dataAnterior.setDate(hoje.getDate() - i)
      
      const diaAnt = dataAnterior.getDate().toString().padStart(2, '0')
      const mesAnt = (dataAnterior.getMonth() + 1).toString().padStart(2, '0')
      const anoAnt = dataAnterior.getFullYear()
      
      const dataFormatadaAnt = `${diaAnt}-${mesAnt}-${anoAnt}`
      const nomeArquivoAnt = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${dataFormatadaAnt}.csv`
      const caminhoArquivoAnt = `/resultados_api/${nomeArquivoAnt}`
      
      if (i > 0) {
        console.log(`Tentando alternativa ${i}: ${caminhoArquivoAnt}`)
      }
      
      // Verificamos se o arquivo existe tentando carregá-lo
      try {
        // Tentativa de verificar se o arquivo existe
        const response = await fetch(caminhoArquivoAnt, { method: 'HEAD' })
        if (response.ok) {
          console.log(`Arquivo encontrado: ${caminhoArquivoAnt}`)
          return caminhoArquivoAnt
        }
      } catch (e) {
        console.log(`Arquivo não encontrado: ${caminhoArquivoAnt}`)
        // Continua com a próxima data
      }
    }
    
    // Se chegou aqui, não encontrou nenhum arquivo recente
    console.warn('Não foi possível encontrar um arquivo CSV recente')
    return caminhoArquivo // Retorna o caminho original como fallback
  } catch (error) {
    console.error('Erro ao buscar arquivo CSV mais recente:', error)
    return null
  }
}

// Carregar dados do CSV
const loadCSV = async () => {
  if (!csvUrl.value) {
    error.value = 'Por favor, insira uma URL para o arquivo CSV'
    return
  }
  
  loading.value = true
  error.value = null
  
  console.log('Tentando carregar dados do CSV:', csvUrl.value)
  
  try {
    const data = await store.loadCSVData(csvUrl.value)
    console.log('Dados carregados com sucesso:', data.length, 'registros')
    csvLoaded.value = true
  } catch (err) {
    console.error('Erro detalhado ao carregar CSV:', err)
    error.value = `Erro ao carregar o CSV: ${err.message || 'Erro desconhecido'}`
  } finally {
    loading.value = false
  }
}

// Carregar dados na inicialização
onMounted(async () => {
  // Tenta encontrar o arquivo mais recente
  const latestCSV = await findLatestCSV()
  if (latestCSV) {
    csvUrl.value = latestCSV
  }
  
  // Carrega o CSV (seja o padrão, seja o encontrado)
  loadCSV()
})
</script> 