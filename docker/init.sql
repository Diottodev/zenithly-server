-- Script de inicialização do banco de dados PostgreSQL
-- Este arquivo é executado automaticamente quando o container do PostgreSQL é criado pela primeira vez

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurações de timezone
SET timezone = 'UTC';
