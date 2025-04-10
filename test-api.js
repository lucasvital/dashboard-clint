const axios = require('axios');

async function testLogin() {
  try {
    console.log("Tentando fazer login...");
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@admin.com',
      senha: 'admin123'
    }, {
      // Adicionar timeout para não ficar esperando indefinidamente
      timeout: 5000
    });
    
    console.log('Resposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request._currentUrl);
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro na configuração da requisição:', error.config);
    }
  }
}

testLogin(); 