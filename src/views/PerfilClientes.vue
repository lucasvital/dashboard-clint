<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Perfil de Clientes</h1>
    
    <!-- Cards de indicadores principais -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard 
        title="Total de clientes" 
        :value="totalClientes" 
        subtitle="Base de clientes ativa"
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
        title="Valor do cliente" 
        :value="valorCliente" 
        subtitle="Valor médio por cliente"
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
        title="Taxa de retenção" 
        :value="taxaRetencao" 
        subtitle="Clientes retornando"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span class="text-purple-600 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
    </div>
    
    <!-- Cards de perfil adicional dos clientes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard 
        title="Perfil predominante" 
        :value="perfilPredominante.nome" 
        :subtitle="`${perfilPredominante.porcentagem}% dos clientes`"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span class="text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Nicho principal" 
        :value="nichoMercado.nome" 
        :subtitle="`${nichoMercado.porcentagem}% dos clientes`"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span class="text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
      
      <StatCard 
        title="Experiência com eventos" 
        :value="clientesComEventos.percentual" 
        :subtitle="`${clientesComEventos.total} clientes já realizaram eventos`"
      >
        <template #icon>
          <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <span class="text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </template>
      </StatCard>
    </div>
    
    <!-- Gráficos de perfil de clientes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <ChartCard 
        title="Clientes por origem" 
        :chartConfig="clientesPorOrigemChart"
      />
      
      <ChartCard 
        title="Segmentação de cliente" 
        :chartConfig="segmentacaoClientesChart"
      />
    </div>
    
    <!-- Gráficos adicionais de perfil e nicho -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <ChartCard 
        title="Perfil dos clientes" 
        :chartConfig="perfilClientesChart"
      />
      
      <ChartCard 
        title="Nichos de mercado" 
        :chartConfig="nichosMercadoChart"
      />
    </div>
    
    <!-- Tabela de Top Clientes -->
    <div class="mb-6">
      <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Clientes</h3>
        </div>
        
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origem</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr 
                  v-for="cliente in topClientes" 
                  :key="cliente.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span class="text-gray-600 dark:text-gray-300 text-sm font-medium">
                          {{ getInitials(cliente.nome) }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ cliente.nome }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{{ cliente.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{{ cliente.origem }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">R$ {{ formatarNumero(cliente.valor) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(cliente.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ cliente.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mapa de Interações de Cliente -->
    <div class="mb-6">
      <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Mapa de Interações de Cliente</h3>
        </div>
        
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primeira interação</h4>
              <div class="flex items-center">
                <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                <p class="text-sm text-gray-600 dark:text-gray-400">Visita ao site: <span class="font-medium text-gray-800 dark:text-gray-200">{{ mapaDados.primeira }}</span></p>
              </div>
            </div>
            
            <div class="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conversão</h4>
              <div class="flex items-center">
                <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <p class="text-sm text-gray-600 dark:text-gray-400">Lead qualificado: <span class="font-medium text-gray-800 dark:text-gray-200">{{ mapaDados.conversao }}</span></p>
              </div>
            </div>
            
            <div class="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Venda</h4>
              <div class="flex items-center">
                <span class="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                <p class="text-sm text-gray-600 dark:text-gray-400">Primeira compra: <span class="font-medium text-gray-800 dark:text-gray-200">{{ mapaDados.venda }}</span></p>
              </div>
            </div>
            
            <div class="card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recorrência</h4>
              <div class="flex items-center">
                <span class="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                <p class="text-sm text-gray-600 dark:text-gray-400">Cliente recorrente: <span class="font-medium text-gray-800 dark:text-gray-200">{{ mapaDados.recorrencia }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Detalhes sobre Experiência com Eventos -->
    <div class="mb-6">
      <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Experiência com Eventos</h3>
        </div>
        
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-4">
                  <span class="text-amber-600 dark:text-amber-400 text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ eventosExperiencia.comExperiencia }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Clientes com experiência em eventos</p>
                </div>
              </div>
              
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Proporção de clientes com experiência em eventos:</p>
                <div class="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-4 mb-1">
                  <div class="bg-amber-500 h-4 rounded-full" :style="`width: ${eventosExperiencia.percentualComExperiencia}`"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0%</span>
                  <span>{{ eventosExperiencia.percentualComExperiencia }}</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                  <span class="text-blue-600 dark:text-blue-400 text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ eventosExperiencia.valorMedioComExperiencia }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Valor médio de clientes com experiência em eventos</p>
                </div>
              </div>
              
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Comparação de valor médio:</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Com experiência</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ eventosExperiencia.valorMedioComExperiencia }}</p>
                  </div>
                  <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Sem experiência</p>
                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ eventosExperiencia.valorMedioSemExperiencia }}</p>
                  </div>
                </div>
              </div>
            </div>
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

