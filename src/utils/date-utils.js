/**
 * Formata data para exibição no formato brasileiro (dd/mm/yyyy)
 * @param {Date} date - Objeto de data para formatar
 * @returns {String} Data formatada
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    throw new Error('Data inválida')
  }
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Formata data e hora para exibição (dd/mm/yyyy HH:MM)
 * @param {Date} date - Objeto de data para formatar
 * @returns {String} Data e hora formatadas
 */
export function formatDateTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    throw new Error('Data inválida')
  }
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Calcula intervalo de datas para filtros pré-definidos
 * @param {String} period - Período (today, week, month, etc)
 * @returns {Object} Objeto com datas de início e fim
 */
export function calculateDateRange(period) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  
  let startDate = new Date(today)
  
  switch (period) {
    case 'today':
      // Mantém startDate como hoje
      break
      
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1)
      endDate.setDate(endDate.getDate() - 1)
      break
      
    case 'last7days':
      startDate.setDate(startDate.getDate() - 6)
      break
      
    case 'thisWeek':
      // Início desta semana (domingo)
      const dayOfWeek = startDate.getDay()
      startDate.setDate(startDate.getDate() - dayOfWeek)
      break
      
    case 'lastWeek':
      // Início da semana passada
      const lastWeekDay = startDate.getDay()
      startDate.setDate(startDate.getDate() - lastWeekDay - 7)
      endDate.setDate(endDate.getDate() - lastWeekDay - 1)
      break
      
    case 'thisMonth':
      // Início deste mês
      startDate.setDate(1)
      break
      
    case 'lastMonth':
      // Mês anterior
      startDate.setMonth(startDate.getMonth() - 1)
      startDate.setDate(1)
      endDate.setDate(0) // Último dia do mês anterior
      break
      
    case 'thisYear':
      // Início deste ano
      startDate.setMonth(0, 1)
      break
      
    default:
      return null
  }
  
  return {
    start: startDate,
    end: endDate
  }
}

/**
 * Formata uma data para string no formato ISO (YYYY-MM-DD)
 * @param {Date} date - Data para formatar
 * @returns {String} Data no formato ISO
 */
export function toISODateString(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
} 