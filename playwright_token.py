import os
import json
import time
import logging
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from playwright.async_api import async_playwright

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clint_token_playwright.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém as credenciais do arquivo .env
EMAIL = os.getenv('email')
SENHA = os.getenv('senha')

async def intercept_jwt_token():
    """
    Intercepta o token JWT das requisições para a API GraphQL do Clint usando Playwright
    
    Returns:
        dict: Dicionário contendo o token JWT e outras informações relevantes
    """
    logger.info("Iniciando interceptação de token JWT com Playwright...")
    
    token_data = None
    
    async with async_playwright() as p:
        # Lança o navegador
        browser = await p.chromium.launch(headless=False)  # Definir como True para modo sem interface
        
        # Cria um contexto de navegador
        context = await browser.new_context()
        
        # Cria uma lista para armazenar as requisições que contêm token JWT
        jwt_requests = []
        
        # Configura a interceptação de requisições
        async def handle_request(route, request):
            # Só intercepta requisições para a API GraphQL
            if 'graph.clint.digital' in request.url:
                headers = request.headers
                if 'authorization' in headers:
                    auth_header = headers.get('authorization')
                    if auth_header and auth_header.startswith('Bearer '):
                        jwt_token = auth_header.split(' ')[1]
                        # Verifica se é um token JWT válido
                        if jwt_token.count('.') == 2 and jwt_token.startswith('eyJ'):
                            owner_id = headers.get('x-hasura-owner-id')
                            jwt_requests.append({
                                'url': request.url,
                                'method': request.method,
                                'jwt_token': jwt_token,
                                'owner_id': owner_id,
                                'timestamp': datetime.now().isoformat()
                            })
                            logger.info(f"Interceptado token JWT em requisição para: {request.url}")
            
            # Continua a requisição normalmente
            await route.continue_()
        
        # Ativa a interceptação de requisições
        await context.route('**/*', handle_request)
        
        # Cria uma nova página
        page = await context.new_page()
        
        try:
            # Navega para a página de login
            await page.goto('https://app.clint.digital/origin')
            logger.info("Página acessada com sucesso!")
            
            # Preenche o formulário de login
            await page.fill('input[name="email"]', EMAIL)
            logger.info("Email preenchido!")
            
            await page.fill('input[name="password"]', SENHA)
            logger.info("Senha preenchida!")
            
            # Clica no botão de login
            await page.click('button[type="submit"]')
            logger.info("Botão de login clicado!")
            
            # Espera a navegação completar
            await page.wait_for_url('**/origin/**', timeout=30000)
            logger.info(f"URL após login: {page.url}")
            
            # Espera alguns segundos para que requisições GraphQL sejam feitas
            await asyncio.sleep(5)
            
            # Navega para a página principal para gerar mais requisições
            await page.goto('https://app.clint.digital/origin')
            logger.info("Navegando para a página principal...")
            
            # Espera mais alguns segundos
            await asyncio.sleep(5)
            
            # Tenta interagir com elementos na página para gerar mais requisições
            try:
                # Clica em alguns elementos na página
                await page.click('.group-accordion', timeout=5000)
                await asyncio.sleep(2)
                await page.click('button:visible', timeout=5000)
                await asyncio.sleep(2)
            except Exception as e:
                logger.warning(f"Erro ao interagir com elementos: {str(e)}")
            
            # Verifica se capturamos algum token JWT
            if jwt_requests:
                # Usa o token mais recente
                latest_request = jwt_requests[-1]
                jwt_token = latest_request['jwt_token']
                owner_id = latest_request['owner_id']
                
                logger.info(f"Token JWT capturado com sucesso! (primeiros 20 caracteres): {jwt_token[:20]}...")
                
                if owner_id:
                    logger.info(f"owner_id obtido: {owner_id}")
                else:
                    # Se não encontrou o owner_id nos headers, tenta extrair do token
                    try:
                        # Decodifica a parte do payload do token
                        import base64
                        payload_part = jwt_token.split('.')[1]
                        # Adiciona padding se necessário
                        padding = len(payload_part) % 4
                        if padding:
                            payload_part += '=' * (4 - padding)
                        
                        # Converte de base64 para string e carrega como JSON
                        payload_json = base64.b64decode(payload_part).decode('utf-8')
                        payload = json.loads(payload_json)
                        
                        # Tenta extrair o owner_id das claims do token
                        if 'owner_id' in payload:
                            owner_id = payload['owner_id']
                        elif 'https://hasura.io/jwt/claims' in payload and 'x-hasura-owner-id' in payload['https://hasura.io/jwt/claims']:
                            owner_id = payload['https://hasura.io/jwt/claims']['x-hasura-owner-id']
                        
                        if owner_id:
                            logger.info(f"owner_id extraído do token: {owner_id}")
                    except Exception as e:
                        logger.warning(f"Erro ao decodificar token: {str(e)}")
                
                # Salva os dados do token
                token_data = {
                    "jwt_token": jwt_token,
                    "owner_id": owner_id,
                    "timestamp": datetime.now().isoformat(),
                    "request_url": latest_request['url'],
                    "request_method": latest_request['method']
                }
                
                # Salva em arquivo JSON
                try:
                    with open('token_data.json', 'w') as f:
                        json.dump(token_data, f, indent=2)
                        logger.info("Dados do token salvos em token_data.json")
                except Exception as e:
                    logger.error(f"Erro ao salvar dados do token: {str(e)}")
            else:
                logger.error("Não foi encontrado token JWT nas requisições")
                
                # Tenta verificar o que tem no localStorage
                localStorage = await page.evaluate("""() => {
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        const value = localStorage.getItem(key);
                        keys.push({
                            key: key,
                            valuePreview: value.length > 50 ? value.substring(0, 50) + '...' : value
                        });
                    }
                    return keys;
                }""")
                
                logger.info(f"Chaves encontradas no localStorage: {json.dumps(localStorage, indent=2)}")
        
        except Exception as e:
            logger.error(f"Erro durante intercepção do token: {str(e)}")
        
        finally:
            # Fecha o navegador
            await browser.close()
            logger.info("Navegador fechado")
    
    return token_data

