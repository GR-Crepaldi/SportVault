"""
run.py — Script de inicialização da aplicação no diretório raiz.

Importa a factory da aplicação do pacote backend e executa o servidor.
"""

import sys
import os

# Adiciona o diretório 'backend' ao PYTHONPATH para evitar problemas de importação
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    # Executa o Flask na porta 5000 com o modo de depuração ativado
    app.run(debug=True, port=5000)
