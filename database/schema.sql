-- Schema do banco de dados para o sistema Clint
-- Criado em: 2023
-- Última atualização: 2023-09-30
-- PostgreSQL version

-- Não é necessário criar o banco de dados aqui, isso é feito pelo script setup.js
-- O comando para criar o banco seria:
-- CREATE DATABASE clint_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
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
-- A senha 'admin123' será hasheada
INSERT INTO usuarios (nome, email, senha, cargo, admin) VALUES 
('admin', 'admin@admin.com', '$2a$10$KJiVK5INpS5sQFw3K0D8x.x3xpfJ7XGw5hRXXoFSqq3ZHMhPP.qWy', 'Administrador', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Tabela para registro de atividades (log)
CREATE TABLE IF NOT EXISTS log_atividades (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Função para registrar login de usuário
CREATE OR REPLACE FUNCTION registrar_login(usuario_email VARCHAR(100), ip_address VARCHAR(45))
RETURNS VOID AS $$
DECLARE
    usuario_id INTEGER;
BEGIN
    -- Obter ID do usuário
    SELECT id INTO usuario_id FROM usuarios WHERE email = usuario_email;
    
    -- Atualizar data do último login
    UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = usuario_id;
    
    -- Registrar atividade de login
    INSERT INTO log_atividades (usuario_id, acao, descricao, ip) 
    VALUES (usuario_id, 'LOGIN', CONCAT('Login realizado em ', CURRENT_TIMESTAMP), ip_address);
END;
$$ LANGUAGE plpgsql;

-- Função para criar um novo usuário
CREATE OR REPLACE FUNCTION criar_usuario(
    p_nome VARCHAR(100),
    p_email VARCHAR(100),
    p_senha VARCHAR(255),
    p_cargo VARCHAR(50),
    p_admin BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
    novo_id INTEGER;
BEGIN
    INSERT INTO usuarios (nome, email, senha, cargo, admin)
    VALUES (p_nome, p_email, p_senha, p_cargo, p_admin)
    RETURNING id INTO novo_id;
    
    RETURN novo_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários sobre as senhas:
-- Estas senhas são hashes bcrypt para:
-- admin123 -> $2a$10$KJiVK5INpS5sQFw3K0D8x.x3xpfJ7XGw5hRXXoFSqq3ZHMhPP.qWy
-- lucas123 -> $2a$10$5t6RvJ.5jG1Nst9iQmcR5O6X.CeVsO57Y1FPv8.S0QNmI4YW4WV1C
-- joao123 -> $2a$10$JMKpLVKn91EfMlPmSkVr9OfMKmUcKJnE.ZuyCf9LJjABxhQh2NDse
-- maria123 -> $2a$10$iHLZVRJaNuMOI7VGbQn6KO48eUGgcE1hy1Q3sLgMJLlI7HEpPZ0ki 