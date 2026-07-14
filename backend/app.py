"""
app.py — Ponto de entrada principal da aplicação Flask.

Responsável por:
- Criar e configurar a instância do Flask.
- Registrar os Blueprints de cada módulo de rotas.
- Iniciar o servidor de desenvolvimento.
"""

from flask import Flask
from routes.itens import itens_bp  # Importa o Blueprint do módulo de itens
from routes.auth import auth_bp    # Importa o Blueprint de autenticação
from flask_cors import CORS  # Habilita CORS para requisições do frontend
# pyrefly: ignore [missing-import]
from flask_jwt_extended import JWTManager


def create_app():
    """
    Factory function que cria e configura a aplicação Flask.

    Usar uma factory facilita testes e ambientes diferentes (dev, prod).
    Retorna uma instância configurada de Flask.
    """
    app = Flask(__name__)

    # ----------------------------------------------------------------
    # Configurações da Aplicação
    # ----------------------------------------------------------------
    # Chave secreta para assinatura dos tokens JWT. Idealmente deve vir de um .env
    app.config["JWT_SECRET_KEY"] = "super-secret-sportvault-key" 
    
    # Inicializa a extensão JWTManager
    jwt = JWTManager(app)
    CORS(app)

    # ----------------------------------------------------------------
    # Registro de Blueprints
    # Cada Blueprint agrupa as rotas de um recurso específico.
    # url_prefix define o prefixo comum a todas as rotas do Blueprint.
    # ----------------------------------------------------------------
    app.register_blueprint(itens_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app


# Ponto de entrada: executado somente quando o arquivo é rodado diretamente.
if __name__ == "__main__":
    app = create_app()
    # debug=True recarrega o servidor automaticamente ao salvar e exibe erros detalhados.
    app.run(debug=True)
