# Automação de Captura de Token JWT para APIs da Clint Digital

Este projeto implementa uma solução automatizada para capturar o token JWT utilizado nas chamadas às APIs GraphQL da Clint Digital. O sistema substitui a necessidade de colar manualmente tokens JWT desatualizados no código.

## Arquivos Implementados

1. **playwright_token.py**
   - Utiliza o Playwright para login automático e interceptação de requisições
   - Extrai tokens JWT das requisições GraphQL
   - Armazena tokens em cache para reuso
   - Gerencia validade do token por tempo

2. **get_jwt_token.py**
   - Implementação alternativa usando Selenium
   - Tenta extrair tokens do localStorage
   - Serve como fallback

3. **interceptor_token.py**
   - Implementação usando Selenium Wire
   - Fornecido como alternativa, mas requer configurações adicionais

## Como Funciona

1. **Autenticação Automática**:
   - Realiza login automatizado com credenciais do arquivo .env
   - Utiliza um navegador invisível ou visível (configurável)

2. **Captura do Token**:
   - Intercepta requisições para a API GraphQL
   - Identifica tokens JWT no cabeçalho Authorization
   - Extrai também o owner_id necessário para as requisições

3. **Armazenamento em Cache**:
   - Salva dados do token em token_data.json
   - Monitora a idade do token e renova automaticamente

4. **Integração com o export_via_api.py**:
   - A função get_auth_headers() foi atualizada para usar os novos métodos
   - Sistema de fallback em cascata: Playwright → Selenium Wire → Selenium → Token Estático

## Requisitos

- Python 3.8+
- Playwright:
  ```bash
  pip install playwright
  playwright install chromium
  ```
- Dotenv:
  ```bash
  pip install python-dotenv
  ```
- Outros requisitos:
  ```bash
  pip install pandas requests unidecode
  ```

## Configuração

1. Criar arquivo `.env` na raiz do projeto com:
   ```
   email=seu_email@dominio.com
   senha=sua_senha
   ```

2. Executar `python playwright_token.py` para realizar o primeiro login e capturar o token
   - Isso criará o arquivo token_data.json que será usado nas próximas execuções

3. Use `python export_via_api.py` normalmente - o sistema utiliza automaticamente o token capturado

## Vantagens

1. **Automação Completa**: Elimina a necessidade de obter e colar manualmente tokens
2. **Token Sempre Atualizado**: Gerencia a idade do token e o renova quando necessário
3. **Tolerância a Falhas**: Sistema em cascata tenta diferentes abordagens
4. **Sem Interrupções**: O sistema funciona mesmo em ambiente headless

## Manutenção

- Os tokens geralmente são válidos por várias horas
- O sistema verifica automaticamente a idade do token e o renova quando necessário
- Caso ocorra erro na captura automática, o sistema utiliza o token estático como último recurso

## Próximos Passos

1. Implementar suporte para múltiplas contas
2. Adicionar mecanismos de recuperação em caso de falha no login
3. Aprimorar a detecção de expiração do token 