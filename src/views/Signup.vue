<template>
  <div class="auth-page">
    <!-- Fundo animado com partículas -->
    <div class="particles-container">
      <div v-for="i in 20" :key="i" class="particle"></div>
    </div>

    <!-- Formas flutuantes no fundo -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <!-- Container principal com efeito de vidro -->
    <div class="auth-container">
      <!-- Aba de alternância entre login e cadastro -->
      <div class="auth-tabs">
        <router-link to="/login" class="tab">Login</router-link>
        <router-link to="/signup" class="tab active">Cadastro</router-link>
      </div>

      <div class="auth-content">
        <!-- Logotipo animado -->
        <div class="logo-container">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
        </div>

        <h1 class="auth-title">Crie sua conta</h1>
        <p class="auth-subtitle">Comece a gerenciar seus leads hoje</p>

        <!-- Mensagem de erro -->
        <div v-if="errorMessage" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Formulário de cadastro com animação de slide-in -->
        <form @submit.prevent="handleSignup" class="auth-form">
          <!-- Nome completo -->
          <div class="form-group">
            <label for="name">Nome completo</label>
            <div class="input-container">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input 
                id="name" 
                type="text" 
                v-model="name" 
                required 
                placeholder="Seu nome completo" 
                autocomplete="name"
              />
              <span class="input-focus-border"></span>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-container">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input 
                id="email" 
                type="email" 
                v-model="email" 
                required 
                placeholder="seu@email.com" 
                autocomplete="email"
              />
              <span class="input-focus-border"></span>
            </div>
          </div>

          <!-- Senha -->
          <div class="form-group">
            <label for="password">Senha</label>
            <div class="input-container">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
              </span>
              <input 
                id="password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                required 
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <span class="input-focus-border"></span>
              <button 
                type="button" 
                class="password-toggle" 
                @click="togglePasswordVisibility"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <p class="input-hint">A senha deve ter pelo menos 8 caracteres</p>
          </div>

          <!-- Confirmar senha -->
          <div class="form-group">
            <label for="confirmPassword">Confirme a senha</label>
            <div class="input-container">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12l2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </span>
              <input 
                id="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                required 
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <span class="input-focus-border"></span>
              <button 
                type="button" 
                class="password-toggle" 
                @click="toggleConfirmPasswordVisibility"
              >
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Termos e condições -->
          <div class="form-group terms-check">
            <label class="checkbox-container">
              <input type="checkbox" v-model="terms" required>
              <span class="checkmark"></span>
              <span>
                Eu aceito os <a href="#" class="terms-link">Termos de Serviço</a> e a 
                <a href="#" class="terms-link">Política de Privacidade</a>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            class="auth-button"
            :disabled="!canSubmit || isLoading"
            :class="{'disabled': !canSubmit || isLoading}"
          >
            <span v-if="!isLoading">Criar minha conta</span>
            <div v-else class="button-loader"></div>
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <div class="auth-footer">
          <p>Já tem uma conta?</p>
          <router-link to="/login" class="auth-link">Fazer login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { registrar } from '../services/api.js'

// Estado do formulário
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Router
const router = useRouter()

// Verificar se pode enviar o formulário
const canSubmit = computed(() => {
  return (
    name.value.trim() !== '' && 
    email.value.trim() !== '' && 
    password.value.length >= 8 && 
    password.value === confirmPassword.value && 
    terms.value
  )
})

// Mostrar/esconder senha
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Mostrar/esconder confirmação de senha
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Efeito de foco e blur nos inputs
const handleFocus = (e) => {
  e.target.parentNode.classList.add('focused')
}

const handleBlur = (e) => {
  if (e.target.value === '') {
    e.target.parentNode.classList.remove('focused')
  }
}

// Função de cadastro
const handleSignup = async () => {
  if (!canSubmit.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Chamada real à API para cadastro
    const response = await registrar({
      nome: name.value,
      email: email.value,
      senha: password.value,
      cargo: 'Usuário' // Cargo padrão
    })
    
    // Armazenar o token (já foi feito pela API)
    localStorage.setItem('isAuthenticated', 'true')
    
    // Armazenar informações do usuário
    localStorage.setItem('userEmail', response.usuario.email)
    localStorage.setItem('userName', response.usuario.nome.split(' ')[0])
    
    // Redirecionar para a página principal
    router.push('/')
  } catch (error) {
    console.error('Erro no cadastro:', error)
    // Mostrar mensagem de erro
    errorMessage.value = error.error || 'Erro ao criar conta. Por favor, tente novamente.'
  } finally {
    isLoading.value = false
  }
}

// Configurações de eventos e classes ao montar o componente
onMounted(() => {
  // Adicionar classe ao body para estilização global
  document.body.classList.add('auth-page-body')
  
  // Adicionar eventos de foco e blur para todos os inputs
  const inputs = document.querySelectorAll('input')
  inputs.forEach(input => {
    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)
    
    // Verificar se o input já tem valor ao carregar
    if (input.value !== '') {
      input.parentNode.classList.add('focused')
    }
  })
  
  // Iniciar animação de partículas
  initParticles()
})

