"""
routes/itens.py — Rotas relacionadas ao recurso "Itens" (Artigos Esportivos).

Define um Blueprint Flask com as rotas HTTP para o cadastro e listagem
de itens da coleção de esportes.

Estrutura da tabela `itens` (simplificada):
    - esporte: TEXT com CHECK ('Futebol', 'Basquete', 'Futebol Americano', 'Vôlei')
    - tipo:    TEXT com CHECK ('Camisa', 'Bola', 'Calçado', 'Acessório/Outros')
    Os nomes são armazenados diretamente, sem FKs para lookup tables.
"""

import sqlite3
from flask import Blueprint, request, jsonify
from database.db import get_db   # helper: database/db.py

# Blueprint do módulo de itens
itens_bp = Blueprint("itens", __name__)


# ======================================================================
# POST /api/itens — Cadastra um novo item no banco de dados
# ======================================================================
@itens_bp.route("/itens", methods=["POST"])
def create_item():
    """
    POST /api/itens

    Recebe os dados de um novo item em JSON, valida e insere na tabela `itens`.

    Corpo esperado (JSON):
        {
            "nome":               "Camisa Seleção Brasileira 2002",
            "esporte":            "Futebol",
            "tipo":               "Camisa",
            "ano_artigo":         "2002",       (opcional)
            "estado_conservacao": "Novo",       ('Novo', 'Conservado' ou 'Usado')
            "descricao":          "..."         (opcional)
        }

    Retornos:
        201 Created  — Item cadastrado com sucesso.
        400 Bad Request — Dados inválidos ou ausentes.
        500 Internal Server Error — Falha ao gravar no banco.
    """
    dados = request.get_json(force=True, silent=True)

    if not dados:
        return jsonify({
            "sucesso": False,
            "mensagem": "Corpo da requisição ausente ou JSON inválido."
        }), 400

    # --- Validação dos campos obrigatórios ---
    campos_obrigatorios = ["nome", "esporte", "tipo", "estado_conservacao"]
    for campo in campos_obrigatorios:
        if campo not in dados or not dados[campo] or str(dados[campo]).strip() == "":
            return jsonify({
                "sucesso": False,
                "mensagem": f"O campo obrigatório '{campo}' está ausente ou vazio."
            }), 400

    # --- Validação dos valores permitidos ---
    esportes_permitidos = ["Futebol", "Basquete", "Futebol Americano", "Vôlei"]
    if dados["esporte"] not in esportes_permitidos:
        return jsonify({
            "sucesso": False,
            "mensagem": f"esporte deve ser um de: {', '.join(esportes_permitidos)}."
        }), 400

    tipos_permitidos = ["Camisa", "Bola", "Calçado", "Acessório/Outros"]
    if dados["tipo"] not in tipos_permitidos:
        return jsonify({
            "sucesso": False,
            "mensagem": f"tipo deve ser um de: {', '.join(tipos_permitidos)}."
        }), 400

    estados_permitidos = ["Novo", "Conservado", "Usado"]
    if dados["estado_conservacao"] not in estados_permitidos:
        return jsonify({
            "sucesso": False,
            "mensagem": f"estado_conservacao deve ser: {', '.join(estados_permitidos)}."
        }), 400

    # --- Inserção no banco de dados SQLite ---
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO itens (nome, esporte, tipo, ano_artigo, estado_conservacao, descricao)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                dados["nome"].strip(),
                dados["esporte"],
                dados["tipo"],
                dados.get("ano_artigo") or None,
                dados["estado_conservacao"],
                dados.get("descricao") or None,
            )
        )
        conn.commit()
        novo_id = cursor.lastrowid
    except sqlite3.IntegrityError as e:
        conn.close()
        return jsonify({
            "sucesso": False,
            "mensagem": f"Erro de integridade ao salvar o item: {str(e)}"
        }), 400
    except Exception as e:
        conn.close()
        return jsonify({
            "sucesso": False,
            "mensagem": f"Erro ao salvar no banco: {str(e)}"
        }), 500
    finally:
        conn.close()

    return jsonify({
        "sucesso": True,
        "mensagem": "Item cadastrado com sucesso!",
        "item": {
            "id":                 novo_id,
            "nome":               dados["nome"],
            "esporte":            dados["esporte"],
            "tipo":               dados["tipo"],
            "ano_artigo":         dados.get("ano_artigo"),
            "estado_conservacao": dados["estado_conservacao"],
            "descricao":          dados.get("descricao")
        }
    }), 201


# ======================================================================
# GET /api/itens — Lista todos os itens cadastrados
# ======================================================================
@itens_bp.route("/itens", methods=["GET"])
def list_itens():
    """
    GET /api/itens

    Retorna todos os itens do vault ordenados do mais recente ao mais antigo.
    Os campos esporte e tipo já estão como texto — sem necessidade de JOIN.

    Retornos:
        200 OK — Lista de itens (pode ser vazia).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            id,
            nome,
            esporte,
            tipo,
            ano_artigo,
            estado_conservacao,
            descricao,
            data_cadastro
        FROM itens
        ORDER BY data_cadastro DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    itens = [dict(row) for row in rows]
    return jsonify({"sucesso": True, "itens": itens}), 200


# ======================================================================
# GET /api/itens/<id> — Busca um item específico
# ======================================================================
@itens_bp.route("/itens/<int:item_id>", methods=["GET"])
def get_item(item_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            id, nome, esporte, tipo, ano_artigo, estado_conservacao, descricao, data_cadastro
        FROM itens WHERE id = ?
    """, (item_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"sucesso": False, "mensagem": "Item não encontrado."}), 404

    return jsonify({"sucesso": True, "item": dict(row)}), 200


# ======================================================================
# PUT /api/itens/<id> — Atualiza um item específico
# ======================================================================
@itens_bp.route("/itens/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    dados = request.get_json(force=True, silent=True)
    if not dados:
        return jsonify({"sucesso": False, "mensagem": "Dados inválidos."}), 400

    # Validação simples
    campos_obrigatorios = ["nome", "esporte", "tipo", "estado_conservacao"]
    for campo in campos_obrigatorios:
        if campo not in dados or not dados[campo] or str(dados[campo]).strip() == "":
            return jsonify({"sucesso": False, "mensagem": f"O campo '{campo}' é obrigatório."}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE itens
            SET nome = ?, esporte = ?, tipo = ?, ano_artigo = ?, estado_conservacao = ?, descricao = ?
            WHERE id = ?
        """, (
            dados["nome"].strip(),
            dados["esporte"],
            dados["tipo"],
            dados.get("ano_artigo") or None,
            dados["estado_conservacao"],
            dados.get("descricao") or None,
            item_id
        ))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"sucesso": False, "mensagem": "Item não encontrado."}), 404
            
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Item atualizado com sucesso!"}), 200


# ======================================================================
# DELETE /api/itens/<id> — Deleta um item específico
# ======================================================================
@itens_bp.route("/itens/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM itens WHERE id = ?", (item_id,))
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"sucesso": False, "mensagem": "Item não encontrado."}), 404
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Item deletado com sucesso!"}), 200
