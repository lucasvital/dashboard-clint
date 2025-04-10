"""
Script modificado para exportar dados via API e salvar em formatos CSV e JSON
"""

import os
import sys
import requests
import json
import csv
import pandas as pd
from datetime import datetime
import time

# Função para converter CSV para JSON
def convert_csv_to_json(csv_path):
    try:
        # Ler o CSV
        df = pd.read_csv(csv_path)
        
        # Criar o caminho para o arquivo JSON
        json_path = csv_path.replace('.csv', '.json')
        
        # Salvar como JSON (formatado para legibilidade)
        df.to_json(json_path, orient='records', indent=2)
        
        print(f"✅ Arquivo JSON criado: {json_path}")
        return json_path
    except Exception as e:
        print(f"❌ Erro ao converter CSV para JSON: {str(e)}")
        return None

# Parte do script original que faz o download dos CSVs

# Após o download de todos os CSVs, adicionar esta função para converter todos para JSON
def convert_all_csvs_to_json(output_dir):
    print("\n🔄 Convertendo todos os arquivos CSV para JSON...")
    
    # Verificar se o diretório existe
    if not os.path.exists(output_dir):
        print(f"❌ Diretório não encontrado: {output_dir}")
        return []
    
    # Listar todos os arquivos CSV
    csv_files = [f for f in os.listdir(output_dir) if f.lower().endswith('.csv')]
    
    if not csv_files:
        print("ℹ️ Nenhum arquivo CSV encontrado para converter")
        return []
    
    print(f"🔍 Encontrados {len(csv_files)} arquivos CSV")
    
    # Converter cada CSV para JSON
    json_files = []
    for csv_file in csv_files:
        csv_path = os.path.join(output_dir, csv_file)
        json_path = convert_csv_to_json(csv_path)
        if json_path:
            json_files.append(json_path)
    
    print(f"✅ {len(json_files)} arquivos JSON criados")
    return json_files

# Após a combinação de todos os CSVs, converter o CSV combinado para JSON

# Adicionar ao final do script:
def convert_combined_csv_to_json(combined_csv_path):
    print("\n🔄 Convertendo o arquivo CSV combinado para JSON...")
    json_path = convert_csv_to_json(combined_csv_path)
    if json_path:
        print(f"✅ Arquivo JSON combinado criado: {json_path}")
    else:
        print("❌ Falha ao criar arquivo JSON combinado")

# Chamar esta função depois de criar o CSV combinado
# convert_combined_csv_to_json(combined_csv_path)

"""
Para incorporar este código ao script original, você precisa:

1. Adicionar as funções convert_csv_to_json e convert_all_csvs_to_json logo após as importações
2. Chamar convert_all_csvs_to_json(output_dir) após baixar todos os CSVs
3. Chamar convert_combined_csv_to_json(combined_csv_path) após criar o CSV combinado
""" 