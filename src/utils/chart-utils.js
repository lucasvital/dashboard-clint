import Chart from 'chart.js/auto'

/**
 * Configuração base para os gráficos
 */
export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      titleColor: '#333',
      bodyColor: '#333',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      usePointStyle: true
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(200, 200, 200, 0.2)',
        borderDash: [5, 5]
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(200, 200, 200, 0.2)',
        borderDash: [5, 5],
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 3,
      hoverRadius: 5
    }
  }
}

/**
 * Paleta de cores no tom roxo suave
 */
export const chartColors = {
  primary: 'rgba(139, 92, 246, 0.7)',    // Purple-500 com transparência
  secondary: 'rgba(167, 139, 250, 0.6)',  // Purple-400 com transparência
  tertiary: 'rgba(192, 132, 252, 0.5)',  // Purple-300 com transparência
  quaternary: 'rgba(216, 180, 254, 0.4)', // Purple-200 com transparência
  quinary: 'rgba(233, 213, 255, 0.4)',   // Purple-100 com transparência
  borders: {
    primary: 'rgba(139, 92, 246, 1)',    // Purple-500 sólido
    secondary: 'rgba(167, 139, 250, 1)',  // Purple-400 sólido
    tertiary: 'rgba(192, 132, 252, 1)',  // Purple-300 sólido
    quaternary: 'rgba(216, 180, 254, 1)', // Purple-200 sólido
    quinary: 'rgba(233, 213, 255, 1)'     // Purple-100 sólido
  },
  // Cores para os status (substituindo as cores padrão de verde, vermelho, azul)
  status: {
    success: 'rgba(139, 92, 246, 0.7)',     // Roxo para status "ganho" (em vez de verde)
    danger: 'rgba(167, 139, 250, 0.6)',     // Roxo mais claro para status "perdido" (em vez de vermelho)
    info: 'rgba(192, 132, 252, 0.5)',       // Roxo ainda mais claro para status "aberto" (em vez de azul)
    borders: {
      success: 'rgba(139, 92, 246, 1)',     // Roxo sólido
      danger: 'rgba(167, 139, 250, 1)',     // Roxo mais claro sólido
      info: 'rgba(192, 132, 252, 1)'        // Roxo ainda mais claro sólido
    }
  }
}

/**
 * Gerar dados para o gráfico de status
 * @param {Array} data - Dados filtrados 
 * @returns {Object} Configuração do gráfico de pizza
 */
export const createStatusChart = (data) => {
  const statusCounts = {
    Aberto: 0,
    Ganho: 0,
    Perdido: 0
  }
  
  // Contar status
  data.forEach(item => {
    if (item.status === 'Aberto') {
      statusCounts.Aberto++
    } else if (item.status === 'Ganho' || item.status === 'WON') {
      statusCounts.Ganho++
    } else if (item.status === 'Perdido' || item.status === 'LOST') {
      statusCounts.Perdido++
    }
  })
  
  return {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          chartColors.tertiary,
          chartColors.primary,
          chartColors.quaternary
        ],
        borderColor: [
          chartColors.borders.tertiary,
          chartColors.borders.primary,
          chartColors.borders.quaternary
        ],
        borderWidth: 1
      }]
    },
    options: {
      ...baseChartOptions,
      cutout: '60%'
    }
  }
}

/**
 * Agrupar dados por dia
 * @param {Array} data - Dados filtrados
 * @returns {Object} Dados agrupados por dia
 */
export const groupDataByDay = (data) => {
  const groupedByDay = {}
  
  data.forEach(item => {
    if (item.created_at) {
      // Extrair só a data (sem a hora)
      const date = item.created_at.split(' ')[0]
      
      if (!groupedByDay[date]) {
        groupedByDay[date] = 0
      }
      
      groupedByDay[date]++
    }
  })
  
  // Ordenar por data
  const sortedDates = Object.keys(groupedByDay).sort()
  
  return {
    labels: sortedDates,
    values: sortedDates.map(date => groupedByDay[date])
  }
}

/**
 * Criar gráfico de linha para dados por dia
 * @param {Object} groupedData - Dados agrupados por dia
 * @param {String} label - Rótulo para o dataset
 * @returns {Object} Configuração do gráfico de linha
 */
export const createLineChart = (groupedData, label) => {
  return {
    type: 'line',
    data: {
      labels: groupedData.labels,
      datasets: [{
        label: label,
        data: groupedData.values,
        backgroundColor: chartColors.primary,
        borderColor: chartColors.borders.primary,
        pointBackgroundColor: chartColors.borders.primary,
        fill: true
      }]
    },
    options: baseChartOptions
  }
}

/**
 * Criar gráfico de barras para exibir dados de desempenho por mês
 * @param {Array} data - Dados agrupados por mês
 * @returns {Object} Configuração do gráfico de barras
 */
export const createBarChart = (data, label = 'Valor') => {
  return {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: label,
        data: data.values,
        backgroundColor: chartColors.primary,
        borderColor: chartColors.borders.primary,
        borderWidth: 1
      }]
    },
    options: baseChartOptions
  }
}

/**
 * Criar configuração para gráfico de rosca com cores personalizadas
 * @param {Array} labels - Rótulos para o gráfico
 * @param {Array} data - Dados numéricos
 * @returns {Object} Configuração do gráfico
 */
export const createDoughnutChart = (labels, data, cutoutPercentage = '70%') => {
  // Gerar cores diferentes com base na paleta roxa
  const backgroundColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    chartColors.quinary
  ];
  
  const borderColors = [
    chartColors.borders.primary,
    chartColors.borders.secondary,
    chartColors.borders.tertiary,
    chartColors.borders.quaternary,
    chartColors.borders.quinary
  ];
  
  return {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      ...baseChartOptions,
      cutout: cutoutPercentage
    }
  }
} 