def get_auth_headers_from_playwright():
    """
    Retorna os headers de autenticação usando o token JWT interceptado via Playwright
    
    Returns:
        dict: Headers de autenticação para requisições à API
    """
    # Executa a função assíncrona para interceptar o token
    token_data = asyncio.run(intercept_jwt_token())
    
    if not token_data:
        logger.error("Falha ao obter dados do token!")
        return None
    
    # Preparar o Authorization header com o prefixo Bearer
    jwt_token = token_data.get('jwt_token')
    owner_id = token_data.get('owner_id')
    
    if not jwt_token:
        logger.error("Dados do token inválidos!")
        return None
    
    auth_token = f"Bearer {jwt_token}"
    
    # Cria os headers de autenticação
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token,
        'origin': 'https://app.clint.digital',
        'referer': 'https://app.clint.digital/'
    }
    
    # Adiciona o header x-hasura-owner-id se disponível
    if owner_id:
        headers['x-hasura-owner-id'] = owner_id
    
    logger.info(f"Headers de autenticação preparados com token (primeiros 20 caracteres): {auth_token[:20]}...")
    
    return headers

def get_cached_auth_headers():
    """
    Retorna os headers de autenticação usando o token JWT armazenado em cache
    ou obtém um novo caso seja necessário.
    
    Returns:
        dict: Headers de autenticação para requisições à API
    """
    try:
        # Primeiro tenta ler o arquivo de token
        if os.path.exists('token_data.json'):
            with open('token_data.json', 'r') as f:
                token_data = json.load(f)
                
            # Verifica a idade do token (opcional, dependendo da validade do token)
            token_timestamp = datetime.fromisoformat(token_data.get('timestamp', '2000-01-01T00:00:00'))
            now = datetime.now()
            token_age_hours = (now - token_timestamp).total_seconds() / 3600
            
            # Se o token tiver mais de 12 horas, obtém um novo
            if token_age_hours > 12:
                logger.info(f"Token tem {token_age_hours:.1f} horas. Obtendo novo token...")
                token_data = asyncio.run(intercept_jwt_token())
            else:
                logger.info(f"Usando token existente com {token_age_hours:.1f} horas de idade")
        else:
            # Se não existir arquivo de token, obtém um novo
            logger.info("Arquivo de token não encontrado. Obtendo novo token...")
            token_data = asyncio.run(intercept_jwt_token())
        
        if not token_data:
            logger.error("Falha ao obter dados do token!")
            return None
        
        # Preparar o Authorization header com o prefixo Bearer
        jwt_token = token_data.get('jwt_token')
        owner_id = token_data.get('owner_id')
        
        if not jwt_token:
            logger.error("Dados do token inválidos!")
            return None
        
        auth_token = f"Bearer {jwt_token}"
        
        # Cria os headers de autenticação
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth_token,
            'origin': 'https://app.clint.digital',
            'referer': 'https://app.clint.digital/'
        }
        
        # Adiciona o header x-hasura-owner-id se disponível
        if owner_id:
            headers['x-hasura-owner-id'] = owner_id
        
        logger.info(f"Headers de autenticação preparados com token (primeiros 20 caracteres): {auth_token[:20]}...")
        
        return headers
    
    except Exception as e:
        logger.error(f"Erro ao obter headers de autenticação: {str(e)}")
        return None

if __name__ == "__main__":
    # Se executado diretamente, obtém o token e exibe os headers
    headers = get_cached_auth_headers()
    if headers:
        print("\nHeaders de autenticação para uso nas APIs:")
        for key, value in headers.items():
            if key == 'Authorization':
                # Mostra apenas parte do token por segurança
                print(f"{key}: Bearer {value.split(' ')[1][:20]}...")
            else:
                print(f"{key}: {value}")
    else:
        print("\nNão foi possível obter o token JWT. Verifique os logs para mais detalhes.") 