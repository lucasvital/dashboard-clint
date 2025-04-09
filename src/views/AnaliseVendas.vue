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
import { ref, computed, inject } from 'vue'
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

// Função auxiliar para verificar se um item está dentro do período de filtro
function isItemWithinDateRange(item, startDate, endDate) {
  // Se não houver filtro de data ativo, retorna verdadeiro
  if (!startDate || !endDate) return true;
  
  // Extrair data do item
  let dataItem;
  
  // Usar won_at para a data se disponível, caso contrário usar dataObj
  if (item.won_at) {
    // Tentar parser o formato dd/mm/aaaa hh:mm:ss
    const partes = item.won_at.split(' ')[0].split('/');
    if (partes.length === 3) {
      // Formato brasileiro: dd/mm/aaaa
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
  } else if (item.dataObj) {
    dataItem = item.dataObj;
  } else {
    return false; // Sem data válida
  }
  
  // Verificar se a data é válida
  if (!dataItem || isNaN(dataItem.getTime())) {
    console.log('Data inválida:', item.won_at);
    return false;
  }
  
  // Definir hora para comparação de data
  const dataItemMeiaNoite = new Date(dataItem);
  dataItemMeiaNoite.setHours(0, 0, 0, 0);
  
  const startDateMeiaNoite = new Date(startDate);
  startDateMeiaNoite.setHours(0, 0, 0, 0);
  
  const endDateFimDoDia = new Date(endDate);
  endDateFimDoDia.setHours(23, 59, 59, 999);
  
  // Retorna verdadeiro se a data estiver dentro do intervalo
  return dataItemMeiaNoite >= startDateMeiaNoite && dataItemMeiaNoite <= endDateFimDoDia;
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
  // Agrupa vendas por mês
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const vendasPorMes = Array(12).fill(0);
  const idsProcessados = new Map(); // Para controlar IDs já processados em cada mês
  
  // Inicializa o mapa para cada mês
  for (let i = 0; i < 12; i++) {
    idsProcessados.set(i, new Set());
  }
  
  // Obter intervalo de datas do filtro
  const dateRange = store.getState().filters.dateRange;
  const startDate = dateRange.start;
  const endDate = dateRange.end;
  
  // Log para depuração dos filtros de data
  console.log('Filtro de data ativo:', startDate && endDate ? 'Sim' : 'Não');
  if (startDate && endDate) {
    console.log('Período:', startDate.toLocaleDateString(), 'até', endDate.toLocaleDateString());
  }
  
  filteredData.value.forEach(item => {
    if (!item.id) return;
    
    // Verificar se o status é de venda concluída (converter para minúsculas)
    const status = item.status ? item.status.toLowerCase() : '';
    if (status !== 'ganho' && status !== 'won') return;
    
    // Verificar se o item está dentro do período filtrado
    if (!isItemWithinDateRange(item, startDate, endDate)) return;
    
    // Usar won_at para a data se disponível, caso contrário usar dataObj
    let dataVenda;
    if (item.won_at) {
      // Tentar parser o formato dd/mm/aaaa hh:mm:ss
      const partes = item.won_at.split(' ')[0].split('/');
      if (partes.length === 3) {
        // Formato brasileiro: dd/mm/aaaa
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Mês em JavaScript é 0-based
        const ano = parseInt(partes[2], 10);
        
        dataVenda = new Date(ano, mes, dia);
        
        // Verificar se a data é válida
        if (isNaN(dataVenda.getTime())) {
          // Fallback para formato ISO
          dataVenda = new Date(item.won_at);
        }
      } else {
        // Tentar como formato ISO
        dataVenda = new Date(item.won_at);
      }
    } else if (item.dataObj) {
      dataVenda = item.dataObj;
    } else {
      return; // Pular item sem data válida
    }
    
    // Verificar se data é válida
    if (!dataVenda || isNaN(dataVenda.getTime())) {
      console.log('Data inválida para gráfico de vendas por mês:', item.won_at);
      return;
    }
    
    const mes = dataVenda.getMonth();
    
    // Se este ID já foi processado para este mês, ignorar
    if (idsProcessados.get(mes).has(item.id)) return;
    
    // Adicionar o valor da venda ao mês correspondente
    if (item.value !== undefined && item.value !== null) {
      const valor = parseFloat(item.value);
      if (!isNaN(valor)) {
        vendasPorMes[mes] += valor;
        // Marcar este ID como processado para este mês
        idsProcessados.get(mes).add(item.id);
      }
    }
  });
  
  // Log para depuração
  console.log('Vendas por mês usando won_at (valores):', vendasPorMes);
  
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