<template>
  <div :class="darkMode ? 'dark bg-gray-900' : 'bg-slate-50'" class="min-h-screen transition-colors duration-300">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-purple-600 dark:text-purple-400">Dashboard Clint</h1>
        
        <!-- Menu de usuário -->
        <div class="relative">
          <button 
            @click="toggleUserMenu" 
            class="flex items-center space-x-2 rounded-full p-2 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors duration-200"
          >
            <span class="text-gray-700 dark:text-gray-300">Usuário</span>
            <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
          
          <!-- Menu dropdown -->
          <div 
            v-if="userMenuOpen" 
            class="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl z-10 border border-gray-200 dark:border-gray-700"
          >
            <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-700 dark:text-gray-300">Configurações</p>
            </div>
            
            <button 
              @click="toggleDarkMode" 
              class="w-full px-4 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <span v-if="darkMode" class="text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span v-else class="text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ darkMode ? 'Modo Claro' : 'Modo Escuro' }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="dark:bg-gray-900">
      <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Estado do tema escuro
const darkMode = ref(localStorage.getItem('darkMode') === 'true')
const userMenuOpen = ref(false)

// Alternar menu de usuário
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// Fechar menu quando clicar fora
window.addEventListener('click', (e) => {
  if (userMenuOpen.value && !e.target.closest('.relative')) {
    userMenuOpen.value = false
  }
})

// Alternar modo escuro
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value)
  
  // Aplica imediatamente a classe ao elemento html
  if (typeof document !== 'undefined') {
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // Fecha o menu após alternar o tema
  userMenuOpen.value = false
  
  // Disparar evento para notificar os componentes que usam temas personalizados
  window.dispatchEvent(new CustomEvent('theme-change', { 
    detail: { isDark: darkMode.value } 
  }))
}

// Observar mudanças no modo escuro e atualizar variáveis CSS
watch(darkMode, (newValue) => {
  // Aplicar classes ao elemento html para estilização global
  if (typeof document !== 'undefined') {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Disparar evento para notificar os componentes que usam temas personalizados
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { isDark: newValue } 
    }))
  }
}, { immediate: true })
</script>

<style>
/* Adicionando estilos globais para modo escuro */
.dark {
  --bg-primary: #1f2937;
  --text-primary: #f3f4f6;
}

.dark text,
.dark tspan {
  fill: var(--text-primary) !important;
}

/* Adicionando transições suaves para mudanças de tema */
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

html.dark {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style> 