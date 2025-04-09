<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Análise de Marketing</h1>
    
    <!-- Cards de métricas de marketing -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard 
        title="Leads gerados" 
        :value="totalLeads" 
        subtitle="Total de contatos"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span class="text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Taxa de conversão" 
        :value="taxaConversao" 
        subtitle="Lead para cliente"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span class="text-green-600 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Custo por lead" 
        :value="custoPorLead" 
        subtitle="Médio estimado"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <span class="text-yellow-600 dark:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="ROI de marketing" 
        :value="roiMarketing" 
        subtitle="Retorno sobre investimento"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span class="text-purple-600 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
    </div>
    
    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <ChartCard 
        title="Conversão por canal" 
        :chartConfig="conversaoPorCanalChart"
      />
      
      <ChartCard 
        title="Leads por dia" 
        :chartConfig="leadsPorDiaChart"
      />
    </div>
    
    <!-- Análise de eficiência de campanhas -->
    <div class="mb-6">
      <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Eficiência de Marketing por Origem</h3>
        </div>
        
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origem</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grupo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leads</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conversões</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taxa</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eficiência</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr 
                  v-for="origem in eficienciaOrigens" 
                  :key="origem.nome"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{{ origem.nome }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ origem.grupo }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{{ origem.leads }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {{ origem.conversoes }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{{ origem.taxa }}%</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div 
                        class="h-2 rounded-full" 
                        :class="getEficienciaColor(origem.eficiencia)"
                        :style="`width: ${origem.eficiencia}%`"
                      ></div>
                      <span class="ml-2 text-sm" :class="getEficienciaTextColor(origem.eficiencia)">
                        {{ origem.eficiencia.toFixed(1) }}
                      </span>
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
  chartColors 
} from '../utils/chart-utils'

// Dados para a página
const filteredData = computed(() => store.getFilteredData())

// Estatísticas de marketing
const totalLeads = computed(() => {
  return filteredData.value.length
})

const taxaConversao = computed(() => {
  const total = filteredData.value.length
  if (total === 0) return '0%'
  
  // Verificar valores distintos de status para debug
  const statusSet = new Set()
  filteredData.value.forEach(item => {
    if (item.status) statusSet.add(item.status.toLowerCase())
  })
  console.log('Status disponíveis:', Array.from(statusSet))
  
  // Corrigir o filtro para ser case-insensitive
  const conversoes = filteredData.value.filter(item => {
    if (!item.status) return false
    const status = item.status.toLowerCase()
    return status === 'ganho' || status === 'won'
  }).length
  
  console.log(`Conversões encontradas: ${conversoes} de ${total} leads (${((conversoes / total) * 100).toFixed(1)}%)`)
  
  return `${((conversoes / total) * 100).toFixed(1)}%`
})

const custoPorLead = computed(() => {
  // Simular custo por lead baseado na origem
  const custoTotal = gerarCustoTotal()
  const leads = filteredData.value.length
  
  if (leads === 0) return 'R$ 0,00'
  
  return `R$ ${formatarNumero(custoTotal / leads)}`
})

const roiMarketing = computed(() => {
  // Simular ROI de marketing
  const custoTotal = gerarCustoTotal()
  const vendas = calcularValorVendas()
  
  if (custoTotal === 0) return '0%'
  
  const roi = ((vendas - custoTotal) / custoTotal) * 100
  return `${roi.toFixed(1)}%`
})

// Gráficos
const conversaoPorCanalChart = computed(() => {
  // Agrupa conversões por canal/origem
  const origens = {}
  const conversoes = {}
  
  filteredData.value.forEach(item => {
    const origem = item.nome_origem || 'Não especificado'
    
    if (!origens[origem]) {
      origens[origem] = 0
      conversoes[origem] = 0
    }
    
    origens[origem]++
    
    if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      conversoes[origem]++
    }
  })
  
  // Calcula taxa de conversão para cada origem
  const taxas = Object.keys(origens).map(origem => {
    const taxa = origens[origem] ? (conversoes[origem] / origens[origem]) * 100 : 0
    return {
      origem,
      taxa: parseFloat(taxa.toFixed(1))
    }
  })
  
  // Ordenar por taxa de conversão (maior para menor) e pegar os 10 principais
  const principaisOrigens = taxas
    .sort((a, b) => b.taxa - a.taxa)
    .slice(0, 10)
  
  return {
    type: 'bar',
    data: {
      labels: principaisOrigens.map(item => item.origem),
      datasets: [{
        label: 'Taxa de Conversão (%)',
        data: principaisOrigens.map(item => item.taxa),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.formattedValue}%`
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%'
            }
          }
        }
      }
    }
  }
})

const leadsPorDiaChart = computed(() => {
  // Agrupa leads por dia dos últimos 30 dias
  const hoje = new Date()
  const leadsPorDia = {}
  
  // Inicializa últimos 30 dias com 0
  for (let i = 29; i >= 0; i--) {
    const data = new Date(hoje)
    data.setDate(hoje.getDate() - i)
    const dataStr = formatarData(data)
    leadsPorDia[dataStr] = 0
  }
  
  // Preenche dados reais
  filteredData.value.forEach(item => {
    if (item.dataObj) {
      const diffTime = Math.abs(hoje - item.dataObj)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 30) {
        const dataStr = formatarData(item.dataObj)
        if (leadsPorDia[dataStr] !== undefined) {
          leadsPorDia[dataStr]++
        }
      }
    }
  })
  
  // Converte para arrays para o gráfico
  const datas = Object.keys(leadsPorDia)
  const valores = Object.values(leadsPorDia)
  
  return {
    type: 'line',
    data: {
      labels: datas,
      datasets: [{
        label: 'Leads',
        data: valores,
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
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  }
})

// Análise de eficiência por origem
const eficienciaOrigens = computed(() => {
  const origens = new Map()
  
  // Processa dados por origem
  filteredData.value.forEach(item => {
    const nome = item.nome_origem || 'Não especificado'
    const grupo = item.grupo_origem || 'Não especificado'
    
    if (!origens.has(nome)) {
      origens.set(nome, {
        nome,
        grupo,
        leads: 0,
        conversoes: 0
      })
    }
    
    const origem = origens.get(nome)
    origem.leads++
    
    if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      origem.conversoes++
    }
  })
  
  // Calcula taxas e eficiência
  return Array.from(origens.values())
    .map(origem => {
      const taxa = origem.leads > 0 ? (origem.conversoes / origem.leads) * 100 : 0
      
      // Eficiência é calculada com base na taxa de conversão e volume de leads
      // Fórmula: (taxa de conversão * log(número de leads)) * 10
      // Isso beneficia origens com boa conversão e volume significativo
      const eficiencia = taxa * Math.log10(Math.max(origem.leads, 1)) * 5
      
      return {
        ...origem,
        taxa: Math.round(taxa),
        eficiencia: Math.min(eficiencia, 100) // Limita a 100%
      }
    })
    .sort((a, b) => b.eficiencia - a.eficiencia) // Ordena do mais eficiente para o menos
})

// Funções auxiliares
function gerarCustoTotal() {
  // Simula custo total de marketing
  // Cada origem tem um custo médio por lead diferente
  let custoTotal = 0
  
  const custoPorOrigem = {
    'Facebook Ads': 45,
    'Google Ads': 55,
    'Instagram': 35,
    'Email Marketing': 15,
    'Orgânico': 5
  }
  
  filteredData.value.forEach(item => {
    const origem = item.nome_origem
    if (origem && custoPorOrigem[origem]) {
      custoTotal += custoPorOrigem[origem]
    } else {
      // Custo médio para origens não especificadas
      custoTotal += 30
    }
  })
  
  return custoTotal
}

function calcularValorVendas() {
  // Simula valor total de vendas para calcular ROI
  let valorTotal = 0
  
  filteredData.value.forEach(item => {
    if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      valorTotal += gerarValorVenda(item.email || '', 500, 2000)
    }
  })
  
  return valorTotal
}

function gerarValorVenda(email, min, max) {
  // Gera valor de venda consistente baseado no email
  const seed = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return min + (seed % (max - min))
}

function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor)
}

function formatarData(data) {
  return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`
}

function getEficienciaColor(valor) {
  if (valor >= 70) return 'bg-green-500 dark:bg-green-600'
  if (valor >= 40) return 'bg-yellow-500 dark:bg-yellow-600'
  return 'bg-red-500 dark:bg-red-600'
}

function getEficienciaTextColor(valor) {
  if (valor >= 70) return 'text-green-600 dark:text-green-400'
  if (valor >= 40) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}
</script> 