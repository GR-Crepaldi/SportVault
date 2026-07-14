import sqlite3
import os

# Caminho para o banco de dados (na mesma pasta deste arquivo)
DB_PATH = os.path.join(os.path.dirname(__file__), "sportvault.db")

def get_db():
    """
    Estabelece uma conexão com o banco de dados SQLite.
    Configura para retornar linhas como dicionários, o que facilita o manuseio dos dados.
    """
    conn = sqlite3.connect(DB_PATH)
    # Permite acessar as colunas pelo nome (ex: row['nome'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Inicializa o banco de dados criando as tabelas baseadas no schema.sql.
    """
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if not os.path.exists(schema_path):
        print("Arquivo schema.sql não encontrado!")
        return

    with open(schema_path, "r", encoding="utf-8") as f:
        schema_script = f.read()

    conn = get_db()
    cursor = conn.cursor()
    # Executa o script inteiro
    cursor.executescript(schema_script)
    conn.commit()
    conn.close()
    print("Banco de dados inicializado com sucesso.")

if __name__ == "__main__":
    # Executar este arquivo diretamente inicializará o banco
    init_db()