// Estatísticas principais
const totalClientes = computed(() => {
  // Contagem de clientes únicos por ID
  const clientes = new Set()
  filteredData.value.forEach(item => {
    if (item.id) clientes.add(item.id)
  })
  
  console.log('Total de clientes únicos (por ID):', clientes.size);
  return clientes.size
})

const valorCliente = computed(() => {
  // Calcular valor médio de cliente baseado em IDs únicos e valores reais
  const clientesMap = new Map() // Mapa de ID -> valor total
  
  filteredData.value.forEach(item => {
    // Verificar se o item tem ID e é uma venda concluída
    if (item.id && item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
      if (!clientesMap.has(item.id)) {
        clientesMap.set(item.id, 0)
      }
      
      // Adicionar valor real da venda se disponível
      if (item.value && !isNaN(parseFloat(item.value))) {
        clientesMap.set(item.id, clientesMap.get(item.id) + parseFloat(item.value))
      }
    }
  })
  
  // Calcular valor médio
  const clienteIds = Array.from(clientesMap.keys())
  const valorTotal = Array.from(clientesMap.values()).reduce((sum, value) => sum + value, 0)
  
  console.log('Clientes com valor processado:', clienteIds.length, 'Valor total:', valorTotal);
  
  if (clienteIds.length === 0) return 'R$ 0,00'
  
  return `R$ ${formatarNumero(valorTotal / clienteIds.length)}`
})

const taxaRetencao = computed(() => {
  // Calcular taxa de retenção com base em compras múltiplas do mesmo cliente (ID)
  const clienteCompras = new Map() // ID -> contagem de compras
  
  filteredData.value.forEach(item => {
    if (item.id && (item.status === 'ganho' || item.status === 'won')) {
      if (!clienteCompras.has(item.id)) {
        clienteCompras.set(item.id, 0)
      }
      
      clienteCompras.set(item.id, clienteCompras.get(item.id) + 1)
    }
  })
  
  // Contar clientes com mais de uma compra
  const clientesRecorrentes = Array.from(clienteCompras.values()).filter(count => count > 1).length
  
  console.log('Clientes totais com compras:', clienteCompras.size, 'Recorrentes:', clientesRecorrentes);
  
  if (clienteCompras.size === 0) return '0%'
  
  return `${((clientesRecorrentes / clienteCompras.size) * 100).toFixed(1)}%`
})

