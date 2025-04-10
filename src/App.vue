<template>
  <div class="app-container" :class="{ 'auth-route': isAuthRoute }">
    <!-- Cabeçalho (oculto nas rotas de autenticação) -->
    <header v-if="!isAuthRoute" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
             <h1 class="text-xl font-bold text-purple-600 dark:text-purple-400">Dashboard Clint</h1>
   
        <!-- Botões de ação -->
        <div class="flex items-center space-x-4">
          <!-- Botão de alternância de tema -->
          <button 
            @click="toggleTheme"
            class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            :title="isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
          >
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- Perfil do usuário -->
          <div class="flex items-center space-x-2 relative">
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ userName }}</span>
            <div class="w-8 h-8 rounded-full overflow-hidden cursor-pointer" @click="toggleUserMenu">
              <img :src="userAvatar" alt="Avatar" class="w-full h-full object-cover" />
            </div>
            
            <!-- Menu do usuário -->
            <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10">
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userName || 'Convidado' }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ userEmail }}</p>
              </div>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Meu Perfil
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Configurações
              </a>
              <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                Sair
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Conteúdo principal -->
    <main :class="{ 'full-width': isAuthRoute }">
      <Transition name="fade" mode="out-in">
        <router-view />
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Acessar a rota atual
const route = useRoute()
const router = useRouter()

// Verificar se está em uma rota de autenticação (login ou cadastro)
const isAuthRoute = computed(() => {
  return route.path === '/login' || route.path === '/signup'
})

// Estado para o modo escuro
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
const userMenuOpen = ref(false)

// Dados do usuário
const userName = ref(localStorage.getItem('userName') || '')
const userEmail = ref(localStorage.getItem('userEmail') || '')
const userAvatar = ref(localStorage.getItem('userAvatar') || '')

// Função para alternar o modo escuro
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value)
  applyTheme()
}

// Função para atualizar o tema com base no estado atual
const applyTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Inicializar o tema ao carregar a aplicação
onMounted(() => {
  // Verificar se há preferência de tema salva
  if (localStorage.getItem('darkMode') === null) {
    // Se não houver, verificar preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    localStorage.setItem('darkMode', prefersDark)
  }
  applyTheme()
  
  // Atualizar informações do usuário
  refreshUserInfo()
})

// Função para atualizar as informações do usuário
const refreshUserInfo = () => {
  userName.value = localStorage.getItem('userName') || ''
  userEmail.value = localStorage.getItem('userEmail') || ''
  
  // Verificar se existe um avatar ou gerar um novo
  let storedAvatar = localStorage.getItem('userAvatar')
  if (!storedAvatar && localStorage.getItem('isAuthenticated') === 'true') {
    // Gerar avatar aleatório e armazenar
    const avatarStyles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'personas', 'pixel-art'];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const seed = Date.now() + Math.floor(Math.random() * 10000);
    storedAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
    localStorage.setItem('userAvatar', storedAvatar);
  }
  
  // Usar um avatar padrão se não estiver autenticado
  userAvatar.value = storedAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=guest';
}

// Observar mudanças no modo escuro
watchEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e) => {
    // Apenas aplicar preferência do sistema se não houver preferência salva
    if (localStorage.getItem('darkMode') === null) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  }
  
  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
})

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

// Observar mudança de rota
watch(() => route.path, (newPath, oldPath) => {
  // Se estiver saindo de uma rota de autenticação
  if ((oldPath === '/login' || oldPath === '/signup') && 
      (newPath !== '/login' && newPath !== '/signup')) {
    document.body.classList.remove('auth-page-body');
  }
  
  // Atualizar informações do usuário quando a rota mudar
  refreshUserInfo()
}, { immediate: true });

// Função para logout
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userAvatar')
  router.push('/login')
  userMenuOpen.value = false
}
</script>

<style>
@import './assets/styles.css';

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.app-container {
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-container:not(.auth-route) {
  background-color: var(--bg-light);
  color: var(--text-light);
}

.dark .app-container:not(.auth-route) {
  background-color: var(--bg-dark);
  color: var(--text-dark);
}

main {
  flex: 1;
  padding: 1.5rem;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

main.full-width {
  padding: 0;
  max-width: none;
}

/* Animações de transição entre rotas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.card {
  transition: all 0.3s ease;
}

.filter-dropdown {
  min-height: 42px;
}
</style> 