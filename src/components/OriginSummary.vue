<template>
  <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ title }}</h3>
    </div>
    
    <div class="p-4">
      <!-- Resumo dos dados por origem -->
      <div v-if="originStats.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
        Nenhum dado disponível para exibir resumo por origem
      </div>
      
      <div v-else>
        <!-- Botão para exportar para CSV -->
        <div class="flex justify-end mb-4">
          <button 
            @click="exportToCSV" 
            class="flex items-center space-x-1 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white py-2 px-4 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            <span>Exportar CSV</span>
          </button>
        </div>
        
        <!-- Tabela de resumo -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origem</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grupo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Abertos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ganhos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Perdidos</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="item in originStats" 
                :key="item.name"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{{ item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ item.group }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{{ item.count }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {{ item.details.aberto }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {{ item.details.ganho }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {{ item.details.perdido }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Papa from 'papaparse'

const props = defineProps({
  title: {
    type: String,
    default: 'Resumo por Origem'
  },
  data: {
    type: Array,
    required: true
  }
})

// Calcula estatísticas por origem
const originStats = computed(() => {
  // Agrupa os dados por origem
  const originMap = new Map()
  
  props.data.forEach(item => {
    const originName = item.nome_origem || 'Sem origem'
    const groupName = item.grupo_origem || 'Sem grupo'
    
    if (!originMap.has(originName)) {
      originMap.set(originName, {
        name: originName,
        group: groupName,
        count: 0,
        details: {
          aberto: 0,
          ganho: 0,
          perdido: 0
        }
      })
    }
    
    const originData = originMap.get(originName)
    originData.count++
    
    // Incrementa contadores por status
    const status = (item.status || '').toLowerCase()
    if (status === 'aberto' || status === 'open') {
      originData.details.aberto++
    } else if (status === 'ganho' || status === 'won') {
      originData.details.ganho++
    } else if (status === 'perdido' || status === 'lost') {
      originData.details.perdido++
    }
  })
  
  // Converte o mapa em array e ordena por contagem (decrescente)
  return Array.from(originMap.values())
    .sort((a, b) => b.count - a.count)
})

// Exporta os dados para CSV
const exportToCSV = () => {
  const csvData = originStats.value.map(origin => ({
    'Origem': origin.name,
    'Grupo': origin.group,
    'Total Registros': origin.count,
    'Abertos': origin.details.aberto,
    'Ganhos': origin.details.ganho,
    'Perdidos': origin.details.perdido
  }))
  
  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `resumo_origens_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script> 