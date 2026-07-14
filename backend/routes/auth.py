"""
routes/auth.py — Rotas relacionadas à autenticação de usuários.

Define um Blueprint Flask com as rotas HTTP para cadastro, login e logout.
Utiliza Flask-JWT-Extended para gerenciar sessões/tokens e bcrypt para hash de senhas.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import sqlite3
from database.db import get_db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Recebe nome, email e senha e cadastra um novo usuário.
    Garante que não haja dois usuários com o mesmo email.
    """
    dados = request.get_json(force=True, silent=True)
    if not dados:
        return jsonify({"sucesso": False, "mensagem": "Corpo da requisição ausente ou JSON inválido."}), 400

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    confirmar_senha = dados.get("confirmar_senha")

    if not nome or not email or not senha or not confirmar_senha:
        return jsonify({"sucesso": False, "mensagem": "Nome, email, senha e confirmação de senha são obrigatórios."}), 400

    if senha != confirmar_senha:
        return jsonify({"sucesso": False, "mensagem": "A senha e a confirmação de senha não coincidem."}), 400

    # Gera o hash da senha
    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", 
                       (nome, email, senha_hash.decode('utf-8')))
        conn.commit()
    except sqlite3.IntegrityError:
        # Se ocorrer um erro de integridade (ex: email já existe por causa do UNIQUE no BD)
        conn.close()
        return jsonify({"sucesso": False, "mensagem": "Já existe uma conta com este email."}), 409
    
    conn.close()

    return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Realiza o login de um usuário utilizando email e senha.
    Retorna um token JWT caso as credenciais sejam válidas.
    """
    dados = request.get_json(force=True, silent=True)
    if not dados:
        return jsonify({"sucesso": False, "mensagem": "Corpo da requisição ausente ou JSON inválido."}), 400

    email = dados.get("email")
    senha = dados.get("senha")

    if not email or not senha:
        return jsonify({"sucesso": False, "mensagem": "Email e senha são obrigatórios."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, senha FROM usuarios WHERE email = ?", (email,))
    usuario = cursor.fetchone()
    conn.close()

    if not usuario:
        return jsonify({"sucesso": False, "mensagem": "Credenciais inválidas."}), 401

    senha_hash = usuario['senha'].encode('utf-8')
    
    # Verifica a senha
    if not bcrypt.checkpw(senha.encode('utf-8'), senha_hash):
        return jsonify({"sucesso": False, "mensagem": "Credenciais inválidas."}), 401

    # Cria o token JWT com a identidade do usuário (pode ser o ID ou um dict)
    access_token = create_access_token(identity=usuario['id'])
    
    return jsonify({
        "sucesso": True, 
        "mensagem": "Login realizado com sucesso!",
        "token": access_token,
        "usuario": {
            "id": usuario['id'],
            "nome": usuario['nome']
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    GET /api/auth/me
    Retorna os dados do usuário atualmente logado. Requer o token JWT.
    """
    usuario_id = get_jwt_identity()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, email, data_cadastro FROM usuarios WHERE id = ?", (usuario_id,))
    usuario = cursor.fetchone()
    conn.close()

    if not usuario:
        return jsonify({"sucesso": False, "mensagem": "Usuário não encontrado."}), 404

    return jsonify({
        "sucesso": True,
        "usuario": dict(usuario)
    }), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    POST /api/auth/logout
    Para JWTs padrão (sem blacklist), o logout é frequentemente feito apagando o token no cliente.
    Aqui apenas retornamos uma mensagem de sucesso, pois a invalidação completa no backend 
    exigiria implementação extra de Revoked Token List (blocklist).
    """
    return jsonify({"sucesso": True, "mensagem": "Logout realizado (o token deve ser descartado no cliente)."}), 200
