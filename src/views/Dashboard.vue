<template>
  <CSVLoader>
    <!-- Componente de navegação por abas -->
    <NavigationTabs
      :tabs="navigationTabs"
      v-model:activeTab="activeTab"
    />
    
    <!-- Conteúdo com base na aba selecionada -->
    <div v-if="activeTab === 'visao-geral'">
      <!-- Estatísticas principais -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Novas conversas" 
          :value="getFilteredStats.total" 
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
          :value="getFilteredStats.byStatus.aberto" 
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
          :value="getFilteredStats.byStatus.ganho" 
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
      
      <!-- Resumo por origem -->
      <div class="mb-6">
        <OriginSummary 
          title="Resumo por Origem" 
          :data="filteredData"
        />
      </div>
    </div>

    <!-- Conteúdo da aba de Análise de Vendas -->
    <div v-else-if="activeTab === 'analise-vendas'">
      <AnaliseVendas />
    </div>

    <!-- Conteúdo da aba de Perfil de Clientes -->
    <div v-else-if="activeTab === 'perfil-clientes'">
      <PerfilClientes />
    </div>

    <!-- Conteúdo da aba de Análise de Marketing -->
    <div v-else-if="activeTab === 'analise-marketing'">
      <AnaliseMarketing />
    </div>
    
    <!-- Tabela de dados sempre visível, independente da aba -->
    <DataTable 
      v-if="activeTab === 'visao-geral'"
      title="Registros" 
      :data="filteredData" 
      :columns="tableColumns"
    />
  </CSVLoader>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import StatCard from '../components/StatCard.vue'
import ChartCard from '../components/ChartCard.vue'
import DataTable from '../components/DataTable.vue'
import OriginSummary from '../components/OriginSummary.vue'
import CSVLoader from '../components/CSVLoader.vue'
import NavigationTabs from '../components/NavigationTabs.vue'
import store from '../store'
import { calculateStats } from '../utils/csv-parser'
import { 
  createStatusChart, 
  createLineChart, 
  groupDataByDay 
} from '../utils/chart-utils'
import AnaliseVendas from '../views/AnaliseVendas.vue'
import PerfilClientes from '../views/PerfilClientes.vue'
import AnaliseMarketing from '../views/AnaliseMarketing.vue'

// Configuração das abas de navegação
const navigationTabs = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'analise-vendas', label: 'Análise de Vendas' },
  { id: 'perfil-clientes', label: 'Perfil de Clientes' },
  { id: 'analise-marketing', label: 'Análise de Marketing' }
]

// Aba ativa
const activeTab = ref('visao-geral')

// Ref para forçar atualização
const triggerUpdate = ref(0)

// Monitorar alterações nos filtros
watch(() => store.getState().filters, () => {
  console.log('Dashboard: Filtros alterados, atualizando visualização...');
  triggerUpdate.value++;
}, { deep: true });

// Recebe os dados filtrados do componente pai
const filteredData = computed(() => store.getFilteredData())

// Função para verificar se um item está dentro do intervalo de datas
function isItemWithinDateRange(item, startDate, endDate) {
  if (!startDate || !endDate) {
    // Se não houver filtro de data, retorna verdadeiro
    return true;
  }

  // Obter a data do item (dataObj é baseado em created_at)
  let itemDate = null;
  
  // Usar dataObj para filtro (que é a data de criação do lead)
  if (item.dataObj && item.dataObj instanceof Date && !isNaN(item.dataObj.getTime())) {
    // Se dataObj já é um objeto Date válido
    itemDate = item.dataObj;
  } else if (item.created_at) {
    // Se dataObj não existir ou não for válido, mas temos created_at
    try {
      // Verificar se created_at está no formato brasileiro (dd/mm/aaaa hh:mm:ss)
      const parts = item.created_at.split(' ')[0].split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês em JavaScript é 0-based
        const year = parseInt(parts[2], 10);
        
        itemDate = new Date(year, month, day);
        
        // Verificar se a data é válida
        if (isNaN(itemDate.getTime())) {
          // Fallback para formato ISO
          itemDate = new Date(item.created_at);
        }
      } else {
        // Tentar como formato ISO
        itemDate = new Date(item.created_at);
      }
    } catch (error) {
      console.error('Erro ao converter created_at para Date:', error, item.created_at);
      return false;
    }
  }
  
  // Se não conseguimos uma data válida, não incluir o item
  if (!itemDate || isNaN(itemDate.getTime())) {
    console.warn('Data inválida para filtro:', item.created_at);
    return false;
  }
  
  // Normalizar as datas para comparação (ignorar tempo)
  const itemDateNormalized = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
  const startDateNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endDateNormalized = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  // Verificar se a data está dentro do intervalo
  return itemDateNormalized >= startDateNormalized && itemDateNormalized <= endDateNormalized;
}

// Função para calcular estatísticas considerando o filtro de data
const getFilteredStats = computed(() => {
  // Forçar recálculo quando os filtros mudam
  const update = triggerUpdate.value;

  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Verificar se o filtro de data está ativo
  if (startDate && endDate) {
    console.log(`Dashboard: Filtro de data ativo: ${startDate.toLocaleDateString()} até ${endDate.toLocaleDateString()}`);
    
    // Filtrar dados por data
    const dataFiltradaPorData = filteredData.value.filter(
      item => isItemWithinDateRange(item, startDate, endDate)
    );
    
    // Calcular estatísticas apenas com os dados dentro do período de filtro
    return calculateStats(dataFiltradaPorData);
  } else {
    // Se não houver filtro de data, usar todos os dados
    return calculateStats(filteredData.value);
  }
});

// Configuração dos gráficos
const dailyChart = computed(() => {
  // Forçar recálculo quando os filtros mudam
  const update = triggerUpdate.value;

  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Filtrar dados por data se necessário
  let dadosParaGrafico = filteredData.value;
  
  if (startDate && endDate) {
    dadosParaGrafico = filteredData.value.filter(
      item => isItemWithinDateRange(item, startDate, endDate)
    );
  }
  
  const groupedData = groupDataByDay(dadosParaGrafico);
  return createLineChart(groupedData, 'Registros por dia');
})

const statusChart = computed(() => {
  // Forçar recálculo quando os filtros mudam
  const update = triggerUpdate.value;

  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Filtrar dados por data se necessário
  let dadosParaGrafico = filteredData.value;
  
  if (startDate && endDate) {
    dadosParaGrafico = filteredData.value.filter(
      item => isItemWithinDateRange(item, startDate, endDate)
    );
  }
  
  return createStatusChart(dadosParaGrafico);
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
</script> 