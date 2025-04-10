/**
 * Módulo para lidar com chamadas de API relacionadas a autenticação
 */
import axios from 'axios';

// Configurar instância do Axios com a URL base da API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir o token em todas as requisições
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Realizar login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário e token
 */
export async function login(email, senha) {
  try {
    const response = await apiClient.post('/auth/login', { email, senha });
    
    // Armazenar o token no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error.response?.data || error;
  }
}

/**
 * Registrar novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Usuário criado e token
 */
export async function registrar(userData) {
  try {
    const response = await apiClient.post('/auth/signup', userData);
    
    // Armazenar o token no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error.response?.data || error;
  }
}

/**
 * Verificar se um usuário está autenticado
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export async function verificarAutenticacao() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    throw error.response?.data || error;
  }
}

/**
 * Realizar logout do usuário
 */
export function logout() {
  localStorage.removeItem('token');
}

export default {
  login,
  registrar,
  verificarAutenticacao,
  logout
}; 