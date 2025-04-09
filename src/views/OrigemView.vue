<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Detalhes da Origem</h1>
    <p>ID da Origem: {{ $route.params.origemId }}</p>
    
    <!-- Aqui virá o conteúdo detalhado da origem -->
    <div class="mt-4">
      <router-link to="/" class="text-blue-500 hover:underline">Voltar para o Dashboard</router-link>
    </div>
  </div>
</template>

<script setup>
// Lógica do componente virá aqui
</script> 