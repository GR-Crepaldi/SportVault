/**
 * api.js — Módulo de comunicação com a API do backend (SportVault Flask).
 *
 * Centraliza todas as chamadas HTTP feitas pelo frontend,
 * mantendo a lógica de rede separada da lógica de interface.
 */

// URL base do backend Flask. Altere aqui caso o servidor mude de porta ou host.
const BASE_URL = "http://127.0.0.1:5000/api";

/**
 * Cadastra um novo item na coleção via POST.
 *
 * @param {Object} dadosItem - Dados do item a ser cadastrado.
 * @param {string} dadosItem.nome              - Nome do item (obrigatório).
 * @param {number} dadosItem.esporte_id        - ID do esporte relacionado (obrigatório).
 * @param {number} dadosItem.tipo_id           - ID do tipo do item (obrigatório).
 * @param {string} dadosItem.estado_conservacao - Estado de conservação: 'Novo', 'Conservado' ou 'Usado' (obrigatório).
 * @param {number} [dadosItem.time_id]         - ID do time relacionado (opcional).
 * @param {string} [dadosItem.ano_artigo]      - Ano ou temporada do item (opcional).
 * @param {string} [dadosItem.descricao]       - Descrição/observações adicionais (opcional).
 *
 * @returns {Promise<Object>} Resposta da API em formato JSON.
 *
 * @example
 * const item = {
 *   nome: "Camisa Seleção Brasileira 2002",
 *   esporte_id: 1,
 *   tipo_id: 1,
 *   estado_conservacao: "Novo",
 *   ano_artigo: "2002"
 * };
 * cadastrar_Item(item);
 */
async function cadastrar_Item(dadosItem) {
  try {
    const resposta = await fetch(`${BASE_URL}/itens`, {
      method: "POST",
      headers: {
        // Informa ao servidor que o corpo da requisição é JSON
        "Content-Type": "application/json",
      },
      // Serializa o objeto JavaScript para string JSON
      body: JSON.stringify(dadosItem),
    });

    // Converte o corpo da resposta HTTP para objeto JavaScript
    const resultado = await resposta.json();

    if (!resposta.ok) {
      // A requisição chegou ao servidor, mas retornou erro (4xx ou 5xx)
      console.error(
        `[SportVault API] Erro ao cadastrar item — Status ${resposta.status}:`,
        resultado
      );
      return resultado;
    }

    // Sucesso: exibe o resultado retornado pela API
    console.log("[SportVault API] Item cadastrado com sucesso:", resultado);
    return resultado;

  } catch (erro) {
    // Erro de rede (servidor offline, CORS, timeout, etc.)
    console.error("[SportVault API] Falha na comunicação com o servidor:", erro);
    throw erro;
  }
}
