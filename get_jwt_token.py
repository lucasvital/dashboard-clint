import os
import time
import json
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import sys

# Configuração de codificação
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    
# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clint_jwt_token.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém as credenciais do arquivo .env
EMAIL = os.getenv('email')
SENHA = os.getenv('senha')

def extract_jwt_token():
    """
    Extrai o token JWT do localStorage do navegador após fazer login no Clint
    
    Returns:
        dict: Dicionário contendo o token JWT e o owner_id
    """
    logger.info("Iniciando extração do token JWT da Clint Digital...")
    
    # Configuração do Chrome
    chrome_options = Options()
    
    # Descomentar para modo headless (sem interface gráfica)
    # chrome_options.add_argument("--headless")
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Inicializa o driver do Chrome
    try:
        driver = webdriver.Chrome(options=chrome_options)
        logger.info("Webdriver iniciado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao iniciar o webdriver: {str(e)}")
        return None
    
    token_data = None
    
    try:
        # Acessa a página de login
        driver.get("https://app.clint.digital/origin")
        logger.info("Página acessada com sucesso!")
        
        # Aguarda o carregamento do formulário de login
        wait = WebDriverWait(driver, 20)
        
        # Preenche o campo de email
        email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        email_field.clear()
        email_field.send_keys(EMAIL)
        logger.info("Email preenchido!")
        
        # Preenche o campo de senha
        password_field = wait.until(EC.presence_of_element_located((By.NAME, "password")))
        password_field.clear()
        password_field.send_keys(SENHA)
        logger.info("Senha preenchida!")
        
        # Clica no botão de login
        login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
        login_button.click()
        logger.info("Botão de login clicado!")
        
        # Aguarda o redirecionamento após o login
        time.sleep(5)  # Espera alguns segundos para o login processar
        
        logger.info(f"URL atual após login: {driver.current_url}")
        
        # Verifica se o login foi bem-sucedido
        if "/login" in driver.current_url:
            logger.error("Login falhou. Ainda na página de login.")
            return None
        
        # Aguarda mais alguns segundos para garantir que o localStorage seja populado
        time.sleep(3)
        
        # Lista todas as chaves do localStorage para debug
        localStorage_keys = driver.execute_script("""
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
        """)
        
        logger.info(f"Chaves encontradas no localStorage: {json.dumps(localStorage_keys, indent=2)}")
        
        # Tenta diferentes nomes para o token JWT
        potential_token_keys = [
            'token',                   # Nome padrão
            'auth_token',              # Outro nome comum
            'jwt_token',               # Outro nome comum
            'accessToken',             # Outro nome comum
            'jwtToken',                # CamelCase
            'authToken',               # CamelCase
            'userToken',               # Outro nome possível
            'clint_token',             # Nome específico para a aplicação
            'clintJWT',                # Nome específico para a aplicação
            'user_session',            # Outro nome possível para sessão
            'session'                  # Outro nome possível
        ]
        
        token = None
        token_key_used = None
        
        # Procura o token JWT nas possíveis chaves
        for key in potential_token_keys:
            potential_token = driver.execute_script(f"return localStorage.getItem('{key}');")
            if potential_token and ('eyJ' in potential_token):  # Tokens JWT geralmente começam com 'eyJ'
                token = potential_token
                token_key_used = key
                logger.info(f"Token JWT encontrado na chave '{key}'")
                break
        
        # Se não encontrou o token nas chaves conhecidas, tenta buscar em todas as chaves
        if not token:
            logger.info("Buscando o token JWT em todas as chaves do localStorage...")
            all_items = driver.execute_script("""
                const items = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    items[key] = localStorage.getItem(key);
                }
                return items;
            """)
            
            for key, value in all_items.items():
                if isinstance(value, str) and 'eyJ' in value:
                    token = value
                    token_key_used = key
                    logger.info(f"Token JWT encontrado na chave inesperada '{key}'")
                    break
        
        # Tenta extrair o token usando uma abordagem alternativa: capturar os headers das requisições
        if not token:
            logger.info("Tentando extrair o token observando as requisições de rede...")
            # Navega para uma página que fará requisições GraphQL
            driver.get("https://app.clint.digital/origin")
            time.sleep(3)
            
            # Executa script para observar os headers de requisições
            token = driver.execute_script("""
                // Define uma função para ser chamada quando houver solicitações
                return new Promise((resolve) => {
                    // Configura o observer para monitorar requisições
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        for (const entry of entries) {
                            if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                                console.log('Detected request:', entry.name);
                                if (entry.name.includes('graph.clint.digital')) {
                                    // Tenta encontrar o token nos headers
                                    resolve('Detected GraphQL request to Clint');
                                }
                            }
                        }
                    });
                    
                    // Inicia a observação de requisições
                    observer.observe({ entryTypes: ['resource'] });
                    
                    // Simula algumas interações para gerar requisições
                    document.body.click();
                    
                    // Define um timeout para resolver após 5 segundos se nada for encontrado
                    setTimeout(() => {
                        resolve(null);
                    }, 5000);
                });
            """)
            
            logger.info(f"Resultado da observação de requisições: {token}")
            
            # Se ainda não encontrou, tenta capturar headers das requisições XHR
            if not token:
                logger.info("Procurando o token diretamente no DOM em data-attributes")
                token_from_dom = driver.execute_script("""
                    // Procura por elementos que podem conter o token em data-attributes
                    const elements = document.querySelectorAll('*[data-token], *[data-auth-token], *[data-jwt]');
                    for (const el of elements) {
                        const token = el.dataset.token || el.dataset.authToken || el.dataset.jwt;
                        if (token && token.startsWith('eyJ')) {
                            return token;
                        }
                    }
                    return null;
                """)
                
                if token_from_dom:
                    token = token_from_dom
                    logger.info("Token encontrado em atributos de dados no DOM")
        
        if not token:
            logger.error("Token não encontrado no localStorage ou via outros métodos!")
            
            # Última tentativa: tentar capturar via network requests
            logger.info("Última tentativa: analisando cookies e armazenamento da sessão")
            cookies = driver.get_cookies()
            logger.info(f"Cookies encontrados: {json.dumps(cookies, indent=2)}")
            
            session_storage = driver.execute_script("""
                const items = {};
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    items[key] = sessionStorage.getItem(key);
                }
                return items;
            """)
            logger.info(f"Itens no sessionStorage: {json.dumps(session_storage, indent=2)}")
            
            return None
        
        logger.info(f"Token JWT obtido com sucesso! (primeiros 20 caracteres): {token[:20]}...")
        
        # Extrair owner_id do token JWT
        # Decodifica a parte do payload do token
        payload_part = token.split('.')[1]
        # Adiciona padding se necessário
        padding = len(payload_part) % 4
        if padding:
            payload_part += '=' * (4 - padding)
        # Converte de base64 para string e carrega como JSON
        import base64
        payload_json = base64.b64decode(payload_part).decode('utf-8')
        payload = json.loads(payload_json)
        
        # Extrai o owner_id das claims do token
        owner_id = None
        if 'owner_id' in payload:
            owner_id = payload['owner_id']
        elif 'https://hasura.io/jwt/claims' in payload and 'x-hasura-owner-id' in payload['https://hasura.io/jwt/claims']:
            owner_id = payload['https://hasura.io/jwt/claims']['x-hasura-owner-id']
        
        if not owner_id:
            logger.warning("owner_id não encontrado no token JWT!")
        else:
            logger.info(f"owner_id extraído do token: {owner_id}")
        
        # Retorna os dados do token
        token_data = {
            "jwt_token": token,
            "owner_id": owner_id,
            "timestamp": datetime.now().isoformat()
        }
        
        # Salva os dados do token em um arquivo JSON
        try:
            with open('token_data.json', 'w') as f:
                json.dump(token_data, f, indent=2)
                logger.info("Dados do token salvos em token_data.json")
        except Exception as e:
            logger.error(f"Erro ao salvar dados do token: {str(e)}")
        
    except Exception as e:
        logger.error(f"Erro durante extração do token: {str(e)}")
    finally:
        # Fecha o navegador
        driver.quit()
        logger.info("Navegador fechado")
    
    return token_data

