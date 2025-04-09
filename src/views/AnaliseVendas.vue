<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Análise de Vendas</h1>
    
    <!-- Cards de estatísticas principais de vendas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard 
        title="Vendas totais" 
        :value="totalVendas" 
        subtitle="Valor total de vendas"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span class="text-green-600 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Conversões" 
        :value="taxaConversao" 
        subtitle="Taxa de conversão"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span class="text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Ticket médio" 
        :value="ticketMedio" 
        subtitle="Valor médio por venda"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <span class="text-yellow-600 dark:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Clientes" 
        :value="totalClientes" 
        subtitle="Total de clientes"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span class="text-purple-600 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
    </div>
    
    <!-- Gráficos de análise -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <ChartCard 
        title="Desempenho de vendas por mês" 
        :chartConfig="vendasPorMesChart"
      />
      
      <ChartCard 
        title="Distribuição de vendas por status" 
        :chartConfig="vendasPorStatusChart"
      />
    </div>
    
    <!-- Desempenho por origem -->
    <div class="mb-6">
      <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Desempenho de Vendas por Origem</h3>
        </div>
        
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origem</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grupo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendas</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conversão</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr 
                  v-for="item in desempenhoOrigens" 
                  :key="item.origem"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{{ item.origem }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ item.grupo }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {{ item.vendas }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">R$ {{ formatarNumero(item.valor) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div class="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" :style="`width: ${item.taxaConversao}%`"></div>
                      </div>
                      <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ item.taxaConversao }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import ChartCard from '../components/ChartCard.vue'
import store from '../store'
import { 
  createPieChart,
  createBarChart, 
  createLineChart, 
  groupDataByDay,
  chartColors 
} from '../utils/chart-utils'

// Dados para a página
const filteredData = computed(() => store.getFilteredData())

// Ref para forçar atualização dos gráficos
const triggerUpdate = ref(0)

// Monitorar alterações nos filtros para forçar atualização
watch(() => store.getState().filters.dateRange, (newDateRange) => {
  console.log('Filtro de data alterado:', 
    newDateRange.start ? newDateRange.start.toLocaleDateString() : 'nenhuma data inicial',
    'até',
    newDateRange.end ? newDateRange.end.toLocaleDateString() : 'nenhuma data final'
  );
  triggerUpdate.value++;
}, { deep: true });

watch(() => store.getState().filters, (newFilters) => {
  console.log('Filtros alterados:', JSON.stringify(newFilters, (key, value) => {
    // Converter datas para string no formato local
    if (value instanceof Date) return value.toLocaleDateString();
    return value;
  }, 2));
  triggerUpdate.value++;
}, { deep: true });

onMounted(() => {
  console.log('AnaliseVendas montado. Filtros iniciais:', JSON.stringify(store.getState().filters, (key, value) => {
    // Converter datas para string no formato local
    if (value instanceof Date) return value.toLocaleDateString();
    return value;
  }, 2));
});

// Verifica se um item está dentro do intervalo de datas
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
  
  // Logging para debug
  if (Math.random() < 0.05) { // Log apenas 5% dos itens para não sobrecarregar o console
    console.log('Filtro data:', 
      'Item:', itemDateNormalized.toLocaleDateString(), 
      'Range:', startDateNormalized.toLocaleDateString(), '-', endDateNormalized.toLocaleDateString(),
      'Dentro?', itemDateNormalized >= startDateNormalized && itemDateNormalized <= endDateNormalized);
  }
  
  // Verificar se a data está dentro do intervalo
  return itemDateNormalized >= startDateNormalized && itemDateNormalized <= endDateNormalized;
}

// Estatísticas de vendas
const totalVendas = computed(() => {
  return formatarNumero(calcularTotalVendas())
})

const taxaConversao = computed(() => {
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Contagem de IDs únicos para total de clientes
  const idsUnicos = new Set();
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    if (item.id) idsUnicos.add(item.id);
  });
  
  const totalClientes = idsUnicos.size;
  if (totalClientes === 0) return '0%';
  
  // Valor total vendido e contagem de vendas realizadas
  let valorTotalVendido = 0;
  const idsVendas = new Set();
  
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    if (item.id && item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      idsVendas.add(item.id);
      
      // Adicionar valor da venda se disponível
      if (item.value) {
        const valorNumerico = parseFloat(item.value);
        if (!isNaN(valorNumerico)) {
          valorTotalVendido += valorNumerico;
        }
      }
    }
  });
  
  const totalVendas = idsVendas.size;
  
  // Log para depuração
  console.log('Total de clientes (IDs únicos):', totalClientes);
  console.log('Total de vendas realizadas (IDs únicos):', totalVendas);
  console.log('Valor total vendido:', valorTotalVendido);
  
  // Calcular a porcentagem de conversão (clientes que compraram / total de clientes)
  const porcentagemConversao = (totalVendas / totalClientes) * 100;
  return `${porcentagemConversao.toFixed(1)}%`;
})

