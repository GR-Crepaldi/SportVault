-- =============================================================
--  SportVault — Schema do Banco de Dados (SQLite3)
--  Descrição: Estrutura normalizada para gerenciamento de
--             artigos esportivos colecionáveis.
--  Autor: SportVault DBA
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- TABELA: esportes
-- Lookup table com os esportes disponíveis no sistema.
-- Garante integridade: apenas valores permitidos são inseridos.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS esportes (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT    NOT NULL UNIQUE
                 CHECK(nome IN ('Futebol', 'Basquete', 'Futebol Americano', 'Vôlei'))
);

-- -------------------------------------------------------------
-- TABELA: tipos_item
-- Lookup table com as categorias de artigos esportivos.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipos_item (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT    NOT NULL UNIQUE
                 CHECK(nome IN ('Camisa', 'Bola', 'Calçado', 'Acessório/Outros'))
);

-- -------------------------------------------------------------
-- TABELA: times
-- Armazena times e seleções vinculados a um esporte específico.
-- Relacionamento: times N:1 esportes
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS times (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    esporte_id INTEGER NOT NULL,
    pais       TEXT,                          -- Ex: Brasil, EUA (opcional)
    FOREIGN KEY (esporte_id) REFERENCES esportes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    UNIQUE(nome, esporte_id)                  -- Evita duplicata no mesmo esporte
);

-- -------------------------------------------------------------
-- TABELA: usuarios
-- Armazena os usuários do sistema (colecionadores/admins).
-- Garante que o email seja único no sistema.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    senha         TEXT    NOT NULL,
    data_cadastro TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------------
-- TABELA: itens
-- Tabela principal da aplicação.
-- Representa cada artigo esportivo cadastrado no vault.
-- Os campos 'esporte' e 'tipo' armazenam os nomes diretamente
-- (TEXT com CHECK), eliminando a necessidade de FKs e JOINs
-- no cadastro e consulta de itens.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                TEXT    NOT NULL,
    esporte             TEXT    NOT NULL
                                CHECK(esporte IN ('Futebol', 'Basquete', 'Futebol Americano', 'Vôlei')),
    tipo                TEXT    NOT NULL
                                CHECK(tipo IN ('Camisa', 'Bola', 'Calçado', 'Acessório/Outros')),
    ano_artigo          TEXT,                 -- Ex.: "2002", "2024/25" (temporadas flexíveis)
    estado_conservacao  TEXT    NOT NULL
                                CHECK(estado_conservacao IN ('Novo', 'Conservado', 'Usado')),
    descricao           TEXT,                 -- Descrição/observações adicionais (opcional)
    data_cadastro       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================
-- DADOS INICIAIS (Seed das tabelas de lookup)
-- =============================================================

-- Esportes
INSERT OR IGNORE INTO esportes (nome) VALUES
    ('Futebol'),
    ('Basquete'),
    ('Futebol Americano'),
    ('Vôlei');

-- Tipos de item
INSERT OR IGNORE INTO tipos_item (nome) VALUES
    ('Camisa'),
    ('Bola'),
    ('Calçado'),
    ('Acessório/Outros');
