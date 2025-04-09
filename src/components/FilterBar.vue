<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <!-- Filtro de Data -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
        <div class="relative">
          <input 
            type="date" 
            v-model="startDate" 
            class="filter-dropdown w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            :max="endDate"
          />
          <span class="mx-1 text-gray-500 dark:text-gray-400">-</span>
          <input 
            type="date" 
            v-model="endDate" 
            class="filter-dropdown w-full text-sm mt-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
            :min="startDate"
          />
        </div>
      </div>
      
      <!-- Filtro de Usuário -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
        <select 
          class="filter-dropdown w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          v-model="selectedUser"
          @change="onUserChange"
        >
          <option value="">Todos</option>
          <option v-for="user in uniqueUsers" :key="user" :value="user">{{ user }}</option>
        </select>
      </div>
      
      <!-- Filtro de Grupo -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grupo de origem</label>
        <select 
          class="filter-dropdown w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          v-model="selectedGroup"
          @change="onGroupChange"
        >
          <option value="">Selecione</option>
          <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
        </select>
      </div>
      
      <!-- Filtro de Origem -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem</label>
        <select 
          class="filter-dropdown w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          v-model="selectedOrigin"
          @change="onOriginChange"
          :disabled="!selectedGroup"
        >
          <option value="">Selecione</option>
          <option v-for="origin in origins" :key="origin" :value="origin">{{ origin }}</option>
        </select>
      </div>
      
      <!-- Filtro de Tags -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <select 
          class="filter-dropdown w-full text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          v-model="selectedTag"
          @change="onTagChange"
        >
          <option value="">Todas</option>
          <option v-for="tag in uniqueTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </div>
    
    <!-- Botões de ação -->
    <div class="flex justify-end mt-4 space-x-2">
      <button @click="clearFilters" class="btn btn-secondary border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors py-2 px-4 rounded-md">
        Limpar Filtros
      </button>
      <button @click="applyFilters" class="btn btn-primary py-2 px-4 border-transparent rounded-md shadow-sm text-white bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors">
        Aplicar Filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import store from '@/store'

// Propriedades
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
})

// Estados
const startDate = ref('')
const endDate = ref('')
const selectedGroup = ref('')
const selectedOrigin = ref('')
const selectedUser = ref('')
const selectedTag = ref('')

// Obtém grupos e origens do store
const groups = computed(() => store.getGroups())
const origins = computed(() => store.getOrigins())

// Adicionar propriedades computadas para usuários e tags
const uniqueUsers = computed(() => store.getUsers().length ? store.getUsers() : props.users)
const uniqueTags = computed(() => store.getTags().length ? store.getTags() : props.tags)

// Manipuladores de eventos
const onGroupChange = () => {
  store.selectGroup(selectedGroup.value)
  selectedOrigin.value = ''
}

const onOriginChange = () => {
  store.selectOrigin(selectedOrigin.value)
}

const onUserChange = () => {
  store.selectUser(selectedUser.value)
}

const onTagChange = () => {
  store.selectTag(selectedTag.value)
}

const clearFilters = () => {
  selectedGroup.value = ''
  selectedOrigin.value = ''
  selectedUser.value = ''
  selectedTag.value = ''
  startDate.value = ''
  endDate.value = ''
  store.clearFilters()
}

const applyFilters = () => {
  if (startDate.value && endDate.value) {
    console.log('Aplicando filtro de data:', startDate.value, 'até', endDate.value);
    
    try {
      // Converter strings para objetos Date
      const startDateObj = new Date(startDate.value);
      const endDateObj = new Date(endDate.value);
      
      // Verificar se as datas são válidas
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        console.error('Datas inválidas fornecidas:', startDate.value, endDate.value);
        return;
      }
      
      // Ajustar fim do dia para capturar todos os eventos daquele dia
      endDateObj.setHours(23, 59, 59, 999);
      
      console.log('Data de início convertida:', startDateObj.toISOString());
      console.log('Data de fim convertida:', endDateObj.toISOString());
      
      // Definir o intervalo de datas como objetos Date
      store.setDateRange(startDateObj, endDateObj);
    } catch (error) {
      console.error('Erro ao processar datas:', error);
    }
  } else {
    console.log('Intervalo de datas não definido ou incompleto.');
    // Limpar o filtro de data se não houver ambas datas
    store.setDateRange(null, null);
  }
  
  // Aplicar os filtros após definir as datas
  store.applyFilters();
}

// Definir data atual para endDate se não estiver definido
onMounted(() => {
  if (!endDate.value) {
    const today = new Date()
    endDate.value = today.toISOString().split('T')[0]
    
    // Define a data inicial como 30 dias atrás
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  }
})

// Observar alterações do store
watch(() => store.getSelectedGroup(), (newGroup) => {
  selectedGroup.value = newGroup
})

watch(() => store.getSelectedOrigin(), (newOrigin) => {
  selectedOrigin.value = newOrigin
})

watch(() => store.getSelectedUser(), (newUser) => {
  selectedUser.value = newUser
})

watch(() => store.getSelectedTag(), (newTag) => {
  selectedTag.value = newTag
})
</script> 