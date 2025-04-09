<template>
  <div class="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-3 text-sm font-medium transition-colors"
        :class="[
          activeTab === tab.id 
            ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  initialTab: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:activeTab'])

const activeTab = ref(props.initialTab || (props.tabs.length > 0 ? props.tabs[0].id : ''))

// Observar mudanças na aba ativa
const updateActiveTab = (newTab) => {
  activeTab.value = newTab
  emit('update:activeTab', newTab)
}

// Observador para activeTab
import { watch } from 'vue'
watch(activeTab, updateActiveTab)
</script> 