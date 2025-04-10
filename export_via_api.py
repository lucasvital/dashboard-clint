import os
import json
import time
import requests
import logging
import sys
from datetime import datetime
from dotenv import load_dotenv
import glob
import pandas as pd
import unidecode
import re

# Configuração de codificação
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    
# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("clint_api_export.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém as credenciais do arquivo .env
EMAIL = os.getenv('email')
SENHA = os.getenv('senha')

# Debug das variáveis de ambiente
logger.info(f"Email configurado: {EMAIL is not None}")
logger.info(f"Senha configurada: {SENHA is not None}")

def setup_directories():
    """Configura diretórios para armazenar resultados e CSVs"""
    results_dir = "resultados_api"
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)
    
    csv_dir = os.path.join(results_dir, "csvs")
    if not os.path.exists(csv_dir):
        os.makedirs(csv_dir)
    
    return results_dir, csv_dir

def limpar_csvs_antigos(csv_dir):
    """
    Limpa todos os arquivos CSV antigos do diretório de CSVs
    para evitar duplicações nas exportações
    
    Args:
        csv_dir: Diretório onde os arquivos CSV estão localizados
    """
    logger.info("Limpando CSVs antigos antes de iniciar nova exportação...")
    arquivos_csv = glob.glob(os.path.join(csv_dir, "*.csv"))
    
    if not arquivos_csv:
        logger.info("Nenhum arquivo CSV antigo encontrado para remover.")
        return
    
    total_removidos = 0
    for arquivo in arquivos_csv:
        try:
            os.remove(arquivo)
            total_removidos += 1
            logger.info(f"Arquivo removido: {os.path.basename(arquivo)}")
        except Exception as e:
            logger.error(f"Erro ao remover arquivo {arquivo}: {str(e)}")
    
    logger.info(f"Total de {total_removidos} arquivos CSV antigos removidos.")

def obter_token_por_login():
    """Tenta fazer login e obter um token de acesso"""
    logger.info("Tentando obter token através de login...")
    
    if not EMAIL or not SENHA:
        logger.error("Email ou senha não configurados no .env")
        return None
    
    # URL de login
    login_url = "https://api.clint.digital/v1/auth/login"
    
    # Dados de login
    login_data = {
        "email": EMAIL,
        "password": SENHA
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                logger.info("Token obtido com sucesso através de login!")
                return data["token"]
            else:
                logger.error("Login bem-sucedido, mas token não encontrado na resposta")
                logger.info(f"Resposta: {json.dumps(data, indent=2)}")
        else:
            logger.error(f"Erro no login: Status {response.status_code}")
            logger.error(f"Resposta: {response.text}")
            
        return None
    
    except Exception as e:
        logger.error(f"Exceção durante o login: {str(e)}")
        return None

def get_auth_headers():
    """
    Retorna os headers de autenticação para as requisições à API,
    garantindo que o token de autorização esteja no formato correto.
    Agora usa o método de interceptação de requisições com Playwright.
    """
    try:
        # Primeiro tenta o método usando Playwright
        try:
            from playwright_token import get_cached_auth_headers
            headers = get_cached_auth_headers()
            if headers:
                logger.info("Headers de autenticação obtidos via Playwright")
                return headers
        except ImportError:
            logger.warning("Módulo playwright_token não encontrado, tentando método alternativo...")
        except Exception as e:
            logger.warning(f"Erro ao obter headers via Playwright: {str(e)}")
            
        # Em segundo lugar, tenta o método usando Selenium Wire
        try:
            from interceptor_token import get_auth_headers_from_intercepted_token
            headers = get_auth_headers_from_intercepted_token()
            if headers:
                logger.info("Headers de autenticação obtidos via interceptação de requisições")
                return headers
        except ImportError:
            logger.warning("Módulo interceptor_token não encontrado, tentando método alternativo...")
        except Exception as e:
            logger.warning(f"Erro ao obter headers via interceptor: {str(e)}")
        
        # Por último, tenta o método baseado em localStorage
        try:
            from get_jwt_token import get_auth_headers_from_extracted_token
            headers = get_auth_headers_from_extracted_token()
            if headers:
                logger.info("Headers de autenticação obtidos via localStorage")
                return headers
        except ImportError:
            logger.warning("Módulo get_jwt_token não encontrado, usando token estático...")
        except Exception as e:
            logger.warning(f"Erro ao obter headers via localStorage: {str(e)}")
    except Exception as e:
        logger.warning(f"Erro ao obter headers via métodos automáticos: {str(e)}")
    
    logger.info("Usando token estático como fallback")
    
    # Fallback para o caso de erro nos métodos automáticos
    # Token JWT fornecido pelo usuário
    jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVjNWVjNDg5LWI0OWYtNDk4My1iZjcyLWMzYzk5MzUzMzdmYiIsIm93bmVyX2lkIjoiNzQzNDUxOWEtZTkwMS00MDBmLTg2MWUtMGRkYTZmNWQzYTYyIiwic3ViIjoiZWM1ZWM0ODktYjQ5Zi00OTgzLWJmNzItYzNjOTkzNTMzN2ZiIiwiZW1haWwiOiJhbGJlcnRvQHNob3J0bWlkaWEuY29tLmJyIiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbImFnZW5jeSIsImFub255bW91cyJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJhZ2VuY3kiLCJ4LWhhc3VyYS11c2VyLWlkIjoiZWM1ZWM0ODktYjQ5Zi00OTgzLWJmNzItYzNjOTkzNTMzN2ZiIiwieC1oYXN1cmEtb3duZXItaWQiOiI3NDM0NTE5YS1lOTAxLTQwMGYtODYxZS0wZGRhNmY1ZDNhNjIifSwicm9sZXMiOlsiYWdlbmN5IiwiYW5vbnltb3VzIl0sImlhdCI6MTc0MzYxNTQ1N30.TUbI9cGcysWa3L3kuKuFBlnn_Kje5c095K24GWNCycA"
    
    # Preparar o Authorization header com o prefixo Bearer
    auth_token = f"Bearer {jwt_token}"
    
    # Extrair owner_id do token (está incluído nos claims)
    owner_id = "7434519a-e901-400f-861e-0dda6f5d3a62"  # ID extraído do token
    
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': auth_token,
        'x-hasura-owner-id': owner_id
    }
    
    # Log para confirmar que está usando o token correto
    logger.info(f"Usando token estático de autenticação (primeiros 20 caracteres): {auth_token[:20]}...")
    
    return headers

