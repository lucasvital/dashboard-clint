# Instruções de Instalação do Clint Dashboard

Este diretório contém scripts de instalação automatizada para configurar o Clint Dashboard tanto em sistemas Windows quanto Unix (Linux/macOS).

## Requisitos do Sistema

- Sistema operacional:
  - Windows 7/8/10/11
  - Linux (Debian, Ubuntu, CentOS, Fedora, etc.)
  - macOS
- Conexão com a internet
- Privilégios de administrador (recomendado)

## Instruções de Instalação

### Para Windows:

1. Abra o Explorador de Arquivos e navegue até o diretório onde os arquivos foram baixados
2. Clique com o botão direito no arquivo `install.bat` e selecione "Executar como administrador"
   - Se for solicitada permissão, clique em "Sim"
3. Aguarde a conclusão da instalação
4. Siga as instruções na tela para configurar o Clint Dashboard

### Para Linux/macOS:

1. Abra o Terminal
2. Navegue até o diretório onde os arquivos foram baixados:
   ```
   cd /caminho/para/diretorio
   ```
3. Dê permissão de execução ao script:
   ```
   chmod +x install.sh
   ```
4. Execute o script como superusuário:
   ```
   sudo ./install.sh
   ```
   - Se preferir executar sem privilégios de superusuário, use:
     ```
     ./install.sh
     ```
5. Aguarde a conclusão da instalação
6. Siga as instruções na tela para configurar o Clint Dashboard

## O que os scripts de instalação fazem?

Os scripts de instalação automatizam as seguintes tarefas:

1. Verificam se o Node.js já está instalado no sistema
2. Se não estiver instalado:
   - No Windows: Baixam e instalam o Node.js automaticamente
   - No Linux/macOS: Instalam o NVM (Node Version Manager) e, em seguida, instalam a versão LTS do Node.js
3. Verificam a existência do arquivo de configuração `setup-alt.js`
4. Executam o script de configuração `setup-alt.js` para configurar o Clint Dashboard

## Resolução de Problemas

### Erros comuns no Windows:

- **"Windows protegeu o seu PC"**: Clique em "Mais informações" e depois em "Executar assim mesmo"
- **Falha ao baixar o Node.js**: Certifique-se de que você está conectado à internet. Se o problema persistir, baixe o Node.js manualmente do site oficial: [https://nodejs.org/](https://nodejs.org/)

### Erros comuns no Linux/macOS:

- **"Permission denied"**: Certifique-se de que o script tem permissão de execução:
  ```
  chmod +x install.sh
  ```
- **"Command not found"**: Certifique-se de que você está no diretório correto e que o arquivo existe
- **Falha ao instalar o NVM**: Se o NVM falhar, o script tentará instalar o Node.js diretamente via gerenciador de pacotes

## Suporte

Em caso de problemas na instalação, entre em contato com o suporte técnico:

- Email: suporte@shortmidia.com.br 