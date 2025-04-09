<template>
  <div class="card p-6 bg-white dark:bg-gray-800 shadow rounded-lg transition-all">
    <div class="flex items-center space-x-4">
      <!-- Slot para ícone -->
      <slot name="icon"></slot>
      
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ title }}</p>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
    </div>
    
    <!-- Gráfico ou informação adicional, se necessário -->
    <div v-if="showDetails" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  }
}
</script> 