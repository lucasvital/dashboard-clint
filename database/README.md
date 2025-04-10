# Configuração do Banco de Dados PostgreSQL para o Sistema Clint

Este diretório contém os scripts e instruções necessários para configurar o banco de dados PostgreSQL do sistema Clint.

## Requisitos

- PostgreSQL 12+ 
- Node.js 14+ (para executar o script de configuração)
- NPM ou Yarn
- Ferramentas de linha de comando do PostgreSQL (`createdb`, `psql`)

## Arquivos Incluídos

- `schema.sql`: Script SQL com a estrutura do banco de dados e dados iniciais
- `setup.js`: Script Node.js para executar a configuração automaticamente
- `package.json`: Dependências para o script de configuração

## Instruções para Configuração Manual

### Opção 1: Usando o PostgreSQL CLI

1. Crie o banco de dados:
   ```bash
   createdb -h localhost -U postgres clint_db
   ```

2. Execute o script SQL:
   ```bash
   psql -h localhost -U postgres -d clint_db -f schema.sql
   ```

### Opção 2: Usando o script Node.js automatizado

1. Instale as dependências:
   ```bash
   cd database
   npm install
   ```

2. Edite o arquivo `setup.js` para ajustar as configurações de conexão com seu banco de dados:
   ```javascript
   const dbConfig = {
     host: 'localhost',      // Host do banco de dados
     user: 'postgres',       // Usuário do PostgreSQL
     password: 'postgres',   // Senha do PostgreSQL
     port: 5432              // Porta padrão do PostgreSQL
   };
   ```

3. Se necessário, ajuste o caminho para os executáveis do PostgreSQL no arquivo `setup.js`:
   ```javascript
   // Caminho para os executáveis do PostgreSQL (ajuste conforme necessário)
   const pgBinPath = ''; // Deixe vazio para usar as variáveis de ambiente
   ```

4. Execute o script de configuração:
   ```bash
   npm run setup
   ```

## Migração para Ambiente de Produção

Para migrar o banco de dados para um ambiente de produção, siga estas etapas:

1. Ajuste as configurações de conexão no arquivo `setup.js` com os dados do servidor de produção.

2. Execute o script de configuração no servidor:
   ```bash
   npm run setup
   ```

3. Atualize as variáveis de ambiente no servidor para apontar para o novo banco de dados:
   ```
   DB_HOST=seu_host_postgres
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_PORT=5432
   DB_NAME=clint_db
   ```

## Usuários Padrão

O script cria automaticamente o seguinte usuário:

| Nome        | Email              | Senha    | Cargo        | Admin |
|-------------|--------------------| ---------|--------------| ------|
| Admin       | admin@admin.com    | admin123 | Administrador| Sim   |

> **Importante:** Em ambiente de produção, é altamente recomendado alterar as senhas padrão destes usuários.

## Gerando Hash de Senhas

Para gerar o hash de uma nova senha (útil para adicionar usuários ou alterar senhas), use:

```bash
npm run generate-hash "minhasenha123"
```

## Estrutura do Banco de Dados

### Tabela de Usuários (`usuarios`)

| Coluna           | Tipo         | Descrição                            |
|------------------|--------------|--------------------------------------|
| id               | SERIAL       | ID único (chave primária)            |
| nome             | VARCHAR(100) | Nome completo do usuário             |
| email            | VARCHAR(100) | Email do usuário (único)             |
| senha            | VARCHAR(255) | Senha hash do usuário                |
| cargo            | VARCHAR(50)  | Cargo/função do usuário              |
| data_criacao     | TIMESTAMP    | Data de criação do registro          |
| ultimo_login     | TIMESTAMP    | Data/hora do último login            |
| ativo            | BOOLEAN      | Se o usuário está ativo              |
| admin            | BOOLEAN      | Se o usuário tem privilégios admin   |
| token_reset_senha| VARCHAR(100) | Token para redefinição de senha      |
| expiracao_token  | TIMESTAMP    | Data de expiração do token           |

### Tabela de Log de Atividades (`log_atividades`)

| Coluna     | Tipo         | Descrição                        |
|------------|--------------|----------------------------------|
| id         | SERIAL       | ID único (chave primária)        |
| usuario_id | INTEGER      | ID do usuário (chave estrangeira)|
| acao       | VARCHAR(100) | Tipo de ação realizada           |
| descricao  | TEXT         | Descrição detalhada da ação      |
| data_hora  | TIMESTAMP    | Data/hora da ação                |
| ip         | VARCHAR(45)  | Endereço IP do usuário           | 