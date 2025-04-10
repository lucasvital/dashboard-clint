<template>
  <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
    <h3 class="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Download Direto</h3>
    <p class="text-sm text-blue-600 dark:text-blue-400 mb-3">
      Se você está tendo problemas para carregar o CSV automaticamente, faça o download do arquivo diretamente:
    </p>
    <div class="flex flex-wrap gap-2">
      <button 
        v-for="(url, index) in downloadUrls" 
        :key="index"
        @click="downloadFile(url.url, url.filename)"
        class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        :disabled="downloading === url.url"
      >
        <svg v-if="downloading === url.url" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ url.label }}</span>
      </button>
    </div>
    <div v-if="error" class="mt-3 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>
    <div v-if="successMessage" class="mt-3 text-sm text-green-600 dark:text-green-400">
      {{ successMessage }}
    </div>
    <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
      <p>Os arquivos CSV são salvos diariamente. Tente uma data anterior se o arquivo atual não estiver disponível.</p>
      <p class="mt-1">Se o download não funcionar, tente carregar o arquivo usando o botão "Selecionar arquivo" acima.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { downloadCSVAsBlob } from '../utils/csv-fetch';

// Estado
const downloading = ref(null);
const error = ref(null);
const successMessage = ref(null);

// Função para fazer o download do arquivo
const downloadFile = async (url, filename) => {
  error.value = null;
  successMessage.value = null;
  downloading.value = url;
  
  try {
    await downloadCSVAsBlob(url, filename);
    successMessage.value = `Download iniciado: ${filename}`;
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    error.value = `Erro ao baixar arquivo: ${err.message}`;
  } finally {
    downloading.value = null;
  }
};

// Gerar URLs para download com base na data atual
const downloadUrls = computed(() => {
  // Obter data atual e formatá-la
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  
  // Criar array com datas para tentar (hoje e últimos 7 dias)
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    dates.push(`${d}-${m}-${y}`);
  }
  
  // Gerar URLs para download
  const urls = [];
  
  // URL do dia atual (mais provável)
  const fileName = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${formattedDate}.csv`;
  urls.push({
    label: `Baixar CSV (${formattedDate})`,
    url: `/resultados_api/${fileName}`,
    filename: fileName
  });
  
  // URLs para datas anteriores
  for (let i = 1; i < dates.length; i++) {
    const oldFileName = `[alberto_at_shortmidia.com.br]_Dados_Gerais_${dates[i]}.csv`;
    urls.push({
      label: `Tentar data anterior (${dates[i]})`,
      url: `/resultados_api/${oldFileName}`,
      filename: oldFileName
    });
  }
  
  return urls;
});
</script> 