// Animação de partículas
const initParticles = () => {
  const particles = document.querySelectorAll('.particle')
  particles.forEach(particle => {
    // Posição aleatória
    const x = Math.random() * 100
    const y = Math.random() * 100
    particle.style.left = `${x}%`
    particle.style.top = `${y}%`
    
    // Tamanho aleatório
    const size = Math.random() * 60 + 20
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    
    // Opacidade aleatória
    const opacity = Math.random() * 0.5 + 0.1
    particle.style.opacity = opacity
    
    // Animação aleatória
    const duration = Math.random() * 20 + 10
    particle.style.animationDuration = `${duration}s`
    
    // Delay aleatório
    const delay = Math.random() * 5
    particle.style.animationDelay = `${delay}s`
  })
}

// Limpar classes e eventos ao desmontar o componente
onUnmounted(() => {
  document.body.classList.remove('auth-page-body')
  
  const inputs = document.querySelectorAll('input')
  inputs.forEach(input => {
    input.removeEventListener('focus', handleFocus)
    input.removeEventListener('blur', handleBlur)
  })
})
</script>

<style scoped>
/* Estilização do body */
:global(.auth-page-body) {
  overflow-x: hidden;
  background: #060714;
  margin: 0;
  padding: 0;
}

/* Container principal da página */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
  background: linear-gradient(to right, #13111C, #17153A);
}

/* Animação de partículas de fundo */
.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(142, 45, 226, 0.8) 0%, rgba(142, 45, 226, 0) 70%);
  border-radius: 50%;
  animation: float 15s infinite linear;
  z-index: 1;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    transform: translate(30px, -50px) rotate(120deg) scale(1.1);
  }
  66% {
    transform: translate(-20px, 40px) rotate(240deg) scale(0.9);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

/* Formas flutuantes decorativas */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation: morphing 15s ease-in-out infinite;
}

.shape-1 {
  top: 15%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, rgba(131, 58, 180, 0.1), rgba(253, 29, 29, 0.05));
  animation-duration: 17s;
}

.shape-2 {
  bottom: 10%;
  right: 10%;
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, rgba(76, 0, 255, 0.1), rgba(29, 161, 253, 0.05));
  animation-duration: 22s;
  animation-delay: 2s;
}

.shape-3 {
  top: 60%;
  left: 15%;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, rgba(219, 39, 119, 0.1), rgba(255, 102, 0, 0.05));
  animation-duration: 13s;
  animation-delay: 1s;
}

.shape-4 {
  top: 10%;
  right: 20%;
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, rgba(0, 208, 132, 0.1), rgba(29, 161, 253, 0.05));
  animation-duration: 19s;
  animation-delay: 3s;
}

@keyframes morphing {
  0% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
  25% { 
    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
  }
  75% {
    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
  }
  100% {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  }
}

/* Container do formulário com efeito de vidro */
.auth-container {
  position: relative;
  z-index: 10;
  max-width: 500px;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Abas de navegação Login/Cadastro */
.auth-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 1.25rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
}

.tab.active {
  color: white;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(to right, #8E2DE2, #4A00E0);
  border-radius: 10px 10px 0 0;
}

.tab:hover {
  color: white;
}

/* Conteúdo do formulário */
.auth-content {
  padding: 2.5rem;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  color: #8E2DE2;
  animation: pulse 2s infinite;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: rotate(10deg) scale(1.05);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(142, 45, 226, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(142, 45, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(142, 45, 226, 0);
  }
}

.auth-title {
  color: white;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  animation: fadeInUp 0.8s;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  animation: fadeInUp 0.9s;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Formulário */
.auth-form {
  animation: fadeInUp 1s;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-container.focused {
  background: rgba(255, 255, 255, 0.1);
}

.input-container:hover {
  background: rgba(255, 255, 255, 0.07);
}

.input-icon {
  position: absolute;
  left: 16px;
  color: rgba(255, 255, 255, 0.4);
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
}

.input-container.focused .input-icon {
  color: #8E2DE2;
}

.input-container input {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  padding: 16px 16px 16px 48px;
  font-size: 1rem;
  outline: none;
}

.input-container input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #8E2DE2, #4A00E0);
  transition: width 0.3s ease;
}

.input-container.focused .input-focus-border {
  width: 100%;
}

.input-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* Botão de mostrar/esconder senha */
.password-toggle {
  position: absolute;
  right: 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: white;
}

/* Checkbox de termos */
.terms-check {
  margin-bottom: 2rem;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  padding-left: 30px;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 2px;
  left: 0;
  height: 20px;
  width: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.checkbox-container:hover .checkmark {
  background: rgba(255, 255, 255, 0.1);
}

.checkbox-container input:checked ~ .checkmark {
  background: linear-gradient(to right, #8E2DE2, #4A00E0);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.terms-link {
  color: #8E2DE2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #4A00E0;
  text-decoration: underline;
}

/* Botão de cadastro */
.auth-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #8E2DE2, #4A00E0);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(142, 45, 226, 0.3);
}

.auth-button:active {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: none;
}

.auth-button svg {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.auth-button:hover svg {
  transform: translateX(5px);
}

/* Animação do botão de loading */
.button-loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Footer do form */
.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  animation: fadeInUp 1.2s;
}

.auth-link {
  color: #8E2DE2;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #4A00E0;
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 500px) {
  .auth-container {
    max-width: 100%;
  }
  
  .auth-content {
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .logo {
    width: 50px;
    height: 50px;
  }
}

/* Adicione o estilo para a mensagem de erro */
.error-message {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  animation: shake 0.5s;
}

.error-message svg {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
</style> 