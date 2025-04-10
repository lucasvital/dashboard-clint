import os
import json
import time
import logging
from datetime import datetime
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import re

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clint_token_interceptor.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém as credenciais do arquivo .env
EMAIL = os.getenv('email')
SENHA = os.getenv('senha')

def intercept_jwt_token():
    """
    Intercepta e captura o token JWT das requisições para a API GraphQL do Clint
    
    Returns:
        dict: Dicionário contendo o token JWT e outras informações relevantes
    """
    logger.info("Iniciando interceptação de token JWT das requisições da Clint Digital...")
    
    # Configuração do Chrome
    chrome_options = Options()
    
    # Descomentar para modo headless (sem interface gráfica)
    # chrome_options.add_argument("--headless")
    # chrome_options.add_argument("--no-sandbox")
    # chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Configurações específicas para o Selenium Wire
    seleniumwire_options = {
        'enable_har': True,  # Ativa o capture de HAR
        'request_storage': 'memory',  # Armazena requisições na memória
        'ignore_http_methods': ['OPTIONS'],  # Ignora requisições OPTIONS
    }
    
    # Inicializa o driver do Chrome
    try:
        driver = webdriver.Chrome(
            options=chrome_options,
            seleniumwire_options=seleniumwire_options
        )
        logger.info("Webdriver iniciado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao iniciar o webdriver: {str(e)}")
        return None
    
    token_data = None
    
    try:
        # Limpa o histórico de requisições (se houver)
        del driver.requests
        
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
        
        # Pausa breve para garantir que tudo está preenchido
        time.sleep(1)
        
        # Limpa novamente o histórico de requisições para capturar apenas o que vem após o login
        del driver.requests
        
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
        
        # Aguarda para permitir que mais requisições sejam feitas
        time.sleep(5)
        
        # Navega para a página principal para gerar mais requisições GraphQL
        driver.get("https://app.clint.digital/origin")
        time.sleep(5)
        
        # Gera algumas interações para estimular requisições
        try:
            # Tenta clicar em algum elemento na página para gerar requisições
            elements = driver.find_elements(By.CSS_SELECTOR, ".group-accordion, .origin-accordion, button, a")
            if elements:
                for i in range(min(3, len(elements))):
                    try:
                        elements[i].click()
                        time.sleep(2)  # Espera para gerar requisições
                    except:
                        pass
        except Exception as e:
            logger.warning(f"Erro ao tentar gerar mais requisições: {str(e)}")
        
        # Analisa todas as requisições capturadas
        logger.info(f"Analisando {len(driver.requests)} requisições capturadas...")
        
        # Filtrar requisições para a API GraphQL
        graphql_requests = [request for request in driver.requests 
                           if request.url and 'graph.clint.digital' in request.url 
                           and request.headers and 'authorization' in request.headers]
        
        logger.info(f"Encontradas {len(graphql_requests)} requisições GraphQL com cabeçalho Authorization")
        
        # Extrair token JWT das requisições
        for req in graphql_requests:
            auth_header = req.headers.get('authorization')
            if auth_header and auth_header.startswith('Bearer '):
                jwt_token = auth_header.split(' ')[1]
                
                # Verifica se parece um token JWT válido
                if jwt_token.count('.') == 2 and jwt_token.startswith('eyJ'):
                    logger.info(f"Token JWT encontrado em requisição para: {req.url}")
                    logger.info(f"Token JWT (primeiros 20 caracteres): {jwt_token[:20]}...")
                    
                    # Tenta extrair owner_id das requisições
                    owner_id = None
                    if 'x-hasura-owner-id' in req.headers:
                        owner_id = req.headers.get('x-hasura-owner-id')
                        logger.info(f"owner_id encontrado nos headers: {owner_id}")
                    
                    # Se não encontrou o owner_id nos headers, tenta extrair do token
                    if not owner_id:
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
                        "request_url": req.url,
                        "request_method": req.method
                    }
                    
                    # Salva em arquivo JSON
                    try:
                        with open('token_data.json', 'w') as f:
                            json.dump(token_data, f, indent=2)
                            logger.info("Dados do token salvos em token_data.json")
                    except Exception as e:
                        logger.error(f"Erro ao salvar dados do token: {str(e)}")
                    
                    # Encontrou um token válido, pode sair do loop
                    break
        
        if not token_data:
            logger.error("Não foi encontrado token JWT nas requisições")
            
            # Tenta verificar o que tem no localStorage por desencargo de consciência
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
            
            # E nos cookies
            cookies = driver.get_cookies()
            logger.info(f"Cookies encontrados: {json.dumps(cookies, indent=2)}")
            
    except Exception as e:
        logger.error(f"Erro durante interceptação do token: {str(e)}")
    finally:
        # Fecha o navegador
        driver.quit()
        logger.info("Navegador fechado")
    
    return token_data

def get_auth_headers_from_intercepted_token():
    """
    Retorna os headers de autenticação usando o token JWT interceptado
    
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
            
            # Se o token tiver mais de 12 horas, intercepta um novo
            if token_age_hours > 12:
                logger.info(f"Token tem {token_age_hours:.1f} horas. Obtendo novo token...")
                token_data = intercept_jwt_token()
            else:
                logger.info(f"Usando token existente com {token_age_hours:.1f} horas de idade")
        else:
            # Se não existir arquivo de token, intercepta um novo
            logger.info("Arquivo de token não encontrado. Obtendo novo token...")
            token_data = intercept_jwt_token()
        
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
    # Se executado diretamente, intercepta o token e exibe os headers
    token_data = intercept_jwt_token()
    if token_data:
        headers = get_auth_headers_from_intercepted_token()
        print("\nHeaders de autenticação para uso nas APIs:")
        for key, value in headers.items():
            if key == 'Authorization':
                # Mostra apenas parte do token por segurança
                print(f"{key}: Bearer {value.split(' ')[1][:20]}...")
            else:
                print(f"{key}: {value}")
    else:
        print("\nNão foi possível obter o token JWT. Verifique os logs para mais detalhes.") 