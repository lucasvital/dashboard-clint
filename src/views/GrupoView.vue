<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Detalhes do Grupo</h1>
    <p>ID do Grupo: {{ $route.params.grupoId }}</p>
    
    <!-- Aqui virá o conteúdo detalhado do grupo -->
    <div class="mt-4">
      <router-link to="/" class="text-blue-500 hover:underline">Voltar para o Dashboard</router-link>
    </div>
  </div>
</template>

<script setup>
// Lógica do componente virá aqui
</script> 