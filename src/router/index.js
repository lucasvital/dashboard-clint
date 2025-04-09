import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/grupos/:grupoId',
    name: 'Grupo',
    component: () => import('../views/GrupoView.vue')
  },
  {
    path: '/origens/:origemId',
    name: 'Origem',
    component: () => import('../views/OrigemView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 