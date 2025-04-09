<template>
  <div class="card bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ title }}</h3>
    </div>
    <div class="p-4">
      <!-- Renderização do gráfico -->
      <div class="chart-container" style="position: relative; height: 250px;">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfico'
  },
  chartConfig: {
    type: Object,
    required: true
  }
})

// Referência para o elemento canvas
const chartCanvas = ref(null)
// Instância do gráfico
let chartInstance = null

// Verifica se o modo escuro está ativo
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark')
}

// Cores do tema para o modo claro e escuro
const getThemeColors = () => {
  return {
    textColor: isDarkMode() ? '#e5e7eb' : '#374151',
    gridColor: isDarkMode() ? 'rgba(229, 231, 235, 0.1)' : 'rgba(107, 114, 128, 0.1)',
    primaryColor: '#8b5cf6', // Roxo
    primaryColorLight: isDarkMode() ? '#7c3aed' : '#a78bfa',
    backgroundColor: isDarkMode() ? '#1f2937' : '#ffffff'
  }
}

// Cria ou atualiza o gráfico
const renderChart = () => {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  const colors = getThemeColors()
  
  // Configuração padrão para todos os gráficos
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.textColor,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: colors.backgroundColor,
        titleColor: colors.textColor,
        bodyColor: colors.textColor,
        borderColor: colors.gridColor,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor
        },
        ticks: {
          color: colors.textColor
        }
      },
      y: {
        grid: {
          color: colors.gridColor
        },
        ticks: {
          color: colors.textColor
        }
      }
    }
  }
  
  // Mescla as opções padrão com as fornecidas pelo componente pai
  const finalConfig = {
    ...props.chartConfig,
    options: {
      ...defaultOptions,
      ...(props.chartConfig.options || {})
    }
  }
  
  // Se houver datasets, aplica as cores do tema
  if (finalConfig.data && finalConfig.data.datasets) {
    finalConfig.data.datasets = finalConfig.data.datasets.map((dataset, index) => {
      // Usa cores diferentes para cada dataset
      const colorIndex = index % 5
      const baseColors = [
        colors.primaryColor,
        '#ec4899', // Rosa
        '#9333ea', // Roxo (substituído do verde)
        '#f59e0b', // Âmbar
        '#3b82f6'  // Azul
      ]
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || baseColors[colorIndex] + '40',
        borderColor: dataset.borderColor || baseColors[colorIndex],
        color: colors.textColor
      }
    })
  }
  
  // Destrói o gráfico anterior se existir
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // Cria um novo gráfico
  chartInstance = new Chart(ctx, finalConfig)
}

// Observa alterações nos dados do gráfico
watch(() => props.chartConfig, () => {
  renderChart()
}, { deep: true })

// Observador para mudanças no tema
const handleThemeChange = () => {
  // Pequeno atraso para garantir que o DOM foi atualizado com as classes de tema
  setTimeout(() => {
    renderChart()
  }, 50)
}

// Inicializa o gráfico quando o componente é montado
onMounted(() => {
  renderChart()
  
  // Adiciona listener para mudanças de tema
  window.addEventListener('theme-change', handleThemeChange)
})

// Remove listener quando o componente for destruído
onUnmounted(() => {
  window.removeEventListener('theme-change', handleThemeChange)
  
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script> 