def normalizar_nome_arquivo(nome):
    """
    Remove acentos, espaços e caracteres especiais de um nome de arquivo.
    Substitui por underscores para garantir compatibilidade.
    """
    # Remove acentos
    nome = unidecode.unidecode(nome)
    # Substitui espaços e caracteres especiais por underscores
    nome = re.sub(r'[^a-zA-Z0-9]', '_', nome)
    # Remove múltiplos underscores consecutivos
    nome = re.sub(r'_{2,}', '_', nome)
    # Remove underscores do início e fim
    nome = nome.strip('_')
    return nome

def get_origins_graphql():
    """Obtém origens através da API GraphQL"""
    logger.info("Buscando origens via GraphQL...")
    url = "https://graph.clint.digital/v1/graphql"
    
    # Query GraphQL corrigida para obter origens
    query = """
    query Origins {
      origin(where: {archived_at: {_is_null: true}}) {
        id
        name
        group_id
        group {
          id
          name
        }
      }
    }
    """
    
    payload = {
        "query": query
    }
    
    # Adicionando headers exatos capturados do navegador
    headers = get_auth_headers()
    headers.update({
        "content-type": "application/json",
        "accept": "application/json, text/plain, */*",
        "origin": "https://app.clint.digital",
        "referer": "https://app.clint.digital/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    })
    
    try:
        # Imprimir exatamente o que será enviado para debug
        logger.info(f"Enviando requisição GraphQL para listar origens")
        logger.info(f"Payload: {json.dumps(payload)}")
        
        response = requests.post(url, json=payload, headers=headers)
        
        logger.info(f"Resposta status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            
            if "data" in result and "origin" in result["data"]:
                origins_data = result["data"]["origin"]
                logger.info(f"Sucesso via GraphQL! Encontradas {len(origins_data)} origens.")
                return origins_data
            else:
                logger.error(f"Resposta GraphQL não contém dados de origens")
                logger.info(f"Resposta: {json.dumps(result)}")
        else:
            logger.error(f"Erro na requisição GraphQL: Status {response.status_code}")
            logger.error(f"Resposta: {response.text}")
            
        return None
    
    except Exception as e:
        logger.error(f"Exceção durante consulta GraphQL: {str(e)}")
        return None

def get_origins():
    """Obtém todas as origens através da API GraphQL"""
    logger.info("Buscando origens via GraphQL...")
    return get_origins_graphql()

def export_origin_deals(origin_id, origin_name, csv_dir, group_name=None):
    """Exporta os negócios de uma origem específica usando a API GraphQL"""
    logger.info(f"Exportando negócios da origem: {origin_name} (ID: {origin_id})")
    
    # Definir diferentes valores de totalBulk para tentar em caso de falha
    total_bulk_valores = obter_total_bulk_para_origem(origin_id, origin_name)
    
    # Resultados finais da exportação
    resultado_final = None
    ultima_falha = None
    
    # Tentar exportar com valores diferentes de totalBulk
    for totalBulk in total_bulk_valores:
        logger.info(f"Tentando exportação para origem '{origin_name}' com totalBulk={totalBulk}")
        
        resultado = tentar_exportacao(origin_id, origin_name, csv_dir, group_name, totalBulk)
        
        if resultado and resultado.get("success"):
            logger.info(f"Exportação bem-sucedida com totalBulk={totalBulk}")
            return resultado
        else:
            logger.warning(f"Falha na exportação com totalBulk={totalBulk}")
            ultima_falha = resultado if resultado else ultima_falha
    
    # Se todas as tentativas falharam, retornar a última falha
    logger.error(f"Todas as tentativas de exportação falharam para a origem: {origin_name}")
    return ultima_falha

def obter_total_bulk_para_origem(origin_id, origin_name):
    """
    Determina os valores de totalBulk a serem tentados para uma origem específica.
    
    Args:
        origin_id: ID da origem
        origin_name: Nome da origem
        
    Returns:
        Lista de valores totalBulk para tentar, em ordem
    """
    # Lista padrão de valores para totalBulk a serem tentados
    valores_padrao = [398, 500, 1000]
    
    # Origens específicas com valores personalizados
    if "Lista Geral" in origin_name:
        return [1000, 1500, 2000]  # Origens muito grandes
    elif "Assinaturas" in origin_name:
        return [800, 1000, 1200]   # Origens grandes
    elif "Compras" in origin_name:
        return [500, 700, 900]     # Origens médias
    elif "abandono" in origin_name.lower():
        return [300, 500, 700]     # Origens possivelmente menores
    
    # IDs específicos (se necessário)
    if origin_id == "329ab048-5347-4bd0-8c08-972da386e835":  # Imersão Presencial
        return [200, 300, 400]     # Valor que funcionou anteriormente
    
    return valores_padrao  # Para todas as outras origens

def tentar_exportacao(origin_id, origin_name, csv_dir, group_name, totalBulk):
    """
    Tenta exportar uma origem específica com um determinado valor de totalBulk.
    
    Args:
        origin_id: ID da origem
        origin_name: Nome da origem
        csv_dir: Diretório para salvar o CSV
        group_name: Nome do grupo
        totalBulk: Valor de totalBulk a utilizar
        
    Returns:
        Informações de download se bem-sucedido, None caso contrário
    """
    url = "https://graph.clint.digital/v1/graphql"
    
    # Usando exatamente a mesma query capturada do exemplo fornecido
    query = """
    mutation exporterExport($typeEXPORTER_EXPORT: String, $bulkParamsEXPORTER_EXPORT: jsonb!)  {
      exporter_export(type: $typeEXPORTER_EXPORT, bulkParams: $bulkParamsEXPORTER_EXPORT){ 
        success 
        message 
        payload  
      }
    }
    """
    
    # Simplificando o payload para aumentar a chance de sucesso
    variables = {
        "typeEXPORTER_EXPORT": "DEAL",
        "bulkParamsEXPORTER_EXPORT": {
            "where": {
                "_and": [
                    {"archived_at": {"_is_null": True}},
                    {"status": {"_in": ["OPEN", "WON", "LOST"]}},
                    {"origin_id": {"_eq": origin_id}}  # Apenas filtrar por origem
                ]
            },
            "totalBulk": totalBulk  # Usando o valor específico fornecido
        }
    }
    
    # Montando o payload conforme o exemplo fornecido
    payload = {
        "query": query,
        "variables": variables
    }
    
    # Adicionando headers exatos capturados do navegador
    headers = get_auth_headers()
    headers.update({
        "content-type": "application/json",
        "accept": "application/json, text/plain, */*",
        "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "origin": "https://app.clint.digital",
        "referer": "https://app.clint.digital/",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    })
    
    try:
        # Imprimir exatamente o que será enviado para debug
        logger.info(f"Enviando requisição GraphQL para origem {origin_id}")
        logger.info(f"Headers: {json.dumps({k: v for k, v in headers.items() if k != 'Authorization'})}")
        logger.info(f"Payload: {json.dumps(payload)}")
        
        # Adicionando retry para maior estabilidade
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                break
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Tentativa {attempt+1} falhou. Tentando novamente em 3 segundos: {str(e)}")
                    time.sleep(3)
                else:
                    raise
        
        logger.info(f"Resposta status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Resposta: {json.dumps(result)}")
            
            if "data" in result and "exporter_export" in result["data"]:
                export_data = result["data"]["exporter_export"]
                
                if export_data["success"]:
                    csv_url = export_data["payload"]["csv_url"]
                    logger.info(f"URL do CSV gerado: {csv_url}")
                    
                    # Faz o download do arquivo CSV
                    download_info = download_csv(csv_url, origin_id, origin_name, csv_dir, group_name)
                    return download_info
                else:
                    logger.error(f"Erro na exportação: {export_data['message']}")
                    # Mostrar detalhes completos da resposta para diagnóstico
                    logger.error(f"Detalhes da resposta: {json.dumps(export_data, indent=2)}")
                    # Adicionar mais detalhes sobre o payload enviado para facilitar o diagnóstico
                    logger.error(f"Payload enviado que causou o erro: {json.dumps(payload, indent=2)}")
            else:
                logger.error(f"Resposta inesperada: {result}")
                # Mostrar resposta completa para diagnóstico
                logger.error(f"Resposta completa: {json.dumps(result, indent=2)}")
        else:
            logger.error(f"Erro na requisição: Status {response.status_code}")
            logger.error(f"Resposta: {response.text}")
            logger.error(f"Dados enviados na requisição que falhou: {json.dumps(payload, indent=2)}")
            
        return None
    
    except Exception as e:
        logger.error(f"Exceção durante exportação: {str(e)}")
        return None

def formatar_datas_no_dataframe(df):
    """
    Formata as datas no DataFrame para o formato dd/mm/aaaa sem as horas
    
    Args:
        df: DataFrame pandas contendo os dados
        
    Returns:
        DataFrame com as datas formatadas
    """
    logger.info("Formatando datas no DataFrame...")
    
    if 'created_at' in df.columns:
        logger.info(f"Encontrada coluna created_at com {df['created_at'].notna().sum()} valores não-nulos")
        
        # Função para formatar cada data
        def formatar_data(data_str):
            if pd.isna(data_str) or not isinstance(data_str, str):
                return data_str
                
            # Extrai apenas a parte da data (dd/mm/aaaa) de strings no formato dd/mm/aaaa hh:mm:ss
            match = re.match(r'(\d{2}/\d{2}/\d{4})(?:\s+\d{2}:\d{2}:\d{2})?', data_str)
            if match:
                return match.group(1)  # Retorna apenas a parte da data
            return data_str
        
        # Aplica a formatação em todas as linhas
        df['created_at'] = df['created_at'].apply(formatar_data)
        logger.info("Datas formatadas com sucesso")
    
    # Verifica outras colunas de data que possam existir
    for col in ['won_at', 'lost_at', 'purchase_created_at']:
        if col in df.columns:
            logger.info(f"Formatando datas na coluna {col}")
            df[col] = df[col].apply(lambda x: formatar_data(x) if isinstance(x, str) else x)
    
    return df

def download_csv(url, origin_id, origin_name, csv_dir, group_name):
    """
    Baixa o arquivo CSV do link de download e o salva localmente
    
    Args:
        url: URL para download do CSV
        origin_id: ID da origem
        origin_name: Nome da origem
        csv_dir: Diretório para salvar o CSV
        group_name: Nome do grupo (opcional)
        
    Returns:
        Caminho para o arquivo baixado ou None se falhar
    """
    logger.info(f"Baixando CSV para origem: {origin_name} (ID: {origin_id})")
    
    try:
        # Preparar cabeçalhos para o download
        headers = get_auth_headers()
        
        # Normalizar o nome da origem para criar o nome do arquivo
        nome_normalizado = normalizar_nome_arquivo(origin_name)
        if group_name:
            grupo_normalizado = normalizar_nome_arquivo(group_name)
            nome_normalizado = f"{grupo_normalizado}_{nome_normalizado}"
        
        # Adicionar timestamp para evitar conflitos
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nome_arquivo = f"{nome_normalizado}_{timestamp}.csv"
        caminho_arquivo = os.path.join(csv_dir, nome_arquivo)
        
        logger.info(f"Iniciando download do CSV da URL: {url}")
        logger.info(f"Arquivo de destino: {caminho_arquivo}")
        
        # Realizar o download
        response = requests.get(url, headers=headers)
        
        logger.info(f"Download concluído. Status code: {response.status_code}")
        logger.info(f"Tamanho do conteúdo: {len(response.content)} bytes")
        logger.info(f"Headers da resposta: {json.dumps(dict(response.headers))}")
        
        # Se o download for bem sucedido
        if response.status_code == 200:
            # Salvar o conteúdo em um arquivo temporário
            temp_file_path = os.path.join(csv_dir, f"{nome_normalizado}_temp.csv")
            with open(temp_file_path, 'wb') as f:
                f.write(response.content)
            
            # Ler o CSV, processar as datas e salvar novamente
            try:
                # Tentar diferentes encodings para lidar com caracteres especiais
                encodings = ['utf-8', 'latin1', 'ISO-8859-1']
                df = None
                
                for encoding in encodings:
                    try:
                        df = pd.read_csv(temp_file_path, encoding=encoding)
                        break  # Se conseguiu ler, sai do loop
                    except UnicodeDecodeError:
                        continue  # Tenta o próximo encoding
                
                if df is not None:
                    # Processar as datas no DataFrame
                    df = formatar_datas_no_dataframe(df)
                    
                    # Salvar o DataFrame processado
                    df.to_csv(caminho_arquivo, index=False)
                    
                    # Remover arquivo temporário
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)
                    
                    logger.info(f"CSV baixado, processado e salvo com sucesso: {caminho_arquivo}")
                    return {
                        "success": True,
                        "file_path": caminho_arquivo,
                        "group_name": group_name,
                        "origin_name": origin_name,
                        "origin_id": origin_id,
                        "file_size": len(response.content),
                        "file_name": nome_arquivo
                    }
                else:
                    # Se não conseguiu ler com nenhum encoding, usa o arquivo original
                    with open(caminho_arquivo, 'wb') as f:
                        f.write(response.content)
                    
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)
                        
                    logger.warning(f"Não foi possível processar o CSV. Salvando arquivo original: {caminho_arquivo}")
                    return {
                        "success": True,
                        "file_path": caminho_arquivo,
                        "group_name": group_name,
                        "origin_name": origin_name,
                        "origin_id": origin_id,
                        "file_size": len(response.content),
                        "file_name": nome_arquivo
                    }
            
            except Exception as e:
                logger.error(f"Erro ao processar CSV: {str(e)}")
                # Em caso de erro no processamento, mantém o arquivo original
                with open(caminho_arquivo, 'wb') as f:
                    f.write(response.content)
                
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
                return {
                    "success": True,
                    "file_path": caminho_arquivo,
                    "group_name": group_name,
                    "origin_name": origin_name,
                    "origin_id": origin_id,
                    "file_size": len(response.content),
                    "file_name": nome_arquivo
                }
        else:
            logger.error(f"Erro ao baixar o CSV. Status: {response.status_code}")
            logger.error(f"Resposta: {response.text}")
            logger.error(f"Headers da resposta: {json.dumps(dict(response.headers))}")
            return {
                "success": False,
                "error": f"Status {response.status_code}",
                "response_text": response.text
            }
    except Exception as e:
        logger.error(f"Exceção durante o download do CSV: {str(e)}")
        logger.exception("Stacktrace completo:")
        return {
            "success": False,
            "error": str(e)
        }

def map_origins_to_groups(origins):
    """Mapeia as origens para seus respectivos grupos usando os dados já incluídos na API de origens"""
    # Cria um dicionário para agrupar origens por grupo
    group_map = {}
    
    for origin in origins:
        if "group" in origin and origin["group"]:
            group_id = origin["group"]["id"]
            group_name = origin["group"]["name"]
            
            # Se o grupo ainda não existe no mapa, cria-o
            if group_id not in group_map:
                group_map[group_id] = {
                    "name": group_name,
                    "origins": []
                }
            
            # Adiciona a origem ao grupo
            group_map[group_id]["origins"].append({
                "id": origin["id"],
                "name": origin["name"]
            })
    
    return group_map

def export_all_origins():
    """Exporta os dados de todas as origens"""
    # Configura diretórios
    results_dir, csv_dir = setup_directories()
    
    # Limpa CSVs antigos para evitar duplicações
    limpar_csvs_antigos(csv_dir)
    
    # Obtém origens que já incluem informações de grupo
    origins = get_origins()
    
    if not origins:
        logger.error("Não foi possível obter os dados de origens. Encerrando.")
        return
    
    # Organiza as origens por grupo usando os dados já incluídos na resposta da API
    organized_groups = map_origins_to_groups(origins)
    
    # Informações sobre a exportação
    export_info = {
        "data_extracao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_grupos": len(organized_groups),
        "total_origens": sum(len(group_data["origins"]) for group_data in organized_groups.values()),
        "grupos": [],
        "downloads": []
    }
    
    # Exibe resumo inicial
    print("\n" + "="*50)
    print(f"INICIANDO EXPORTAÇÃO DE CSVs")
    print(f"Total de grupos: {export_info['total_grupos']}")
    print(f"Total de origens: {export_info['total_origens']}")
    print("="*50 + "\n")
    
    # Itera sobre os grupos e origens para exportar
    origem_idx = 1
    for group_id, group_data in organized_groups.items():
        group_name = group_data["name"]
        group_origins = group_data["origins"]
        
        # Adiciona informações do grupo ao relatório
        group_info = {
            "id": group_id,
            "nome": group_name,
            "origens": []
        }
        
        logger.info(f"GRUPO: {group_name} - {len(group_origins)} origens")
        
        # Processa cada origem no grupo
        for origin in group_origins:
            origin_id = origin["id"]
            origin_name = origin["name"]
            
            logger.info(f"[{origem_idx}/{export_info['total_origens']}] Processando origem: {origin_name}")
            print(f"Exportando origem {origem_idx}/{export_info['total_origens']}: {origin_name}")
            
            # Adiciona a origem à lista do grupo
            group_info["origens"].append({
                "id": origin_id,
                "nome": origin_name
            })
            
            # Exporta os negócios da origem
            download_info = export_origin_deals(origin_id, origin_name, csv_dir, group_name)
            
            # Registra o resultado da exportação - verificando se download_info não é None
            if download_info is None:
                # Cria um objeto de informações de download com status de falha
                download_info = {
                    "success": False,
                    "error": "Falha na exportação",
                    "grupo": group_name,
                    "origem_id": origin_id,
                    "origem": origin_name,
                    "status": "falha"
                }
            else:
                # Adiciona informações adicionais ao objeto de download
                download_info["grupo"] = group_name
                download_info["origem_id"] = origin_id
                download_info["origem"] = origin_name
                download_info["status"] = "sucesso" if download_info["success"] else "falha"
            
            export_info["downloads"].append(download_info)
            
            # Incrementa contador e aguarda um pouco para não sobrecarregar a API
            origem_idx += 1
            time.sleep(1)  # Pausa de 1 segundo entre exportações
        
        # Adiciona informações do grupo ao relatório final
        export_info["grupos"].append(group_info)
    
    # Calcula estatísticas finais
    sucessos = sum(1 for d in export_info["downloads"] if d["success"])
    falhas = len(export_info["downloads"]) - sucessos
    
    # Exibe resumo final
    print("\n" + "="*50)
    print(f"EXPORTAÇÃO CONCLUÍDA!")
    print(f"Total de origens processadas: {len(export_info['downloads'])}")
    print(f"Downloads com sucesso: {sucessos}")
    print(f"Downloads com falha: {falhas}")
    print("="*50 + "\n")
    
    # Salva o relatório em JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(f"{results_dir}/exportacao_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump(export_info, f, ensure_ascii=False, indent=4)
    
    # Cria um arquivo de texto mais legível com os resultados
    with open(f"{results_dir}/exportacao_{timestamp}.txt", "w", encoding="utf-8") as f:
        f.write(f"Exportação de Origens via API - {export_info['data_extracao']}\n")
        f.write(f"Total de grupos: {export_info['total_grupos']}\n")
        f.write(f"Total de origens encontradas: {export_info['total_origens']}\n\n")
        
        # Adiciona informações de grupos e origens
        if export_info["grupos"]:
            f.write("GRUPOS E ORIGENS PROCESSADOS:\n")
            f.write("=" * 50 + "\n\n")
            
            for grupo in export_info["grupos"]:
                f.write(f"GRUPO: {grupo['nome']}\n")
                f.write("-" * 40 + "\n")
                
                if grupo.get("origens"):
                    for origem in grupo["origens"]:
                        f.write(f"  • Origem: {origem['nome']} (ID: {origem['id']})\n")
                    
                    f.write("\n")
                else:
                    f.write("  Nenhuma origem encontrada neste grupo\n\n")
        
        # Adiciona informações de downloads
        f.write("\nRESUMO DE DOWNLOADS DE CSV:\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total de origens processadas: {len(export_info['downloads'])}\n")
        f.write(f"Downloads com sucesso: {sucessos}\n")
        f.write(f"Downloads com falha: {falhas}\n\n")
        
        f.write("DETALHES DOS DOWNLOADS:\n")
        f.write("-" * 40 + "\n")
        for download in export_info["downloads"]:
            f.write(f"Origem: {download['origem']} (Grupo: {download['grupo']})\n")
            f.write(f"Status: {download['status']}\n")
            f.write("-" * 40 + "\n")
    
    logger.info(f"Relatório salvo nos arquivos exportacao_{timestamp}.json e exportacao_{timestamp}.txt")
    logger.info("Processo de exportação concluído.")
    
    # Após concluir a exportação, combina todos os CSVs em um único arquivo
    combinar_todos_csvs(csv_dir, results_dir, export_info["downloads"])

def combinar_todos_csvs(csv_dir, results_dir, downloads_info):
    """
    Combina todos os CSVs baixados em um único arquivo com informações adicionais
    
    Args:
        csv_dir: Diretório onde os CSVs estão salvos
        results_dir: Diretório de resultados
        downloads_info: Informações sobre downloads realizados
        
    Returns:
        Path do arquivo CSV combinado
    """
    logger.info("Iniciando combinação de todos os arquivos CSV em um único arquivo...")
    
    # Limpa arquivos combinados anteriores
    logger.info("Limpando arquivos combinados anteriores...")
    
    # Padrões para identificar arquivos combinados anteriores
    padroes = [
        "dados_combinados_*.csv",
        "dados_combinados_*.xlsx",
        "[*_at_*]_Dados_Gerais_*.csv",
        "[*_at_*]_Dados_Gerais_*.xlsx"
    ]
    
    arquivos_removidos = 0
    for padrao in padroes:
        arquivos_anteriores = glob.glob(os.path.join(results_dir, padrao))
        for arquivo in arquivos_anteriores:
            try:
                os.remove(arquivo)
                arquivos_removidos += 1
                logger.info(f"Arquivo combinado anterior removido: {os.path.basename(arquivo)}")
            except Exception as e:
                logger.error(f"Erro ao remover arquivo {arquivo}: {str(e)}")
    
    logger.info(f"Total de {arquivos_removidos} arquivos combinados anteriores removidos.")
    
    # Obtém todos os arquivos CSV no diretório
    arquivos_csv = glob.glob(os.path.join(csv_dir, "*.csv"))
    
    if not arquivos_csv:
        logger.error("Nenhum arquivo CSV encontrado para combinar.")
        return
    
    logger.info(f"Encontrados {len(arquivos_csv)} arquivos CSV para combinar.")
    
    # Cria um DataFrame vazio para armazenar todos os dados
    df_combinado = pd.DataFrame()
    
    # Contador para arquivos processados
    arquivos_processados = 0
    registros_totais = 0
    
    # Dicionário para mapear informações de download pelo nome do arquivo
    info_por_arquivo = {}
    for download in downloads_info:
        if download.get("success") and "file_name" in download:
            info_por_arquivo[download["file_name"]] = {
                "grupo": download["group_name"],
                "origem": download["origin_name"]
            }
    
    # Processa cada arquivo CSV
    for arquivo_csv in arquivos_csv:
        try:
            nome_arquivo = os.path.basename(arquivo_csv)
            
            # Obtém as informações do grupo e origem a partir do dicionário de downloads
            info_arquivo = None
            if nome_arquivo in info_por_arquivo:
                info_arquivo = info_por_arquivo[nome_arquivo]
            else:
                # Se não encontrar no dicionário, tenta extrair do nome do arquivo
                # Formato esperado: GRUPO_ORIGEM_DATA.csv
                partes = nome_arquivo.split('_')
                if len(partes) >= 3:
                    # Consideramos que o primeiro elemento é o grupo e o segundo é a origem
                    grupo = partes[0]
                    origem = partes[1]
                    info_arquivo = {
                        "grupo": grupo.replace("_", " "),
                        "origem": origem.replace("_", " ")
                    }
                else:
                    logger.warning(f"Não foi possível extrair informações do nome do arquivo: {nome_arquivo}")
                    info_arquivo = {
                        "grupo": "Desconhecido",
                        "origem": nome_arquivo.replace(".csv", "")
                    }
            
            logger.info(f"Processando arquivo: {nome_arquivo}")
            logger.info(f"  Grupo: {info_arquivo['grupo']}")
            logger.info(f"  Origem: {info_arquivo['origem']}")
            
            # Lê o arquivo CSV
            df = pd.read_csv(arquivo_csv, encoding='utf-8')
            
            # Adiciona colunas para grupo e origem
            df['grupo_origem'] = info_arquivo['grupo']
            df['nome_origem'] = info_arquivo['origem']
            
            # Adiciona uma coluna para indicar que são dados completos (status OPEN, WON, LOST)
            df['tipo_exportacao'] = 'COMPLETO'
            
            # Adiciona ao DataFrame combinado
            if df_combinado.empty:
                df_combinado = df
            else:
                # Garante que temos as mesmas colunas em ambos os DataFrames
                colunas_existentes = set(df_combinado.columns)
                colunas_novas = set(df.columns)
                
                # Adiciona colunas faltantes ao DataFrame combinado
                for coluna in colunas_novas - colunas_existentes:
                    df_combinado[coluna] = None
                
                # Adiciona colunas faltantes ao DataFrame atual
                for coluna in colunas_existentes - colunas_novas:
                    df[coluna] = None
                
                # Concatena os DataFrames
                df_combinado = pd.concat([df_combinado, df], ignore_index=True)
            
            # Atualiza contadores
            arquivos_processados += 1
            registros_totais += len(df)
            
            logger.info(f"  Registros adicionados: {len(df)}")
            
        except Exception as e:
            logger.error(f"Erro ao processar o arquivo {arquivo_csv}: {str(e)}")
    
    # Formatar as datas no DataFrame combinado
    df_combinado = formatar_datas_no_dataframe(df_combinado)
    
    # Gerar nome do arquivo com a data atual
    today = datetime.now().strftime("%d-%m-%Y")
    output_filename = f"[{EMAIL.replace('@', '_at_')}]_Dados_Gerais_{today}.csv"
    output_path = os.path.join(results_dir, output_filename)
    
    # Salvar o DataFrame combinado
    df_combinado.to_csv(output_path, index=False)
    
    logger.info(f"Arquivo CSV combinado salvo como: {output_path}")
    logger.info(f"Total de arquivos processados: {arquivos_processados}")
    logger.info(f"Total de registros combinados: {registros_totais}")
    logger.info(f"Total de colunas no arquivo final: {len(df_combinado.columns)}")
    
    # Também salva um arquivo Excel para facilitar a visualização
    try:
        df_combinado.to_excel(os.path.join(results_dir, f"[{EMAIL.replace('@', '_at_')}]_Dados_Gerais_{today}.xlsx"), index=False)
        logger.info(f"Arquivo Excel combinado salvo como: [{EMAIL.replace('@', '_at_')}]_Dados_Gerais_{today}.xlsx")
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo Excel: {str(e)}")

if __name__ == "__main__":
    export_all_origins() 