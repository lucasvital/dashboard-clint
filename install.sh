#!/bin/bash

# Cores para formatação do texto
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sem cor

# Função para exibir mensagens
log_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está sendo executado como root
if [ "$EUID" -ne 0 ]; then
  log_warning "Este script não está sendo executado como root (sudo)."
  log_warning "Algumas operações podem falhar devido a permissões insuficientes."
  echo -e "Recomendamos executar com: ${YELLOW}sudo bash $0${NC}\n"
  read -p "Deseja continuar mesmo assim? (s/n): " choice
  case "$choice" in 
    s|S ) log_message "Continuando a instalação..." ;;
    * ) log_message "Instalação cancelada."; exit 1 ;;
  esac
fi

# Detectar o sistema operacional
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$NAME
  VERSION=$VERSION_ID
  log_message "Sistema operacional detectado: $OS $VERSION"
else
  OS=$(uname -s)
  log_message "Sistema operacional detectado: $OS"
fi

# Verificar se o NVM já está instalado
if [ -d "$HOME/.nvm" ]; then
  log_message "NVM já está instalado. Usando a instalação existente."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  log_message "Instalando NVM (Node Version Manager)..."
  
  # Instalar o NVM
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  
  # Configurar NVM no ambiente atual
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  
  if [ $? -ne 0 ]; then
    log_error "Falha ao instalar o NVM. Verificando alternativas..."
    
    # Se o NVM falhar, tentar instalar Node.js diretamente
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
      log_message "Instalando Node.js via apt..."
      apt-get update
      apt-get install -y nodejs npm
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
      log_message "Instalando Node.js via yum..."
      yum install -y nodejs npm
    elif [[ "$OS" == *"Arch"* ]]; then
      log_message "Instalando Node.js via pacman..."
      pacman -Sy nodejs npm
    else
      log_error "Sistema operacional não suportado para instalação direta de Node.js."
      log_error "Por favor, instale o Node.js manualmente e tente novamente."
      exit 1
    fi
  else
    log_message "NVM instalado com sucesso."
  fi
fi

# Verificar se o NVM está disponível
if command -v nvm &>/dev/null; then
  log_message "Instalando Node.js LTS via NVM..."
  nvm install --lts
  nvm use --lts
else
  log_warning "NVM não está disponível no ambiente atual."
  
  # Verificar se o Node.js já está instalado
  if command -v node &>/dev/null; then
    NODE_VERSION=$(node -v)
    log_message "Node.js $NODE_VERSION já está instalado."
  else
    log_error "Node.js não está instalado e NVM não está disponível."
    log_error "A instalação não pode continuar."
    exit 1
  fi
fi

# Verificar a versão do Node.js
NODE_VERSION=$(node -v)
log_message "Node.js versão $NODE_VERSION está sendo utilizado."

# Verificar se o setup-alt.js existe
if [ ! -f "setup-alt.js" ]; then
  log_error "O arquivo setup-alt.js não foi encontrado no diretório atual."
  log_error "Certifique-se de estar no diretório correto."
  exit 1
fi

# Executar o script de configuração
log_message "Iniciando o script de configuração do Clint Dashboard..."
node setup-alt.js

# Verificar se a execução foi bem-sucedida
if [ $? -eq 0 ]; then
  log_message "Instalação concluída com sucesso!"
  log_message "O Clint Dashboard foi configurado corretamente."
else
  log_error "Ocorreu um erro durante a execução do script de configuração."
  log_error "Verifique as mensagens de erro acima para mais detalhes."
  exit 1
fi

exit 0 