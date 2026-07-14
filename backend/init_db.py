import sqlite3
import os

# Caminho para o diretório atual do script (pasta backend)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Caminho para o arquivo do Banco de Dados SQLite (sportvault.db)
DB_PATH = os.path.join(BASE_DIR, "database", "sportvault.db")

# Caminho para o script SQL com as tabelas (schema.sql)
SCHEMA_PATH = os.path.join(BASE_DIR, "database", "schema.sql")


def inicializar_banco():
    """
    Conecta ao banco de dados SQLite e executa o script SQL do schema
    para criar as tabelas necessárias da aplicação SportVault.
    """
    # Conecta ao arquivo do banco de dados (o SQLite cria o arquivo se ele não existir)
    conexao = sqlite3.connect(DB_PATH)
    cursor = conexao.cursor()

    # Carrega e lê o arquivo de schema SQL contendo as queries de criação de tabelas
    with open(SCHEMA_PATH, "r", encoding="utf-8") as arquivo_schema:
        script_sql = arquivo_schema.read()

    # Executa o script SQL lido utilizando o método executescript()
    cursor.executescript(script_sql)

    # Comita/confirma as alterações e encerra a conexão
    conexao.commit()
    conexao.close()

    print("Banco de dados SQLite inicializado com sucesso!")


if __name__ == "__main__":
    inicializar_banco()
