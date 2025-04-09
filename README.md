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
pip install selenium python-dotenv schedule
```

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
└── export_via_api.py       # Script de exportação via API
```

## Contribuição

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Comite suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request 