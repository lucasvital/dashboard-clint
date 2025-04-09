-- Schema do banco de dados para o sistema Clint
-- Criado em: 2023
-- Última atualização: 2023

-- Criando o banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS clint_db;

-- Usando o banco de dados
USE clint_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    ativo BOOLEAN DEFAULT TRUE,
    admin BOOLEAN DEFAULT FALSE,
    token_reset_senha VARCHAR(100) NULL,
    expiracao_token TIMESTAMP NULL
);

-- Índices para melhorar a performance de consultas
CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_ativo ON usuarios(ativo);

-- Inserir usuário administrador padrão
-- Senha: admin123 (em uma implementação real, deve ser hasheada)
INSERT INTO usuarios (nome, email, senha, cargo, admin) VALUES 
('Admin', 'admin@clint.com', '$2a$10$KJiVK5INpS5sQFw3K0D8x.x3xpfJ7XGw5hRXXoFSqq3ZHMhPP.qWy', 'Administrador', TRUE);

-- Inserir alguns usuários de exemplo
INSERT INTO usuarios (nome, email, senha, cargo) VALUES 
('Lucas Vital', 'lucasvitalsilva17@gmail.com', '$2a$10$5t6RvJ.5jG1Nst9iQmcR5O6X.CeVsO57Y1FPv8.S0QNmI4YW4WV1C', 'Gerente'),
('João Silva', 'joao.silva@exemplo.com', '$2a$10$JMKpLVKn91EfMlPmSkVr9OfMKmUcKJnE.ZuyCf9LJjABxhQh2NDse', 'Analista'),
('Maria Santos', 'maria.santos@exemplo.com', '$2a$10$iHLZVRJaNuMOI7VGbQn6KO48eUGgcE1hy1Q3sLgMJLlI7HEpPZ0ki', 'Assistente');

-- Tabela para registro de atividades (log)
CREATE TABLE IF NOT EXISTS log_atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Procedimento para registrar login de usuário
DELIMITER //
CREATE PROCEDURE registrar_login(IN usuario_email VARCHAR(100), IN ip_address VARCHAR(45))
BEGIN
    DECLARE usuario_id INT;
    
    -- Obter ID do usuário
    SELECT id INTO usuario_id FROM usuarios WHERE email = usuario_email;
    
    -- Atualizar data do último login
    UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = usuario_id;
    
    -- Registrar atividade de login
    INSERT INTO log_atividades (usuario_id, acao, descricao, ip) 
    VALUES (usuario_id, 'LOGIN', CONCAT('Login realizado em ', CURRENT_TIMESTAMP), ip_address);
END //
DELIMITER ;

-- Procedure para criar um novo usuário
DELIMITER //
CREATE PROCEDURE criar_usuario(
    IN p_nome VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_senha VARCHAR(255),
    IN p_cargo VARCHAR(50),
    IN p_admin BOOLEAN
)
BEGIN
    INSERT INTO usuarios (nome, email, senha, cargo, admin)
    VALUES (p_nome, p_email, p_senha, p_cargo, p_admin);
    
    SELECT LAST_INSERT_ID() AS usuario_id;
END //
DELIMITER ;

-- Comentários sobre as senhas:
-- Estas senhas são apenas para exemplo e estão em formato hash bcrypt
-- admin123 -> $2a$10$KJiVK5INpS5sQFw3K0D8x.x3xpfJ7XGw5hRXXoFSqq3ZHMhPP.qWy
-- lucas123 -> $2a$10$5t6RvJ.5jG1Nst9iQmcR5O6X.CeVsO57Y1FPv8.S0QNmI4YW4WV1C
-- joao123 -> $2a$10$JMKpLVKn91EfMlPmSkVr9OfMKmUcKJnE.ZuyCf9LJjABxhQh2NDse
-- maria123 -> $2a$10$iHLZVRJaNuMOI7VGbQn6KO48eUGgcE1hy1Q3sLgMJLlI7HEpPZ0ki 