const ticketMedio = computed(() => {
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Filtrar vendas concluídas (status ganho ou won, independente de maiúscula/minúscula)
  const vendas = filteredData.value.filter(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return false;
    
    if (!item.status) return false;
    
    const status = item.status.toLowerCase();
    return status === 'ganho' || status === 'won';
  });
  
  // Log para depuração
  console.log('Número de vendas para cálculo do ticket médio:', vendas.length);
  
  if (vendas.length === 0) return 'R$ 0';
  
  // Calcular o valor total usando os valores reais do campo 'value'
  let valorTotal = 0;
  let vendasComValor = 0;
  
  vendas.forEach(item => {
    if (item.value !== undefined && item.value !== null) {
      const valorNumerico = parseFloat(item.value);
      if (!isNaN(valorNumerico)) {
        // Aceita valores zero ou positivos
        valorTotal += valorNumerico;
        vendasComValor++;
      }
    }
  });
  
  // Log para depuração
  console.log('Valor total das vendas:', valorTotal);
  console.log('Vendas com valor válido (incluindo zeros):', vendasComValor);
  
  // Se não houver vendas com valor válido, retorna zero
  if (vendasComValor === 0) return 'R$ 0';
  
  // Calcular o ticket médio (valor total / número de vendas com valor)
  const media = valorTotal / vendasComValor;
  return `R$ ${formatarNumero(media)}`;
})

const totalClientes = computed(() => {
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Contagem de clientes únicos por ID
  const idsUnicos = new Set();
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    if (item.id) idsUnicos.add(item.id);
  });
  
  console.log('Total de IDs únicos (clientes):', idsUnicos.size);
  return idsUnicos.size;
})

// Dados para gráficos
const vendasPorMesChart = computed(() => {
  // Usar o valor de triggerUpdate para forçar recálculo
  const update = triggerUpdate.value;
  
  console.log('[vendasPorMesChart] Iniciando cálculo de vendas por mês...');
  
  if (!filteredData.value || filteredData.value.length === 0) {
    console.log('Sem dados de vendas disponíveis.');
    return {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Vendas (R$)',
          data: [],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `R$ ${formatarNumero(context.raw || 0)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + formatarNumero(value);
              }
            }
          }
        }
      }
    };
  }

  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Log de filtro de data ativo
  if (startDate && endDate) {
    console.log(`Filtro de data ativo: ${startDate.toLocaleDateString()} até ${endDate.toLocaleDateString()}`);
  } else {
    console.log('Sem filtro de data ativo, processando todos os registros.');
  }

  // Inicializar objeto de contagem por mês
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const vendasPorMes = Array(12).fill(0);
  
  // Contador para log
  let totalVendas = 0;
  let totalValor = 0;
  
  // Filtrar e contar vendas por mês
  filteredData.value.forEach(item => {
    // Verificar se é uma venda (status ganho/won)
    const status = item.status ? item.status.toLowerCase() : '';
    if (status !== 'ganho' && status !== 'won') return;
    
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    // Obter data para agrupar por mês (podemos usar dataObj, created_at ou won_at)
    let dataItem;
    
    // Tentar usar won_at, dataObj ou created_at, nessa ordem de prioridade
    if (item.won_at) {
      try {
        // Verificar se won_at está no formato brasileiro (dd/mm/aaaa)
        const partes = item.won_at.split(' ')[0].split('/');
        if (partes.length === 3) {
          const dia = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-based
          const ano = parseInt(partes[2], 10);
          
          dataItem = new Date(ano, mes, dia);
          
          // Verificar se a data é válida
          if (isNaN(dataItem.getTime())) {
            // Fallback para formato ISO
            dataItem = new Date(item.won_at);
          }
        } else {
          // Tentar como formato ISO
          dataItem = new Date(item.won_at);
        }
        
        // Verificar se a data é válida após parsing
        if (isNaN(dataItem.getTime())) {
          // Se won_at falhou, tentar dataObj
          dataItem = item.dataObj;
        }
      } catch (error) {
        // Se won_at falhou, tentar dataObj
        dataItem = item.dataObj;
      }
    } else if (item.dataObj) {
      // Se não tiver won_at, usar dataObj
      dataItem = item.dataObj;
    } else if (item.created_at) {
      // Se não tiver dataObj, tentar created_at
      try {
        const partes = item.created_at.split(' ')[0].split('/');
        if (partes.length === 3) {
          const dia = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-based
          const ano = parseInt(partes[2], 10);
          
          dataItem = new Date(ano, mes, dia);
        } else {
          dataItem = new Date(item.created_at);
        }
      } catch (error) {
        console.warn('Erro ao parsear created_at:', error);
        return; // Pular este item
      }
    } else {
      return; // Pular este item sem data válida
    }
    
    // Verificar se a data é válida
    if (!dataItem || isNaN(dataItem.getTime())) {
      return; // Pular se a data não for válida
    }
    
    // Obter mês da data
    const mes = dataItem.getMonth();
    
    // Obter valor da venda
    let valor = 0;
    if (item.value !== undefined && item.value !== null) {
      valor = parseFloat(item.value);
      if (isNaN(valor)) valor = 0;
    }
    
    // Somar valor ao mês correspondente
    vendasPorMes[mes] += valor;
    
    // Registrar para log
    totalVendas++;
    totalValor += valor;
  });
  
  // Log para depuração
  console.log(`Total de vendas processadas: ${totalVendas}, Valor total: R$ ${formatarNumero(totalValor)}`);
  console.log('Vendas por mês (valores):', vendasPorMes);
  
  return {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Vendas (R$)',
        data: vendasPorMes,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              return `R$ ${formatarNumero(value)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + formatarNumero(value);
            }
          }
        }
      }
    }
  };
})

