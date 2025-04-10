# Dashboard e Automação Clint Digital

Este projeto contém dois componentes principais:

1. **Dashboard para visualização** - Uma interface web construída com Vue.js e Tailwind CSS
2. **Scripts de automação** - Ferramentas para login automático e extração de dados

## Dashboard (Front-end)

### Tecnologias Utilizadas

- Vue.js 3 com Composition API
- Tailwind CSS para estilização
- Chart.js para visualização de dados
- Vite como bundler e servidor de desenvolvimento
- PapaParse para processamento de arquivos CSV

### Instalação e Execução do Dashboard

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Para build de produção:
```bash
npm run build
```

## Scripts de Automação

### Requisitos

- Python 3.6+
- Pip (gerenciador de pacotes Python)
- Chrome ou Chromium instalado

### Instalação

1. Instale as dependências necessárias:

```bash
pip install selenium python-dotenv schedule requests pandas openpyxl unidecode playwright
pip install seleniumwire  # Opcional, para método alternativo de captura
playwright install chromium
```

### Automação de Captura de Token JWT

O sistema agora inclui uma solução automatizada para capturar tokens JWT utilizados nas requisições à API GraphQL do Clint Digital, eliminando a necessidade de atualização manual dos tokens.

- **Abordagem em Cascata**: Três métodos diferentes são tentados em sequência:
  1. **Playwright** (`playwright_token.py`) - Mais eficiente e recomendado
  2. **Selenium Wire** (`interceptor_token.py`) - Método alternativo
  3. **Selenium LocalStorage** (`get_jwt_token.py`) - Fallback adicional

- **Configuração**:
  1. Certifique-se de que as credenciais estão no arquivo `.env`
  2. Execute `python playwright_token.py` para o primeiro login e captura
  3. O sistema gerencia automaticamente a validade do token (renova quando necessário)

- **Uso Automático**:
  - O script `export_via_api.py` agora utiliza automaticamente este sistema
  - Não é necessário atualizar manualmente o token no código

Para mais detalhes, consulte [README_token_auto.md](README_token_auto.md).

### Arquivo de Configuração

**IMPORTANTE**: O script utiliza um arquivo `.env` para armazenar as credenciais de acesso.
Este arquivo **NÃO** deve ser enviado para o repositório Git por questões de segurança.

1. Crie um arquivo `.env` na raiz do projeto com o seguinte formato:

```
email=seu_email@example.com
senha=sua_senha
api-token=seu_token_api
```

2. O arquivo `.gitignore` já está configurado para ignorar o arquivo `.env` e outros arquivos sensíveis.

### Scripts Disponíveis

#### 1. Ambiente de Desenvolvimento (com interface gráfica)

```bash
python login_clint.py
```

#### 2. Para VPS sem Interface Gráfica (headless)

```bash
python login_clint_vps.py
```

#### 3. Agendamento Automático

```bash
python schedule_login.py
```

#### 4. Exportação via API

```bash
python export_via_api.py
```

## Configurando o Repositório Git

Para configurar corretamente este repositório sem expor dados sensíveis:

1. O arquivo `.gitignore` está configurado para excluir:
   - Arquivos `.env` e outras variáveis de ambiente
   - Arquivos de log
   - Diretórios como `node_modules/`, `resultados/` e `resultados_api/`
   - Arquivos grandes e compactados (`.rar`, `.zip`, etc.)

2. Para conectar ao repositório remoto:

```bash
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
```

3. Adicione e comite os arquivos, excluindo os dados sensíveis:

```bash
git add .
git commit -m "Commit inicial"
git push -u origin main
```

## Funcionalidades Principais

### Dashboard
- Visualização de dados extraídos das origens
- Filtros por grupo, origem, data e usuário
- Gráficos e estatísticas de performance
- Suporte a tema claro/escuro
- Interface responsiva

### Scripts de Automação
- Login automático no Clint Digital
- Extração de dados de origens
- Exportação de dados via API GraphQL
- Agendamento de tarefas
- Geração de logs e relatórios

## Arquivos e Diretórios Importantes

```
/
├── src/                    # Código fonte do dashboard
│   ├── components/         # Componentes Vue
│   ├── utils/              # Utilitários JavaScript
│   ├── assets/             # Arquivos CSS e imagens
│   └── App.vue             # Componente principal
├── public/                 # Arquivos estáticos
├── resultados/             # Resultados da extração (ignorado no Git)
├── resultados_api/         # Resultados da API (ignorado no Git)
├── .env                    # Variáveis de ambiente (ignorado no Git)
├── login_clint.py          # Script de login com interface
├── login_clint_vps.py      # Script de login headless
├── schedule_login.py       # Script de agendamento
├── export_via_api.py       # Script de exportação via API
├── playwright_token.py     # Automação de captura de token JWT (Playwright)
├── interceptor_token.py    # Automação de captura de token JWT (Selenium Wire)
├── get_jwt_token.py        # Automação de captura de token JWT (localStorage)
├── token_data.json         # Dados do token JWT capturado (ignorado no Git)
└── README_token_auto.md    # Documentação da automação de token JWT
```

## Contribuição

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Comite suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request 

## Sistema de Banco de Dados Local

### Requisitos

- MySQL 5.7+ ou MariaDB 10.2+
- Node.js 14+ 
- NPM ou Yarn

### Configurando o Banco de Dados Local

1. Navegue até o diretório `database`:
   ```bash
   cd database
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o script de configuração:
   ```bash
   npm run setup
   ```

   Isso irá:
   - Criar o banco de dados `clint_db` (se não existir)
   - Criar as tabelas necessárias
   - Inserir dados de usuários iniciais

### Usuários Padrão

O script cria os seguintes usuários para teste:

| Nome        | Email                     | Senha    | Cargo        |
|-------------|---------------------------|----------|--------------|
| Admin       | admin@clint.com           | admin123 | Administrador|
| Lucas Vital | lucasvitalsilva17@gmail.com | lucas123 | Gerente      |
| João Silva  | joao.silva@exemplo.com    | joao123  | Analista     |
| Maria Santos| maria.santos@exemplo.com  | maria123 | Assistente   |

### Executando o Sistema Completo

Para configurar e iniciar todo o sistema de uma vez, execute:

```bash
node setup-all.js
```

Isso irá:
1. Verificar dependências
2. Instalar dependências do projeto
3. Configurar o banco de dados
4. Compilar o front-end
5. Iniciar o servidor

### Migrando para um Servidor

Quando estiver pronto para migrar para um ambiente de produção:

1. Configure o banco de dados no servidor usando os scripts em `database/`
2. Ajuste as variáveis de ambiente para conectar ao banco de dados:
   ```
   DB_HOST=seu_host_db
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=clint_db
   ```
3. Execute a compilação e inicialização:
   ```bash
   npm run build
   node server.js
   ```

Para mais detalhes, consulte [database/README.md](database/README.md). 