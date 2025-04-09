import schedule
import time
import subprocess
import logging
import os
import json
import glob
from datetime import datetime

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def resumir_resultados():
    """Cria um resumo das extrações de origens do dia."""
    try:
        resultados_dir = "resultados"
        if not os.path.exists(resultados_dir):
            logger.warning("Diretório de resultados não encontrado.")
            return
        
        # Data atual (para filtrar os arquivos do dia)
        data_atual = datetime.now().strftime("%Y%m%d")
        
        # Encontra todos os arquivos JSON de origens do dia
        arquivos_json = glob.glob(f"{resultados_dir}/origens_{data_atual}_*.json")
        
        if not arquivos_json:
            logger.info("Nenhum arquivo de resultados encontrado para o dia atual.")
            return
        
        # Dados do resumo
        resumo = {
            "data": datetime.now().strftime("%Y-%m-%d"),
            "total_verificacoes": len(arquivos_json),
            "verificacoes": []
        }
        
        # Processa cada arquivo de resultado
        for arquivo in sorted(arquivos_json):
            try:
                with open(arquivo, 'r', encoding='utf-8') as f:
                    dados = json.load(f)
                
                total_origens = len(dados.get("origens", []))
                hora_extracao = dados.get("data_extracao", "Desconhecido")
                
                resumo["verificacoes"].append({
                    "hora": hora_extracao,
                    "arquivo": os.path.basename(arquivo),
                    "total_origens": total_origens
                })
                
            except Exception as e:
                logger.error(f"Erro ao processar arquivo {arquivo}: {str(e)}")
        
        # Salva o resumo em um arquivo
        data_hora = datetime.now().strftime("%Y%m%d")
        with open(f"{resultados_dir}/resumo_diario_{data_hora}.json", 'w', encoding='utf-8') as f:
            json.dump(resumo, f, ensure_ascii=False, indent=4)
        
        # Cria um arquivo de texto mais legível
        with open(f"{resultados_dir}/resumo_diario_{data_hora}.txt", 'w', encoding='utf-8') as f:
            f.write(f"Resumo de Verificações - {resumo['data']}\n")
            f.write(f"Total de verificações realizadas: {resumo['total_verificacoes']}\n\n")
            
            if resumo["verificacoes"]:
                f.write("Detalhes das verificações:\n")
                f.write("-" * 60 + "\n")
                f.write(f"{'Hora':^20} | {'Total de Origens':^20}\n")
                f.write("-" * 60 + "\n")
                
                for verificacao in resumo["verificacoes"]:
                    f.write(f"{verificacao['hora']:^20} | {verificacao['total_origens']:^20}\n")
        
        logger.info(f"Resumo diário criado com sucesso: resumo_diario_{data_hora}.txt")
        
    except Exception as e:
        logger.error(f"Erro ao criar resumo diário: {str(e)}")

def execute_login_script():
    """Executa o script de login e registra os resultados."""
    try:
        logger.info(f"Iniciando execução agendada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        # Executa o script de login para VPS
        result = subprocess.run(['python', 'login_clint_vps.py'], 
                                capture_output=True, text=True, check=False)
        
        # Registra o resultado
        if result.returncode == 0:
            logger.info("Script executado com sucesso!")
            
            # Tenta ler o arquivo JSON mais recente para verificar quantas origens foram encontradas
            try:
                resultados_dir = "resultados"
                data_atual = datetime.now().strftime("%Y%m%d")
                arquivos_json = glob.glob(f"{resultados_dir}/origens_{data_atual}_*.json")
                
                if arquivos_json:
                    arquivo_recente = max(arquivos_json, key=os.path.getctime)
                    with open(arquivo_recente, 'r', encoding='utf-8') as f:
                        dados = json.load(f)
                    
                    total_origens = len(dados.get("origens", []))
                    logger.info(f"Última verificação encontrou {total_origens} origem(ns) em aberto.")
            except Exception as e:
                logger.error(f"Erro ao ler resultados recentes: {str(e)}")
                
        else:
            logger.error(f"Erro na execução do script. Código de saída: {result.returncode}")
            logger.error(f"Erro: {result.stderr}")
        
        logger.info(f"Execução concluída: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("Próxima execução agendada para daqui a 6 horas")
        
    except Exception as e:
        logger.error(f"Erro ao executar o agendamento: {str(e)}")

def criar_resumo_diario():
    """Cria um resumo diário das verificações."""
    logger.info("Criando resumo diário das verificações...")
    resumir_resultados()
    logger.info("Resumo diário concluído.")

def main():
    """Configura o agendamento e mantém o programa em execução."""
    logger.info("Iniciando o agendador de login...")
    
    # Cria diretório para armazenar resultados se não existir
    resultados_dir = "resultados"
    if not os.path.exists(resultados_dir):
        os.makedirs(resultados_dir)
    
    # Agenda a execução a cada 6 horas
    schedule.every(6).hours.do(execute_login_script)
    
    # Também agenda para horários específicos (exemplo: 8h, 14h, 20h, 2h)
    schedule.every().day.at("08:00").do(execute_login_script)
    schedule.every().day.at("14:00").do(execute_login_script)
    schedule.every().day.at("20:00").do(execute_login_script)
    schedule.every().day.at("02:00").do(execute_login_script)
    
    # Agenda a criação do resumo diário às 23:59
    schedule.every().day.at("23:59").do(criar_resumo_diario)
    
    logger.info("Agendamento configurado! Executando imediatamente a primeira vez...")
    
    # Executa uma vez imediatamente ao iniciar
    execute_login_script()
    
    # Loop principal para manter o programa em execução
    while True:
        schedule.run_pending()
        time.sleep(60)  # Verifica o agendamento a cada minuto

if __name__ == "__main__":
    main() 