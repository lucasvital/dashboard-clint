@echo off
setlocal enabledelayedexpansion

:: Definindo cores para saída no console
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: Função para exibir mensagens
echo %GREEN%[INFO]%NC% Iniciando instalação do Clint Dashboard...

:: Verificando se o Node.js já está instalado
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo %GREEN%[INFO]%NC% Node.js !NODE_VERSION! já está instalado.
) else (
    echo %YELLOW%[AVISO]%NC% Node.js não encontrado. Iniciando o download e instalação...
    
    :: Criando diretório temporário
    mkdir temp_installer 2>nul
    cd temp_installer
    
    :: Determinando a arquitetura do sistema
    if "%PROCESSOR_ARCHITECTURE%" EQU "AMD64" (
        set ARCH=x64
    ) else (
        set ARCH=x86
    )
    
    :: Baixando o instalador do Node.js
    echo %GREEN%[INFO]%NC% Baixando Node.js para %ARCH%...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.0/node-v18.18.0-%ARCH%.msi' -OutFile 'node_installer.msi'}"
    
    if not exist node_installer.msi (
        echo %RED%[ERRO]%NC% Falha ao baixar o instalador do Node.js.
        echo %YELLOW%[AVISO]%NC% Por favor, instale o Node.js manualmente a partir de https://nodejs.org/
        cd ..
        rmdir /s /q temp_installer
        pause
        exit /b 1
    )
    
    :: Executando o instalador
    echo %GREEN%[INFO]%NC% Instalando Node.js...
    start /wait msiexec /i node_installer.msi /quiet /qn
    
    :: Verificando a instalação
    cd ..
    rmdir /s /q temp_installer
    
    where node >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[ERRO]%NC% A instalação do Node.js falhou.
        echo %YELLOW%[AVISO]%NC% Por favor, instale o Node.js manualmente a partir de https://nodejs.org/
        pause
        exit /b 1
    )
    
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo %GREEN%[INFO]%NC% Node.js !NODE_VERSION! foi instalado com sucesso.
)

:: Verificando o caminho do arquivo setup-alt.js
if not exist setup-alt.js (
    echo %RED%[ERRO]%NC% O arquivo setup-alt.js não foi encontrado no diretório atual.
    echo %RED%[ERRO]%NC% Certifique-se de estar executando este script no diretório correto.
    pause
    exit /b 1
)

:: Verificando e instalando dependências
echo %GREEN%[INFO]%NC% Verificando dependências necessárias...

:: Instalando dependências globais úteis
echo %GREEN%[INFO]%NC% Instalando dependências globais...
call npm install -g npm@latest
call npm install -g cross-env

:: Executando o script de configuração
echo %GREEN%[INFO]%NC% Iniciando o script de configuração do Clint Dashboard...
node setup-alt.js

if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERRO]%NC% Ocorreu um erro durante a execução do script de configuração.
    echo %RED%[ERRO]%NC% Verifique as mensagens de erro acima para mais detalhes.
    pause
    exit /b 1
)

echo %GREEN%[INFO]%NC% Instalação concluída com sucesso!
echo %GREEN%[INFO]%NC% O Clint Dashboard foi configurado corretamente.
pause
exit /b 0 