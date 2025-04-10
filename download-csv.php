<?php
/**
 * Script para fazer download direto de arquivos CSV
 * 
 * Uso: download-csv.php?file=nome_do_arquivo.csv
 */

// Definir diretório onde os arquivos CSV estão localizados
$csv_dir = __DIR__ . '/resultados_api';
$alt_csv_dir = '/www/wwwroot/Clintr/resultados_api';

// Obter nome do arquivo da query string
$file = isset($_GET['file']) ? $_GET['file'] : '';

// Validar nome do arquivo para segurança
if (empty($file) || !preg_match('/^[a-zA-Z0-9_\[\]\.\-@]+\.csv$/', $file)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Nome de arquivo inválido']);
    exit;
}

// Caminho completo para o arquivo
$filepath = $csv_dir . '/' . $file;
$alt_filepath = $alt_csv_dir . '/' . $file;

// Verificar se o arquivo existe
if (!file_exists($filepath) && !file_exists($alt_filepath)) {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['error' => 'Arquivo não encontrado']);
    exit;
}

// Usar o caminho alternativo se o principal não existir
if (!file_exists($filepath) && file_exists($alt_filepath)) {
    $filepath = $alt_filepath;
}

// Verificar se o conteúdo parece ser um CSV válido
$content = file_get_contents($filepath);
$first_line = strtok($content, "\n");

if (strpos(strtolower($first_line), '<!doctype') !== false || 
    strpos(strtolower($first_line), '<html') !== false) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'O arquivo não é um CSV válido']);
    exit;
}

// Configurar cabeçalhos para download
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
header('Content-Length: ' . filesize($filepath));
header('Pragma: no-cache');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Cache-Control: private', false);

// Enviar o conteúdo do arquivo
readfile($filepath);
exit; 