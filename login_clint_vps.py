import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import logging
import sys

# Configuração de codificação
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    
# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clint_automation.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém as credenciais do arquivo .env
EMAIL = os.getenv('email')
SENHA = os.getenv('senha')

def login_clint():
    logger.info("Iniciando automação de login na Clint Digital...")
    
    # Cria diretório para armazenar resultados se não existir
    results_dir = "resultados"
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)
    
    # Configuração do Chrome para execução em modo headless (para VPS sem interface)
    chrome_options = Options()
    
    # Modo headless para VPS sem interface gráfica
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Inicializa o driver do Chrome
    try:
        driver = webdriver.Chrome(options=chrome_options)
        logger.info("Webdriver iniciado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao iniciar o webdriver: {str(e)}")
        return
    
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
        
        # Tira um screenshot para verificação (útil em ambiente headless)
        driver.save_screenshot(f"{results_dir}/login_form.png")
        
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
        
        # Verifica se estamos na página de login ou se precisamos navegar para a página de origem
        if "/login" in driver.current_url:
            logger.info("Redirecionado para página de login. Tentando acessar a página de origens...")
            driver.get("https://app.clint.digital/origin")
            time.sleep(3)
            logger.info(f"Navegando para: {driver.current_url}")
        
        # Tira um screenshot da página após o login (útil em ambiente headless)
        driver.save_screenshot(f"{results_dir}/after_login.png")
        
        # Aguarda alguns segundos para garantir o carregamento completo da página
        time.sleep(5)
        
        # Informações sobre origens
        origens_info = {
            "data_extracao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "url": driver.current_url,
            "grupos": [],
            "total_origens": 0
        }
        
        # Verifica se há origens em aberto usando o XPath fornecido
        try:
            # XPath base do container das origens (nível mais alto)
            origens_container_xpath = '//*[@id="main-content"]/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div'
            
            logger.info(f"Procurando container de origens usando XPath: {origens_container_xpath}")
            
            # Verifica se o container existe
            wait_origens = WebDriverWait(driver, 30)
            container = wait_origens.until(EC.presence_of_element_located((By.XPATH, origens_container_xpath)))
            logger.info("Container de origens encontrado!")
            
            # Tira screenshot da página completa para diagnóstico
            driver.save_screenshot(f"{results_dir}/pagina_completa.png")
            
            # XPath para origens individuais:
            xpath_nomes_origens = '//*[@id="main-content"]/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div/div/div/div/div/div[1]/div/h5'
            logger.info(f"Buscando nomes de origens individuais usando XPath: {xpath_nomes_origens}")
            
            # Método JavaScript para extrair os dados com precisão
            logger.info("Utilizando método JavaScript para extrair grupos e origens...")
            js_origens = driver.execute_script("""
                // Função para obter texto limpo
                function getCleanText(element) {
                    return element ? element.textContent.trim() : '';
                }
                
                // Encontra os grupos (acordeões)
                const grupos = document.querySelectorAll('.group-accordion');
                const resultado = [];
                
                // Conjunto para rastrear grupos únicos pelo nome
                const gruposProcessados = new Set();
                
                // Para cada grupo
                grupos.forEach((grupo, indexGrupo) => {
                    // Obtém o nome do grupo
                    const nomeGrupoEl = grupo.querySelector('.group-accordion-name .truncate h5');
                    const nomeGrupo = getCleanText(nomeGrupoEl);
                    
                    // Pula se já processamos este grupo (pelo nome)
                    if (gruposProcessados.has(nomeGrupo)) {
                        return;
                    }
                    
                    gruposProcessados.add(nomeGrupo);
                    
                    // Adiciona o grupo ao resultado
                    const grupoObj = {
                        id: indexGrupo + 1,
                        nome: nomeGrupo,
                        origens: []
                    };
                    
                    // Verifica se o grupo está expandido, se não estiver, expande
                    const collapsed = grupo.querySelector('svg.collapsed');
                    if (collapsed) {
                        try {
                            collapsed.parentElement.click();
                        } catch (e) {
                            console.log('Erro ao expandir grupo:', e);
                        }
                    }
                    
                    // Pausa para o DOM atualizar
                    setTimeout(() => {}, 100);
                    
                    // Obtém as origens dentro do grupo
                    const origens = grupo.querySelectorAll('.origin-accordion');
                    origens.forEach((origem, indexOrigem) => {
                        const nomeOrigemEl = origem.querySelector('h5');
                        const nomeOrigem = getCleanText(nomeOrigemEl);
                        
                        // Se encontrou um nome válido, adiciona à lista
                        if (nomeOrigem) {
                            grupoObj.origens.push({
                                id: indexOrigem + 1,
                                nome: nomeOrigem,
                                grupo: nomeGrupo
                            });
                        }
                    });
                    
                    resultado.push(grupoObj);
                });
                
                return resultado;
            """)
            
            logger.info(f"JavaScript encontrou {len(js_origens)} grupos de origens")
            
            # Remove grupos duplicados e processa as origens
            unique_groups = {}
            total_origens = 0
            
            for grupo in js_origens:
                nome_grupo = grupo.get("nome", "")
                
                # Pula grupos vazios
                if not nome_grupo:
                    continue
                
                # Se já temos este grupo, pula
                if nome_grupo in unique_groups:
                    continue
                
                # Adiciona o grupo à lista de grupos únicos
                origens_no_grupo = grupo.get("origens", [])
                total_origens += len(origens_no_grupo)
                
                # Registra cada origem individualmente
                logger.info(f"Grupo: {nome_grupo} - {len(origens_no_grupo)} origens")
                for origem in origens_no_grupo:
                    logger.info(f"  Origem {origem.get('id')}: {origem.get('nome')}")
                
                # Adiciona o grupo aos resultados
                unique_groups[nome_grupo] = {
                    "id": grupo.get("id"),
                    "nome": nome_grupo,
                    "origens": origens_no_grupo
                }
            
            # Atualiza as informações
            origens_info["grupos"] = list(unique_groups.values())
            origens_info["total_origens"] = total_origens
            
            # Tenta extrair as origens específicas usando o XPath fornecido
            logger.info("Tentando extrair origens individuais usando o XPath específico fornecido...")
            xpath_especifico = '//*[@id="main-content"]/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div/div[1]/div'
            
            # Busca por elementos usando o XPath fornecido
            elementos_origem = driver.find_elements(By.XPATH, xpath_especifico)
            logger.info(f"XPath específico retornou {len(elementos_origem)} elementos")
            
            # Processa os elementos encontrados com o XPath específico
            if elementos_origem:
                origens_info["origens_xpath_especifico"] = []
                
                for idx, elemento in enumerate(elementos_origem, 1):
                    try:
                        texto = elemento.get_attribute("textContent").strip()
                        html = elemento.get_attribute("outerHTML")
                        
                        # Identifica se é nome de grupo ou origem individual
                        tipo_elemento = "desconhecido"
                        if "group-accordion-name" in html:
                            tipo_elemento = "grupo"
                        elif "origin-accordion-item" in html:
                            tipo_elemento = "origem"
                        
                        logger.info(f"Elemento {idx} ({tipo_elemento}): {texto[:50]}...")
                        
                        # Adiciona ao resultado
                        origens_info["origens_xpath_especifico"].append({
                            "id": idx,
                            "tipo": tipo_elemento,
                            "texto": texto,
                            "html_snippet": html[:100] + "..."
                        })
                        
                        # Captura screenshot do elemento
                        driver.save_screenshot(f"{results_dir}/elemento_xpath_{idx}.png")
                    except Exception as e:
                        logger.error(f"Erro ao processar elemento {idx}: {str(e)}")
            
            # Salva as informações em um arquivo JSON
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            with open(f"{results_dir}/origens_{timestamp}.json", "w", encoding="utf-8") as f:
                json.dump(origens_info, f, ensure_ascii=False, indent=4)
            
            # Cria um arquivo de texto mais legível com os resultados
            with open(f"{results_dir}/origens_{timestamp}.txt", "w", encoding="utf-8") as f:
                f.write(f"Extração de Origens em Aberto - {origens_info['data_extracao']}\n")
                f.write(f"URL: {origens_info['url']}\n")
                f.write(f"Total de origens encontradas: {origens_info['total_origens']}\n\n")
                
                # Adiciona informações de grupos e origens
                if origens_info["grupos"]:
                    f.write("GRUPOS E ORIGENS ENCONTRADOS:\n")
                    f.write("=" * 50 + "\n\n")
                    
                    for grupo in origens_info["grupos"]:
                        f.write(f"GRUPO: {grupo['nome']}\n")
                        f.write("-" * 40 + "\n")
                        
                        if grupo.get("origens"):
                            for origem in grupo["origens"]:
                                f.write(f"  • Origem {origem['id']}: {origem['nome']}\n")
                            
                            f.write("\n")
                        else:
                            f.write("  Nenhuma origem encontrada neste grupo\n\n")
                
                # Adiciona informações dos elementos encontrados com XPath específico
                if origens_info.get("origens_xpath_especifico"):
                    f.write("\nELEMENTOS ENCONTRADOS COM XPATH ESPECÍFICO:\n")
                    f.write("=" * 50 + "\n\n")
                    
                    for elemento in origens_info["origens_xpath_especifico"]:
                        f.write(f"Elemento {elemento['id']} ({elemento['tipo']}):\n")
                        f.write(f"{elemento['texto']}\n")
                        f.write("-" * 40 + "\n")
            
            logger.info(f"Resultados salvos nos arquivos origens_{timestamp}.json e origens_{timestamp}.txt")
        
        except Exception as e:
            logger.error(f"Erro ao buscar informações de origens em aberto: {str(e)}")
            driver.save_screenshot(f"{results_dir}/erro_origens.png")
            
            # Salvando o HTML da página para análise posterior
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            with open(f"{results_dir}/page_source_{timestamp}.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            logger.info(f"HTML da página salvo como page_source_{timestamp}.html para análise")
        
    except Exception as e:
        logger.error(f"Erro durante a automação: {str(e)}")
        driver.save_screenshot(f"{results_dir}/error.png")
    
    finally:
        # Fecha o navegador
        logger.info("Finalizando a automação...")
        driver.quit()

if __name__ == "__main__":
    login_clint() 