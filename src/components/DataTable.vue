<template>
  <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ title }}</h3>
      
      <!-- Barra de pesquisa -->
      <div class="relative">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Pesquisar..." 
          class="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Mensagem quando não há dados -->
    <div v-if="!filteredData.length" class="p-8 text-center text-gray-500 dark:text-gray-400">
      <p v-if="data.length === 0">Nenhum dado disponível.</p>
      <p v-else>Nenhum resultado encontrado para "{{ searchQuery }}".</p>
    </div>
    
    <!-- Tabela de dados -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key" 
              @click="sortBy(column.key)"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <span v-if="sortColumn === column.key" class="text-purple-600 dark:text-purple-400">
                  <span v-if="sortDirection === 'asc'">&uarr;</span>
                  <span v-else>&darr;</span>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="(item, index) in paginatedData" 
            :key="index" 
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <td 
              v-for="column in columns" 
              :key="column.key" 
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
            >
              {{ item[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginação -->
    <div v-if="filteredData.length > 0" class="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1" 
          :class="[
            'relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md', 
            currentPage === 1 ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          Anterior
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages" 
          :class="[
            'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md', 
            currentPage === totalPages ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          Próxima
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando
            <span class="font-medium">{{ startIndex + 1 }}</span>
            a
            <span class="font-medium">{{ endIndex }}</span>
            de
            <span class="font-medium">{{ filteredData.length }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span class="sr-only">Primeira</span>
              &laquo;
            </button>
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span class="sr-only">Anterior</span>
              &lsaquo;
            </button>
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage === page 
                  ? 'z-10 bg-purple-50 dark:bg-purple-900 border-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-300' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span class="sr-only">Próxima</span>
              &rsaquo;
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span class="sr-only">Última</span>
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Dados'
  },
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

// Estado da tabela
const searchQuery = ref('')
const currentPage = ref(1)
const sortColumn = ref('')
const sortDirection = ref('asc')

// Filtra os dados com base na pesquisa
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) {
    return sortedData.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return sortedData.value.filter(item => {
    return props.columns.some(column => {
      const value = item[column.key]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(query)
    })
  })
})

// Ordena os dados com base na coluna e direção selecionadas
const sortedData = computed(() => {
  if (!sortColumn.value) {
    return [...props.data]
  }
  
  return [...props.data].sort((a, b) => {
    const valA = a[sortColumn.value]
    const valB = b[sortColumn.value]
    
    // Se ambos são strings, use localeCompare para ordenação local
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection.value === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA)
    }
    
    // Ordenação numérica/padrão
    if (sortDirection.value === 'asc') {
      return valA > valB ? 1 : -1
    } else {
      return valA < valB ? 1 : -1
    }
  })
})

// Cálculo de paginação
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / props.itemsPerPage)
})

// Dados da página atual
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredData.value.slice(start, end)
})

// Índices para mostrar informações de paginação
const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => {
  const end = startIndex.value + props.itemsPerPage
  return Math.min(end, filteredData.value.length)
})

// Páginas a serem exibidas na paginação
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // Quantas páginas mostrar antes e depois da atual
  
  const range = []
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    range.push(i)
  }
  
  return range
})

// Métodos de navegação
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Método para alterar a ordenação
const sortBy = (column) => {
  if (sortColumn.value === column) {
    // Se já está ordenando por esta coluna, inverte a direção
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Nova coluna de ordenação
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Resetar a página atual quando a pesquisa mudar
watch(searchQuery, () => {
  currentPage.value = 1
})

// Resetar a página atual quando os dados mudarem
watch(() => props.data, () => {
  currentPage.value = 1
}, { deep: true })
</script> 