def get_auth_headers_from_extracted_token():
    """
    Retorna os headers de autenticação usando o token JWT mais recente extraído
    
    Returns:
        dict: Headers de autenticação para requisições à API
    """
    try:
        # Tenta ler o arquivo de token
        if os.path.exists('token_data.json'):
            with open('token_data.json', 'r') as f:
                token_data = json.load(f)
                
            # Verifica a idade do token (opcional, dependendo da validade do token)
            token_timestamp = datetime.fromisoformat(token_data.get('timestamp', '2000-01-01T00:00:00'))
            now = datetime.now()
            token_age_hours = (now - token_timestamp).total_seconds() / 3600
            
            # Se o token tiver mais de 12 horas, extrai um novo
            if token_age_hours > 12:
                logger.info(f"Token tem {token_age_hours:.1f} horas. Obtendo novo token...")
                token_data = extract_jwt_token()
            else:
                logger.info(f"Usando token existente com {token_age_hours:.1f} horas de idade")
        else:
            # Se não existir arquivo de token, extrai um novo
            logger.info("Arquivo de token não encontrado. Obtendo novo token...")
            token_data = extract_jwt_token()
        
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
            'Authorization': auth_token
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
    # Se executado diretamente, extrai o token e exibe os headers
    token_data = extract_jwt_token()
    if token_data:
        headers = get_auth_headers_from_extracted_token()
        print("\nHeaders de autenticação para uso nas APIs:")
        for key, value in headers.items():
            if key == 'Authorization':
                # Mostra apenas parte do token por segurança
                print(f"{key}: Bearer {value.split(' ')[1][:20]}...")
            else:
                print(f"{key}: {value}") 