const vendasPorStatusChart = computed(() => {
  // Usar o valor de triggerUpdate para forçar recálculo
  const update = triggerUpdate.value;
  
  // Conta vendas por status
  const statusCount = {
    'ganho': 0,
    'perdido': 0,
    'aberto': 0
  }
  
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    const status = item.status ? item.status.toLowerCase() : 'outro'
    if (status === 'ganho' || status === 'won') {
      statusCount['ganho']++
    } else if (status === 'perdido' || status === 'lost') {
      statusCount['perdido']++
    } else if (status === 'aberto' || status === 'open') {
      statusCount['aberto']++
    }
  })
  
  // Log para depuração
  console.log('Distribuição de status com filtro de data:', statusCount);
  
  return {
    type: 'doughnut',
    data: {
      labels: ['Ganho', 'Perdido', 'Em aberto'],
      datasets: [{
        data: [statusCount.ganho, statusCount.perdido, statusCount.aberto],
        backgroundColor: [
          'rgba(72, 187, 120, 0.7)',
          'rgba(237, 100, 166, 0.7)',
          'rgba(66, 153, 225, 0.7)'
        ],
        borderColor: [
          'rgb(72, 187, 120)',
          'rgb(237, 100, 166)',
          'rgb(66, 153, 225)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      cutout: '70%'
    }
  }
})

// Desempenho por origem
const desempenhoOrigens = computed(() => {
  // Usar o valor de triggerUpdate para forçar recálculo
  const update = triggerUpdate.value;
  
  const origensMap = new Map()
  
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Processa os dados agrupando por origem
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    const origem = item.nome_origem || 'Sem origem'
    const grupo = item.grupo_origem || 'Sem grupo'
    
    if (!origensMap.has(origem)) {
      origensMap.set(origem, {
        origem,
        grupo,
        total: 0,
        vendas: 0,
        valor: 0
      })
    }
    
    const dadosOrigem = origensMap.get(origem)
    dadosOrigem.total++
    
    // Considera "ganho" ou "won" como venda realizada
    if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      dadosOrigem.vendas++
      
      // Usar o valor real do campo 'value' se disponível
      if (item.value) {
        const valorNumerico = parseFloat(item.value)
        if (!isNaN(valorNumerico)) {
          dadosOrigem.valor += valorNumerico
        }
      }
    }
  })
  
  // Log para depuração
  console.log('Origens processadas com filtro de data:', origensMap.size);
  
  // Converte o Map para array e calcula a taxa de conversão
  return Array.from(origensMap.values())
    .map(item => {
      return {
        ...item,
        taxaConversao: item.total > 0 ? Math.round((item.vendas / item.total) * 100) : 0
      }
    })
    .sort((a, b) => b.valor - a.valor) // Ordena por valor (maior para menor)
})

// Alterar a função calcularTotalVendas para usar o filtro de data
function calcularTotalVendas() {
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  let total = 0
  filteredData.value.forEach(item => {
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      // Usar o valor real do campo 'value' se disponível
      if (item.value) {
        const valorNumerico = parseFloat(item.value)
        if (!isNaN(valorNumerico)) {
          total += valorNumerico
        }
      }
    }
  })
  return total
}

function gerarValorAleatório(min, max) {
  // Função mantida para compatibilidade, mas não será mais usada para valores de vendas
  const seed = filteredData.value.length
  return min + (((seed * 9301 + 49297) % 233280) / 233280) * (max - min)
}

function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor)
}
</script> 