// Gráficos
const clientesPorOrigemChart = computed(() => {
  // Conta clientes por origem usando ID
  const clientesPorOrigem = {}
  const clientesOrigem = new Map() // Para evitar contar o mesmo cliente duas vezes na mesma origem
  
  filteredData.value.forEach(item => {
    if (item.id && item.nome_origem) {
      const origem = item.nome_origem
      const clienteOrigem = `${item.id}:${origem}`
      
      if (!clientesOrigem.has(clienteOrigem)) {
        clientesOrigem.set(clienteOrigem, true)
        
        if (!clientesPorOrigem[origem]) {
          clientesPorOrigem[origem] = 0
        }
        
        clientesPorOrigem[origem]++
      }
    }
  })
  
  // Ordenar por número de clientes e pegar os top 8
  const sortedOrigins = Object.entries(clientesPorOrigem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  
  console.log('Clientes por origem (top 8):', sortedOrigins);
  
  return {
    type: 'pie',
    data: {
      labels: sortedOrigins.map(([origem]) => origem),
      datasets: [{
        data: sortedOrigins.map(([, count]) => count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(217, 70, 239, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(248, 113, 113, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(163, 230, 53, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  }
})

const segmentacaoClientesChart = computed(() => {
  // Segmenta clientes por volume de compras
  const clienteCompras = new Map() // ID -> contagem de compras
  
  filteredData.value.forEach(item => {
    if (item.id && (item.status === 'ganho' || item.status === 'won')) {
      if (!clienteCompras.has(item.id)) {
        clienteCompras.set(item.id, 0)
      }
      
      clienteCompras.set(item.id, clienteCompras.get(item.id) + 1)
    }
  })
  
  const segmentos = {
    'Ocasionais (1 compra)': 0,
    'Regulares (2-3 compras)': 0,
    'Frequentes (4+ compras)': 0
  }
  
  clienteCompras.forEach((compras) => {
    if (compras === 1) {
      segmentos['Ocasionais (1 compra)']++
    } else if (compras >= 2 && compras <= 3) {
      segmentos['Regulares (2-3 compras)']++
    } else if (compras >= 4) {
      segmentos['Frequentes (4+ compras)']++
    }
  })
  
  console.log('Segmentação de clientes:', segmentos);
  
  return {
    type: 'doughnut',
    data: {
      labels: Object.keys(segmentos),
      datasets: [{
        data: Object.values(segmentos),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)'
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
      cutout: '65%'
    }
  }
})

// Gráfico de perfil dos clientes
const perfilClientesChart = computed(() => {
  // Contar ocorrências de cada tipo de perfil
  const perfilContagem = {}
  const clientesComPerfil = new Map() // Para evitar contar o mesmo cliente duas vezes no mesmo perfil
  
  filteredData.value.forEach(item => {
    if (item.id && item.o_que_te_define_melh) {
      const perfil = item.o_que_te_define_melh.trim()
      const clientePerfil = `${item.id}:${perfil}`
      
      if (!clientesComPerfil.has(clientePerfil)) {
        clientesComPerfil.set(clientePerfil, true)
        
        if (!perfilContagem[perfil]) {
          perfilContagem[perfil] = 0
        }
        
        perfilContagem[perfil]++
      }
    }
  })
  
  // Ordenar por número de clientes e pegar os top 6
  const sortedPerfis = Object.entries(perfilContagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  
  console.log('Perfis de clientes (top 6):', sortedPerfis);
  
  return {
    type: 'bar',
    data: {
      labels: sortedPerfis.map(([perfil]) => perfil),
      datasets: [{
        label: 'Número de clientes',
        data: sortedPerfis.map(([, count]) => count),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  }
})

// Gráfico de nichos de mercado
const nichosMercadoChart = computed(() => {
  // Contar ocorrências de cada nicho
  const nichoContagem = {}
  const clientesComNicho = new Map() // Para evitar contar o mesmo cliente duas vezes no mesmo nicho
  
  filteredData.value.forEach(item => {
    if (item.id && item.qual_seu_mercadonich) {
      const nicho = item.qual_seu_mercadonich.trim()
      const clienteNicho = `${item.id}:${nicho}`
      
      if (!clientesComNicho.has(clienteNicho)) {
        clientesComNicho.set(clienteNicho, true)
        
        if (!nichoContagem[nicho]) {
          nichoContagem[nicho] = 0
        }
        
        nichoContagem[nicho]++
      }
    }
  })
  
  // Ordenar por número de clientes e pegar os top 6
  const sortedNichos = Object.entries(nichoContagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  
  console.log('Nichos de mercado (top 6):', sortedNichos);
  
  return {
    type: 'doughnut',
    data: {
      labels: sortedNichos.map(([nicho]) => nicho),
      datasets: [{
        data: sortedNichos.map(([, count]) => count),
        backgroundColor: [
          'rgba(220, 38, 38, 0.7)',
          'rgba(234, 88, 12, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(79, 70, 229, 0.7)'
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
      cutout: '60%'
    }
  }
})

// Top clientes
const topClientes = computed(() => {
  // Agrupa por cliente usando ID em vez de email
  const clientesMap = new Map() // ID -> dados do cliente
  
  filteredData.value.forEach(item => {
    if (item.id) {
      if (!clientesMap.has(item.id)) {
        clientesMap.set(item.id, {
          nome: item.name || 'Cliente',
          email: item.email || '',
          id: item.id,
          origem: item.nome_origem || 'Desconhecida',
          valor: 0,
          compras: 0,
          status: 'Inativo'
        })
      }
      
      const cliente = clientesMap.get(item.id)
      
      if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
        cliente.compras++
        
        // Usar valor real se disponível
        if (item.value && !isNaN(parseFloat(item.value))) {
          cliente.valor += parseFloat(item.value)
        }
        
        // Atualiza status baseado no número de compras
        if (cliente.compras >= 3) {
          cliente.status = 'Premium'
        } else if (cliente.compras === 2) {
          cliente.status = 'Regular'
        } else {
          cliente.status = 'Novo'
        }
      }
    }
  })
  
  // Ordena por valor total e retorna os 10 melhores
  const top10 = Array.from(clientesMap.values())
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10)
  
  console.log('Top 10 clientes por valor:', top10.map(c => ({ id: c.id, valor: c.valor })));
  
  return top10
})

// Mapa de interações do cliente
const mapaDados = computed(() => {
  // Calcular dados de jornada do cliente com base em dados reais
  const totalVisitantes = new Set(filteredData.value.filter(item => item.id).map(item => item.id)).size
  
  // Contar leads (clientes que têm campo status)
  const leadsIds = new Set(filteredData.value.filter(item => item.id && item.status).map(item => item.id))
  const totalLeads = leadsIds.size
  
  // Contar clientes com compras (status ganho/won)
  const clientesIds = new Set(filteredData.value.filter(item => 
    item.id && item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')
  ).map(item => item.id))
  const totalClientes = clientesIds.size
  
  // Contar clientes com múltiplas compras
  const comprasPorCliente = new Map()
  filteredData.value.forEach(item => {
    if (item.id && (item.status === 'ganho' || item.status === 'won')) {
      if (!comprasPorCliente.has(item.id)) {
        comprasPorCliente.set(item.id, 0)
      }
      comprasPorCliente.set(item.id, comprasPorCliente.get(item.id) + 1)
    }
  })
  
  const clientesRecorrentes = Array.from(comprasPorCliente.entries())
    .filter(([_, count]) => count > 1)
    .length
  
  // Calcular porcentagens para o funil
  const leadsPct = totalVisitantes ? Math.round((totalLeads / totalVisitantes) * 100) : 0
  const clientesPct = totalVisitantes ? Math.round((totalClientes / totalVisitantes) * 100) : 0
  const recorrentesPct = totalVisitantes ? Math.round((clientesRecorrentes / totalVisitantes) * 100) : 0
  
  return {
    primeira: `${totalVisitantes} visitantes`,
    conversao: `${totalLeads} leads (${leadsPct}%)`,
    venda: `${totalClientes} clientes (${clientesPct}%)`,
    recorrencia: `${clientesRecorrentes} recorrentes (${recorrentesPct}%)`
  }
})

// Perfil predominante (o que te define melhor)
const perfilPredominante = computed(() => {
  // Contar ocorrências de cada tipo de perfil
  const perfilContagem = {}
  const clientesComPerfil = new Set()
  
  filteredData.value.forEach(item => {
    if (item.id && item.o_que_te_define_melh) {
      const perfil = item.o_que_te_define_melh.trim()
      const clientePerfil = `${item.id}:${perfil}`
      
      if (!clientesComPerfil.has(clientePerfil)) {
        clientesComPerfil.add(clientePerfil)
        
        if (!perfilContagem[perfil]) {
          perfilContagem[perfil] = 0
        }
        
        perfilContagem[perfil]++
      }
    }
  })
  
  // Encontrar o perfil mais comum
  const perfis = Object.entries(perfilContagem)
  
  if (perfis.length === 0) {
    return { nome: 'Não informado', porcentagem: 0 }
  }
  
  perfis.sort((a, b) => b[1] - a[1])
  const [nomePerfil, quantidade] = perfis[0]
  const totalClientesComPerfil = Array.from(clientesComPerfil).length
  const porcentagem = totalClientesComPerfil > 0 
    ? Math.round((quantidade / totalClientesComPerfil) * 100) 
    : 0
  
  console.log('Perfil predominante:', nomePerfil, `(${porcentagem}%)`);
  
  return { 
    nome: nomePerfil, 
    porcentagem 
  }
})

// Nicho de mercado principal
const nichoMercado = computed(() => {
  // Contar ocorrências de cada nicho
  const nichoContagem = {}
  const clientesComNicho = new Set()
  
  filteredData.value.forEach(item => {
    if (item.id && item.qual_seu_mercadonich) {
      const nicho = item.qual_seu_mercadonich.trim()
      const clienteNicho = `${item.id}:${nicho}`
      
      if (!clientesComNicho.has(clienteNicho)) {
        clientesComNicho.add(clienteNicho)
        
        if (!nichoContagem[nicho]) {
          nichoContagem[nicho] = 0
        }
        
        nichoContagem[nicho]++
      }
    }
  })
  
  // Encontrar o nicho mais comum
  const nichos = Object.entries(nichoContagem)
  
  if (nichos.length === 0) {
    return { nome: 'Não informado', porcentagem: 0 }
  }
  
  nichos.sort((a, b) => b[1] - a[1])
  const [nomeNicho, quantidade] = nichos[0]
  const totalClientesComNicho = Array.from(clientesComNicho).length
  const porcentagem = totalClientesComNicho > 0 
    ? Math.round((quantidade / totalClientesComNicho) * 100) 
    : 0
  
  console.log('Nicho principal:', nomeNicho, `(${porcentagem}%)`);
  
  return { 
    nome: nomeNicho, 
    porcentagem 
  }
})

// Clientes com experiência em eventos
const clientesComEventos = computed(() => {
  // Contar clientes que já fizeram eventos
  const clientesEventos = new Set()
  const clientesTotal = new Set()
  
  filteredData.value.forEach(item => {
    if (item.id) {
      clientesTotal.add(item.id)
      
      // Considerar como "com experiência" qualquer resposta exceto "Nunca fiz"
      if (item.voce_ja_fez_eventos && 
          item.voce_ja_fez_eventos.toLowerCase() !== 'nunca fiz') {
        clientesEventos.add(item.id)
      }
    }
  })
  
  const total = clientesEventos.size
  const percentual = clientesTotal.size > 0 
    ? `${Math.round((total / clientesTotal.size) * 100)}%` 
    : '0%'
  
  console.log('Clientes com experiência em eventos:', total, `(${percentual})`);
  
  return { 
    total, 
    percentual 
  }
})

// Detalhes da experiência com eventos
const eventosExperiencia = computed(() => {
  // Coletar dados de clientes com e sem experiência em eventos
  const clientesComExp = new Map() // ID -> dados do cliente com experiência
  const clientesSemExp = new Map() // ID -> dados do cliente sem experiência
  
  filteredData.value.forEach(item => {
    if (item.id) {
      // Considerar como "com experiência" qualquer resposta exceto "Nunca fiz"
      const temExperiencia = item.voce_ja_fez_eventos && 
                          item.voce_ja_fez_eventos.toLowerCase() !== 'nunca fiz'
      
      // Determinar o mapa apropriado com base na experiência
      const mapaClientes = temExperiencia ? clientesComExp : clientesSemExp
      
      if (!mapaClientes.has(item.id)) {
        mapaClientes.set(item.id, {
          id: item.id,
          valor: 0,
          compras: 0
        })
      }
      
      const cliente = mapaClientes.get(item.id)
      
      // Acumular dados de compras e valor
      if (item.status && (item.status.toLowerCase() === 'ganho' || item.status.toLowerCase() === 'won')) {
        cliente.compras++
        
        if (item.value && !isNaN(parseFloat(item.value))) {
          cliente.valor += parseFloat(item.value)
        }
      }
    }
  })
  
  // Calcular valores totais para cada grupo
  const totalComExp = clientesComExp.size
  const totalSemExp = clientesSemExp.size
  const totalClientes = totalComExp + totalSemExp
  
  // Calcular valores médios
  const valorTotalComExp = Array.from(clientesComExp.values())
    .reduce((sum, cliente) => sum + cliente.valor, 0)
    
  const valorTotalSemExp = Array.from(clientesSemExp.values())
    .reduce((sum, cliente) => sum + cliente.valor, 0)
    
  const valorMedioComExp = totalComExp > 0 
    ? valorTotalComExp / totalComExp 
    : 0
    
  const valorMedioSemExp = totalSemExp > 0 
    ? valorTotalSemExp / totalSemExp 
    : 0
    
  // Calcular porcentagem
  const percentualComExp = totalClientes > 0 
    ? (totalComExp / totalClientes) * 100 
    : 0
  
  console.log('Experiência com eventos:', {
    comExp: totalComExp,
    semExp: totalSemExp,
    percentual: percentualComExp.toFixed(1) + '%',
    valorMedioComExp: formatarNumero(valorMedioComExp),
    valorMedioSemExp: formatarNumero(valorMedioSemExp)
  });
  
  return {
    comExperiencia: `${totalComExp} clientes`,
    semExperiencia: `${totalSemExp} clientes`,
    percentualComExperiencia: `${percentualComExp.toFixed(1)}%`,
    valorMedioComExperiencia: `R$ ${formatarNumero(valorMedioComExp)}`,
    valorMedioSemExperiencia: `R$ ${formatarNumero(valorMedioSemExp)}`
  }
})

// Funções auxiliares
function getInitials(name) {
  if (!name) return '--'
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function getStatusClass(status) {
  switch (status) {
    case 'Premium':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 'Regular':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 'Novo':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    default:
      return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
  }
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
</script> 