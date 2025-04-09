import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from dotenv import load_dotenv
import logging
import sys
import glob

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
    
    # Cria diretório para armazenar CSVs exportados
    csv_dir = os.path.join(results_dir, "csvs")
    if not os.path.exists(csv_dir):
        os.makedirs(csv_dir)
    
    # Configuração do Chrome
    chrome_options = Options()
    
    # Configurar diretório de download para a pasta csv_dir
    prefs = {
        "download.default_directory": os.path.abspath(csv_dir),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": False
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
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
        
        # Aguarda alguns segundos para garantir o carregamento completo da página
        time.sleep(5)
        
        # Informações sobre origens
        origens_info = {
            "data_extracao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "url": driver.current_url,
            "grupos": [],
            "total_origens": 0,
            "downloads": []
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
                                grupo: nomeGrupo,
                                elemento: origem // Mantém referência ao elemento DOM para uso posterior
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
            todas_origens = [] # Lista para manter todas as origens para iteração
            
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
                    # Remove a referência ao elemento DOM antes de adicionar à lista final
                    origem_info = {
                        "id": origem.get("id"),
                        "nome": origem.get("nome"),
                        "grupo": nome_grupo
                    }
                    todas_origens.append(origem_info)
                    logger.info(f"  Origem {origem.get('id')}: {origem.get('nome')}")
                
                # Adiciona o grupo aos resultados (sem referências DOM)
                origens_no_grupo_sem_elemento = []
                for origem in origens_no_grupo:
                    origens_no_grupo_sem_elemento.append({
                        "id": origem.get("id"),
                        "nome": origem.get("nome"),
                        "grupo": nome_grupo
                    })
                
                unique_groups[nome_grupo] = {
                    "id": grupo.get("id"),
                    "nome": nome_grupo,
                    "origens": origens_no_grupo_sem_elemento
                }
            
            # Atualiza as informações
            origens_info["grupos"] = list(unique_groups.values())
            origens_info["total_origens"] = total_origens
            
            # Verifica quantos arquivos CSV existem antes de começar o download
            csv_arquivos_antes = set(glob.glob(os.path.join(csv_dir, "*.csv")))
            logger.info(f"Arquivos CSV existentes antes dos downloads: {len(csv_arquivos_antes)}")
            
            # Iteração sobre cada origem para exportar CSV
            logger.info("Iniciando iteração sobre origens para exportar CSVs...")
            print("\n" + "="*50)
            print(f"INICIANDO EXPORTAÇÃO DE CSVs PARA {total_origens} ORIGENS")
            print("="*50 + "\n")
            
            for idx, origem in enumerate(todas_origens, 1):
                try:
                    nome_origem = origem.get("nome")
                    grupo_origem = origem.get("grupo")
                    
                    logger.info(f"Acessando origem {idx}/{total_origens}: {nome_origem} (Grupo: {grupo_origem})")
                    print(f"Exportando CSV para origem {idx}/{total_origens}: {nome_origem}")
                    
                    # Clica na origem para acessá-la - primeiro, vamos navegar para a lista
                    driver.get("https://app.clint.digital/origin")
                    time.sleep(3)
                    
                    # Busca pelo nome da origem na página
                    origem_encontrada = False
                    try:
                        # Tentar encontrar o grupo e expandir
                        grupos_elementos = driver.find_elements(By.CLASS_NAME, "group-accordion")
                        
                        for grupo_elemento in grupos_elementos:
                            nome_grupo_elemento = grupo_elemento.find_element(By.CSS_SELECTOR, ".group-accordion-name .truncate h5").text.strip()
                            
                            if nome_grupo_elemento == grupo_origem:
                                # Verifica se o grupo está colapsado
                                try:
                                    collapsed = grupo_elemento.find_element(By.CSS_SELECTOR, "svg.collapsed")
                                    # Se não lançar exceção, o grupo está colapsado - clica para expandir
                                    collapsed.find_element(By.XPATH, "..").click()
                                    time.sleep(1)  # Espera a animação de expansão
                                except:
                                    # Se lançar exceção, o grupo já está expandido
                                    pass
                                
                                # Busca dentro do grupo pela origem usando o XPath exato fornecido
                                # Aguarda um momento para certeza que o grupo expandiu totalmente
                                time.sleep(2)
                                
                                # Método JavaScript para localizar a origem pelo nome
                                origens_encontradas = driver.execute_script("""
                                    const nomeOrigem = arguments[0];
                                    const nomeGrupo = arguments[1];
                                    
                                    // Encontrar todos os elementos h5 que podem ser origens
                                    const origens = document.querySelectorAll('h5');
                                    
                                    // Filtrar pelo nome e verificar se está dentro do grupo correto
                                    for (const origem of origens) {
                                        if (origem.textContent.trim() === nomeOrigem) {
                                            // Verificar se está no grupo correto (subindo na hierarquia)
                                            let parent = origem.parentElement;
                                            while (parent && !parent.classList.contains('group-accordion')) {
                                                parent = parent.parentElement;
                                            }
                                            
                                            if (parent) {
                                                const grupoH5 = parent.querySelector('.group-accordion-name .truncate h5');
                                                if (grupoH5 && grupoH5.textContent.trim() === nomeGrupo) {
                                                    // Encontrou a origem no grupo correto
                                                    return origem;
                                                }
                                            }
                                        }
                                    }
                                    return null;
                                """, nome_origem, grupo_origem)
                                
                                if origens_encontradas:
                                    # Clica na origem usando JavaScript (mais confiável)
                                    driver.execute_script("arguments[0].click();", origens_encontradas)
                                    origem_encontrada = True
                                    time.sleep(3)  # Espera carregar
                                    logger.info(f"Origem {nome_origem} encontrada e acessada com sucesso via JavaScript")
                                    break
                                else:
                                    # Tenta com o XPath fornecido pelo usuário (mais específico)
                                    try:
                                        # Usando o XPath completo (ajustamos para buscar todas as origens e depois filtrar)
                                        xpath_origens = '//*[@id="main-content"]/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div/div/div/div/div/div[2]/div/div[1]/div/div/div/div/h5'
                                        origens_elementos = driver.find_elements(By.XPATH, xpath_origens)
                                        
                                        for origem_elem in origens_elementos:
                                            if origem_elem.text.strip() == nome_origem:
                                                # Scroll para garantir visibilidade
                                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", origem_elem)
                                                time.sleep(1)
                                                origem_elem.click()
                                                origem_encontrada = True
                                                time.sleep(3)
                                                logger.info(f"Origem {nome_origem} encontrada usando XPath fornecido")
                                                break
                                                
                                    except Exception as xpath_e:
                                        logger.error(f"Erro ao usar XPath específico: {str(xpath_e)}")
                                
                                if origem_encontrada:
                                    break
                    except Exception as e:
                        logger.error(f"Erro ao navegar até a origem {nome_origem}: {str(e)}")
                    
                    if not origem_encontrada:
                        logger.warning(f"Não foi possível encontrar a origem {nome_origem} na interface - tentando método alternativo")
                        # Método alternativo: usar XPath absoluto fornecido
                        try:
                            # Xpath absoluto fornecido pelo usuário
                            xpath_absoluto = '//html/body/div[1]/div/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div/div/div/div/div/div[2]/div/div[1]/div/div/div/div/h5'
                            elementos_h5 = driver.find_elements(By.XPATH, xpath_absoluto)
                            
                            logger.info(f"Método alternativo: encontrados {len(elementos_h5)} elementos h5 com XPath absoluto")
                            
                            for h5 in elementos_h5:
                                try:
                                    if h5.text.strip() == nome_origem:
                                        # Garante visibilidade com scroll
                                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", h5)
                                        time.sleep(1)
                                        h5.click()
                                        origem_encontrada = True
                                        time.sleep(3)
                                        logger.info(f"Origem {nome_origem} encontrada usando XPath absoluto")
                                        break
                                except Exception as h5_e:
                                    logger.error(f"Erro ao processar elemento h5: {str(h5_e)}")
                                    continue
                        except Exception as xpath_abs_e:
                            logger.error(f"Erro no método alternativo com XPath absoluto: {str(xpath_abs_e)}")
                        
                        # Se ainda não encontrou, tenta busca genérica por texto
                        if not origem_encontrada:
                            try:
                                # Tenta encontrar qualquer elemento que contenha o texto exato
                                elementos_clicaveis = driver.find_elements(By.CSS_SELECTOR, "h5, span, div, p, a, button")
                                for elem in elementos_clicaveis:
                                    try:
                                        if elem.text.strip() == nome_origem:
                                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", elem)
                                            time.sleep(1)
                                            elem.click()
                                            origem_encontrada = True
                                            time.sleep(3)
                                            logger.info(f"Origem {nome_origem} encontrada por busca de texto")
                                            break
                                    except:
                                        pass
                            except Exception as text_e:
                                logger.error(f"Erro na busca por texto: {str(text_e)}")
                    
                    # Verifica se foi possível acessar a origem
                    if not origem_encontrada:
                        logger.error(f"Não foi possível acessar a origem {nome_origem} - pulando para a próxima")
                        continue
                    
                    # Tenta verificar se realmente acessou a página da origem
                    try:
                        titulo_origem = WebDriverWait(driver, 5).until(
                            EC.presence_of_element_located((By.XPATH, '//*[@id="origin-header"]/div/div[1]/h1'))
                        )
                        logger.info(f"Confirmado acesso à página da origem: {titulo_origem.text}")
                    except:
                        logger.warning(f"Não foi possível confirmar acesso à página de origem {nome_origem}")
                    
                    # Localiza o botão de exportação CSV - aumentando o tempo de espera
                    try:
                        # Aguarda um tempo maior para garantir o carregamento da página da origem
                        time.sleep(5)
                        
                        # Tenta com o XPath fornecido
                        export_button_xpath = '//*[@id="origin-header"]/div/div[3]/div[4]/span/button'
                        
                        # Tenta vários XPaths para o botão de exportação
                        possivel_botao = None
                        xpaths_botao = [
                            '//*[@id="origin-header"]/div/div[3]/div[4]/span/button',
                            '//*[@id="origin-header"]/div/div[3]/div[4]',
                            '//*[@id="origin-header"]/div/div[3]/div/span/button',
                            '//button[contains(@aria-label, "Export")]',
                            '//button[contains(@aria-label, "export")]',
                            '//button[contains(@aria-label, "Download")]',
                            '//button//svg[contains(@data-testid, "DownloadIcon")]/..',
                            '//span[contains(text(), "Export")]/parent::button',
                            '//span[contains(text(), "Exportar")]/parent::button'
                        ]
                        
                        for xpath in xpaths_botao:
                            try:
                                botoes = driver.find_elements(By.XPATH, xpath)
                                if botoes:
                                    possivel_botao = botoes[0]
                                    logger.info(f"Botão de exportação encontrado com XPath: {xpath}")
                                    break
                            except:
                                continue
                        
                        if possivel_botao:
                            # Rola até o botão e clica
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", possivel_botao)
                            time.sleep(1)
                            
                            # Tenta clicar com JavaScript (mais confiável que o click direto)
                            driver.execute_script("arguments[0].click();", possivel_botao)
                            
                            logger.info(f"Botão exportar CSV clicado para origem {nome_origem}")
                            
                            # Aguarda a janela de confirmação aparecer
                            time.sleep(3)
                            
                            # Tenta clicar no botão de confirmação (Sim)
                            try:
                                # Aguarda especificamente por um botão com texto "Sim"
                                try:
                                    botao_sim = WebDriverWait(driver, 5).until(
                                        EC.element_to_be_clickable((By.XPATH, '//button[text()="Sim"]'))
                                    )
                                    botao_sim.click()
                                    logger.info("Clicou no botão 'Sim' usando espera explícita")
                                except:
                                    logger.warning("Não encontrou botão 'Sim' usando espera explícita, tentando alternativas")
                                
                                # Se não encontrou com espera explícita, tenta várias abordagens
                                if not 'botao_sim' in locals() or botao_sim is None:
                                    # Tenta por XPath específico fornecido pelo usuário
                                    xpaths_confirmacao = [
                                        '//*[@id="popover-positioned-Tem certeza que deseja exportar os negócios dessa origem?"]/div[2]/div[2]/button',
                                        '//*[contains(@id, "popover-positioned")]/div[2]/div[2]/button',
                                        '//*[contains(@id, "popover")]/div[2]/button[last()]',
                                        '//div[contains(@id, "popover")]/div[2]/div[2]/button',
                                        '//div[contains(@class, "popover")]/div[2]/div[2]/button',
                                        '//div[contains(@class, "popover")]//button[last()]',
                                        '//div[contains(@role, "dialog")]//button[last()]',
                                        '//button[contains(text(), "Sim")]',
                                        '//button[text()="Sim"]'
                                    ]
                                    
                                    for xpath_sim in xpaths_confirmacao:
                                        try:
                                            botoes_sim = driver.find_elements(By.XPATH, xpath_sim)
                                            if botoes_sim:
                                                botao_sim = botoes_sim[0]
                                                logger.info(f"Botão 'Sim' encontrado com XPath: {xpath_sim}")
                                                # Tentar scrollar para garantir visibilidade
                                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", botao_sim)
                                                time.sleep(0.5)
                                                # Tenta clicar diretamente
                                                botao_sim.click()
                                                logger.info("Clique direto no botão 'Sim'")
                                                break
                                        except Exception as click_e:
                                            logger.warning(f"Erro no clique usando XPath {xpath_sim}: {str(click_e)}")
                                            # Se não conseguiu clicar diretamente, tenta com JavaScript
                                            try:
                                                driver.execute_script("arguments[0].click();", botao_sim)
                                                logger.info(f"Clicou no botão 'Sim' via JavaScript usando XPath: {xpath_sim}")
                                                break
                                            except:
                                                pass
                                
                                # Se nenhuma abordagem funcionou, tenta método JavaScript mais direto
                                try:
                                    # Identificar todos os botões visíveis e escolher o que tem "Sim"
                                    result = driver.execute_script("""
                                        // Encontrar todos os botões na página
                                        const botoes = Array.from(document.querySelectorAll('button'));
                                        
                                        // Filtrar apenas botões visíveis
                                        const botoesVisiveis = botoes.filter(btn => {
                                            const style = window.getComputedStyle(btn);
                                            return style.display !== 'none' && 
                                                  style.visibility !== 'hidden' && 
                                                  style.opacity !== '0' && 
                                                  btn.offsetWidth > 0 &&
                                                  btn.offsetHeight > 0;
                                        });
                                        
                                        console.log("Botões visíveis encontrados:", botoesVisiveis.length);
                                        
                                        // Procurar pelo botão "Sim" entre os visíveis
                                        const botaoSim = botoesVisiveis.find(btn => 
                                            btn.textContent.trim() === "Sim" || 
                                            btn.innerText.trim() === "Sim"
                                        );
                                        
                                        if (botaoSim) {
                                            console.log("Botão SIM encontrado:", botaoSim.textContent);
                                            botaoSim.click();
                                            return "BOTAO_SIM_CLICADO";
                                        }
                                        
                                        // Se não encontrou especificamente "Sim", procura por strings relacionadas
                                        const botaoConfirmar = botoesVisiveis.find(btn => 
                                            btn.textContent.includes("Sim") || 
                                            btn.textContent.includes("Yes") ||
                                            btn.textContent.includes("Confirmar") || 
                                            btn.textContent.includes("Confirm") ||
                                            btn.textContent.includes("Exportar")
                                        );
                                        
                                        if (botaoConfirmar) {
                                            console.log("Botão de confirmação encontrado:", botaoConfirmar.textContent);
                                            botaoConfirmar.click();
                                            return "BOTAO_CONFIRMAR_CLICADO";
                                        }
                                        
                                        // Se ainda não encontrou, tenta localizar popover/dialog e pegar o último botão
                                        const popover = document.querySelector('[role="dialog"], .popover, .modal, .MuiPopover-paper');
                                        if (popover) {
                                            const botoesPopover = popover.querySelectorAll('button');
                                            if (botoesPopover.length >= 1) {
                                                // Pega o último botão (geralmente a confirmação)
                                                const ultimoBotao = botoesPopover[botoesPopover.length - 1];
                                                console.log("Último botão do popover:", ultimoBotao.textContent);
                                                ultimoBotao.click();
                                                return "ULTIMO_BOTAO_CLICADO";
                                            }
                                        }
                                        
                                        // Método mais radical: encontrar e clicar em todos os botões visíveis recentes
                                        // que possam ser de confirmação (isso pode causar efeitos colaterais)
                                        for (let i = 0; i < botoesVisiveis.length; i++) {
                                            const btn = botoesVisiveis[i];
                                            // Pega somente botões que parecem ser de ação
                                            if (btn.classList.contains('btn-primary') || 
                                                btn.classList.contains('primary') ||
                                                btn.style.backgroundColor ||
                                                btn.tagName === 'BUTTON' && !btn.disabled) {
                                                console.log("Tentando botão:", btn.textContent);
                                                btn.click();
                                                return "BOTAO_GENERICO_CLICADO";
                                            }
                                        }
                                        
                                        return "NENHUM_BOTAO_ENCONTRADO";
                                    """)
                                    logger.info(f"Resultado do script JavaScript para confirmação: {result}")
                                    
                                    # Verifica se conseguiu clicar em algum botão
                                    if result != "NENHUM_BOTAO_ENCONTRADO":
                                        logger.info("Confirmação realizada via JavaScript direto")
                                    else:
                                        # Tentativa final: clicar na posição onde o botão provavelmente está
                                        actions = webdriver.ActionChains(driver)
                                        # Clica na região direita inferior onde geralmente fica o "Sim"
                                        actions.move_by_offset(300, 150).click().perform()
                                        logger.info("Tentativa final: clique por coordenadas na provável posição do 'Sim'")
                                        
                                except Exception as js_confirm_e:
                                    logger.error(f"Erro na tentativa final de confirmação via JavaScript: {str(js_confirm_e)}")
                            except Exception as confirm_e:
                                logger.error(f"Erro ao tentar clicar na confirmação: {str(confirm_e)}")
                            
                            # Aguarda o download iniciar e completar (mais tempo devido à confirmação)
                            time.sleep(10)
                        else:
                            raise Exception("Botão de exportação não encontrado com nenhum XPath")
                        
                    except Exception as e:
                        logger.error(f"Erro ao clicar no botão de exportação para {nome_origem}: {str(e)}")
                        
                        # Tenta método alternativo com JavaScript
                        logger.info("Tentando método alternativo com JavaScript...")
                        try:
                            botao_encontrado = driver.execute_script("""
                                // Tenta encontrar botões com texto ou ícone de exportação
                                const botoes = Array.from(document.querySelectorAll('button'));
                                
                                // Verifica botões com textos relacionados a exportação
                                let botaoExportar = botoes.find(b => 
                                    b.textContent.includes('Export') || 
                                    b.textContent.includes('Exportar') || 
                                    b.textContent.includes('CSV') ||
                                    b.textContent.includes('Download')
                                );
                                
                                // Se não encontrou por texto, procura por ícones
                                if (!botaoExportar) {
                                    botaoExportar = botoes.find(b => 
                                        b.querySelector('svg[data-testid="DownloadIcon"]') ||
                                        b.querySelector('svg[data-testid="FileDownloadIcon"]') ||
                                        b.querySelector('svg[data-testid="GetAppIcon"]')
                                    );
                                }
                                
                                // Se ainda não encontrou, tenta por aria-label
                                if (!botaoExportar) {
                                    botaoExportar = Array.from(document.querySelectorAll('[aria-label*="export" i], [aria-label*="download" i]')).find(e => true);
                                }
                                
                                // Tenta com o seletor CSS específico fornecido
                                if (!botaoExportar) {
                                    const exportContainer = document.querySelector("#origin-header > div > div.mx-lg-2.align-items-center.pt-3.pr-2.pr-lg-0.row > div:nth-child(4)");
                                    if (exportContainer) {
                                        const button = exportContainer.querySelector('button');
                                        if (button) {
                                            botaoExportar = button;
                                        }
                                    }
                                }
                                
                                // Se encontrou algum botão, clica nele
                                if (botaoExportar) {
                                    botaoExportar.click();
                                    
                                    // Aguarda um pouco para o diálogo de confirmação aparecer
                                    setTimeout(() => {
                                        // Tenta clicar no botão de confirmação
                                        const botoes = Array.from(document.querySelectorAll('button'));
                                        const botaoConfirmar = botoes.find(b => 
                                            b.textContent.includes('Sim') || 
                                            b.textContent.includes('Yes') ||
                                            b.textContent.includes('Confirmar') || 
                                            b.textContent.includes('Confirm')
                                        );
                                        
                                        if (botaoConfirmar) {
                                            botaoConfirmar.click();
                                        }
                                    }, 1000);
                                    
                                    return true;
                                }
                                
                                // Busca por spans ou outros elementos que possam ser o botão de exportar
                                const spans = Array.from(document.querySelectorAll('span'));
                                const spanExportar = spans.find(s => 
                                    s.textContent.includes('Export') || 
                                    s.textContent.includes('Exportar') ||
                                    s.textContent.includes('CSV')
                                );
                                
                                if (spanExportar) {
                                    // Tenta clicar no pai do span (provavelmente o botão)
                                    if (spanExportar.parentElement) {
                                        spanExportar.parentElement.click();
                                        
                                        // Aguarda um pouco para o diálogo de confirmação aparecer
                                        setTimeout(() => {
                                            // Tenta clicar no botão de confirmação
                                            const botoes = Array.from(document.querySelectorAll('button'));
                                            const botaoConfirmar = botoes.find(b => 
                                                b.textContent.includes('Sim') || 
                                                b.textContent.includes('Yes') ||
                                                b.textContent.includes('Confirmar') ||
                                                b.textContent.includes('Confirm')
                                            );
                                            
                                            if (botaoConfirmar) {
                                                botaoConfirmar.click();
                                            }
                                        }, 1000);
                                        
                                        return true;
                                    }
                                    // Se não for possível, clica no próprio span
                                    spanExportar.click();
                                    return true;
                                }
                                
                                return false;
                            """)
                            
                            if botao_encontrado:
                                logger.info("Botão de exportação encontrado e clicado via JavaScript")
                                
                                # Aguarda para clique na confirmação
                                time.sleep(3)
                                
                                # Tenta clicar na confirmação com JavaScript adicional
                                driver.execute_script("""
                                    const botoes = Array.from(document.querySelectorAll('button'));
                                    const botaoConfirmar = botoes.find(b => 
                                        b.textContent.includes('Sim') || 
                                        b.textContent.includes('Yes') ||
                                        b.textContent.includes('Confirmar') || 
                                        b.textContent.includes('Confirm')
                                    );
                                    
                                    if (botaoConfirmar) {
                                        botaoConfirmar.click();
                                        return true;
                                    }
                                    return false;
                                """)
                                
                                time.sleep(7)  # Espera mais tempo para garantir o download
                            else:
                                logger.warning("Não foi possível encontrar ou clicar no botão de exportação")
                        except Exception as js_e:
                            logger.error(f"Erro no método JavaScript de exportação: {str(js_e)}")
                            
                            # Último recurso: tenta localizar visualmente o botão e clicar
                            try:
                                # Tenta clicar na região onde o botão de exportação costuma estar
                                actions = webdriver.ActionChains(driver)
                                actions.move_by_offset(800, 100).click().perform()  # Coordenadas aproximadas
                                logger.info("Tentativa de clique por coordenadas realizada")
                                
                                # Aguarda para tentar clicar na confirmação
                                time.sleep(3)
                                
                                # Tenta clicar na região da confirmação
                                actions = webdriver.ActionChains(driver)
                                actions.move_by_offset(0, 100).click().perform()  # Move mais abaixo para o botão de confirmação
                                logger.info("Tentativa de clique na confirmação por coordenadas")
                                
                                time.sleep(7)
                            except Exception as coord_e:
                                logger.error(f"Falha na tentativa de clique por coordenadas: {str(coord_e)}")
                    
                    # Verifica arquivos CSV após o download - aguarda mais tempo
                    time.sleep(7)  # Aumenta o tempo de espera para downloads
                    csv_arquivos_depois = set(glob.glob(os.path.join(csv_dir, "*.csv")))
                    novos_arquivos = csv_arquivos_depois - csv_arquivos_antes
                    
                    if novos_arquivos:
                        csv_baixado = list(novos_arquivos)[0]
                        logger.info(f"Download do CSV concluído: {csv_baixado}")
                        
                        # Renomeia o arquivo para incluir o nome da origem
                        nome_arquivo_base = os.path.basename(csv_baixado)
                        novo_nome = f"{idx}_{nome_origem.replace(' ', '_')}_{nome_arquivo_base}"
                        novo_caminho = os.path.join(csv_dir, novo_nome)
                        
                        try:
                            os.rename(csv_baixado, novo_caminho)
                            logger.info(f"Arquivo renomeado para: {novo_nome}")
                            
                            # Registra o download bem-sucedido
                            origens_info["downloads"].append({
                                "origem": nome_origem,
                                "grupo": grupo_origem,
                                "arquivo": novo_nome,
                                "status": "sucesso"
                            })
                        except Exception as e:
                            logger.error(f"Erro ao renomear arquivo: {str(e)}")
                            
                            # Registra o download com erro no renomeio
                            origens_info["downloads"].append({
                                "origem": nome_origem,
                                "grupo": grupo_origem,
                                "arquivo": nome_arquivo_base,
                                "status": "erro_renomear",
                                "erro": str(e)
                            })
                        
                        # Atualiza a lista de arquivos antes
                        csv_arquivos_antes = csv_arquivos_depois
                    else:
                        logger.warning(f"Nenhum novo arquivo CSV encontrado após tentativa de download para {nome_origem}")
                        
                        # Registra o download sem sucesso
                        origens_info["downloads"].append({
                            "origem": nome_origem,
                            "grupo": grupo_origem,
                            "status": "falha",
                            "erro": "Nenhum arquivo CSV foi baixado"
                        })
                    
                except Exception as e:
                    logger.error(f"Erro durante o processamento da origem {idx} ({nome_origem}): {str(e)}")
                    
                    # Registra o erro no processamento da origem
                    origens_info["downloads"].append({
                        "origem": nome_origem,
                        "grupo": grupo_origem,
                        "status": "erro",
                        "erro": str(e)
                    })
            
            # Exibe e registra o resumo de downloads
            sucessos = sum(1 for d in origens_info["downloads"] if d["status"] == "sucesso")
            falhas = len(origens_info["downloads"]) - sucessos
            
            print("\n" + "="*50)
            print(f"EXPORTAÇÃO CONCLUÍDA!")
            print(f"Total de origens processadas: {len(origens_info['downloads'])}")
            print(f"Downloads com sucesso: {sucessos}")
            print(f"Downloads com falha: {falhas}")
            print("="*50 + "\n")
            
            logger.info(f"RESUMO DE DOWNLOADS - Sucesso: {sucessos}, Falhas: {falhas}")
            
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
                
                # Adiciona informações de downloads
                f.write("\nRESUMO DE DOWNLOADS DE CSV:\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"Total de origens processadas: {len(origens_info['downloads'])}\n")
                f.write(f"Downloads com sucesso: {sucessos}\n")
                f.write(f"Downloads com falha: {falhas}\n\n")
                
                f.write("DETALHES DOS DOWNLOADS:\n")
                f.write("-" * 40 + "\n")
                for download in origens_info["downloads"]:
                    f.write(f"Origem: {download['origem']} (Grupo: {download['grupo']})\n")
                    f.write(f"Status: {download['status']}\n")
                    
                    if download["status"] == "sucesso":
                        f.write(f"Arquivo: {download['arquivo']}\n")
                    elif "erro" in download:
                        f.write(f"Erro: {download['erro']}\n")
                    
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