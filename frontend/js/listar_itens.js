/**
 * listar_itens.js
 * =============================================================================
 * Script responsável pela página "Minha Coleção" (listar_itens.html).
 *
 * Responsabilidades:
 *  1. Verificar autenticação do usuário via localStorage.
 *  2. Buscar todos os itens da coleção via GET /api/itens.
 *  3. Popular dinamicamente o <tbody> da tabela #tabela-itens.
 *  4. Exibir o estado vazio quando não há itens cadastrados.
 *  5. Exibir mensagens de feedback (carregando / erro / total).
 *
 * Convenções:
 *  - Funções nomeadas em camelCase com JSDoc.
 *  - Mensagens ao usuário em português (pt-BR).
 *  - Zero dependências externas.
 * =============================================================================
 */

'use strict';

/* =============================================================================
   CONSTANTES
============================================================================= */

/** Chave do token JWT no localStorage. */
const TOKEN_KEY = 'sportvault_token';

/** URL base da API REST. */
const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Mapa de classes CSS de badge por esporte.
 * Chave: valor exato salvo no banco.
 */
const BADGE_ESPORTE = {
    'Futebol':            'badge badge--futebol',
    'Basquete':           'badge badge--basquete',
    'Futebol Americano':  'badge badge--futebol-americano',
    'Vôlei':              'badge badge--volei',
};

/**
 * Mapa de classes CSS de badge por tipo de item.
 */
const BADGE_TIPO = {
    'Camisa':            'badge badge--camisa',
    'Bola':              'badge badge--bola',
    'Calçado':           'badge badge--calcado',
    'Acessório/Outros':  'badge badge--acessorio',
};

/**
 * Mapa de classes CSS de badge por estado de conservação.
 */
const BADGE_ESTADO = {
    'Novo':       'badge badge--novo',
    'Conservado': 'badge badge--conservado',
    'Usado':      'badge badge--usado',
};


/* =============================================================================
   INICIALIZAÇÃO — aguarda o DOM
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    carregarItens();
});


/* =============================================================================
   1. AUTENTICAÇÃO
============================================================================= */

/**
 * verificarAutenticacao
 * ---------------------------------------------------------------------------
 * Redireciona para o login se não houver token no localStorage.
 */
function verificarAutenticacao() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        window.location.href = '../pages/login.html';
    }
}


/* =============================================================================
   2. BUSCA DOS ITENS (GET /api/itens)
============================================================================= */

/**
 * carregarItens
 * ---------------------------------------------------------------------------
 * Busca todos os itens da coleção na API e delega a renderização.
 * Exibe spinner enquanto aguarda e trata erros de rede.
 */
async function carregarItens() {
    const tbody      = document.getElementById('tbody-itens');
    const emptyState = document.getElementById('empty-state');
    const feedback   = document.getElementById('table-feedback');
    const footerInfo = document.getElementById('table-footer-info');
    const contagem   = document.getElementById('contagem-itens');

    // Exibe estado de carregamento
    mostrarFeedback(feedback, '⏳ Carregando sua coleção…', false);

    try {
        const token    = localStorage.getItem(TOKEN_KEY);
        const resposta = await fetch(`${API_BASE_URL}/itens`, {
            method:  'GET',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const resultado = await resposta.json();

        // Esconde o feedback de carregamento
        feedback.hidden = true;

        if (!resposta.ok) {
            const msg = resultado?.mensagem || 'Erro ao buscar os itens.';
            mostrarFeedback(feedback, `❌ ${msg}`, true);
            return;
        }

        const itens = resultado.itens || [];

        if (itens.length === 0) {
            // Exibe estado vazio e esconde tabela
            document.querySelector('.table-responsive').hidden = true;
            emptyState.hidden = false;
            contagem.textContent = '0 artigos cadastrados';
            footerInfo.textContent = 'Nenhum item encontrado.';
            return;
        }

        // Oculta estado vazio e garante tabela visível
        emptyState.hidden = true;
        document.querySelector('.table-responsive').hidden = false;

        // Atualiza contagem no subtítulo
        contagem.textContent = `${itens.length} ${itens.length === 1 ? 'artigo cadastrado' : 'artigos cadastrados'}`;

        // Popula o tbody
        renderizarTabela(tbody, itens);

        // Atualiza rodapé da tabela
        footerInfo.textContent = `Total: ${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`;

    } catch (erro) {
        console.error('[listar_itens.js] Erro de rede:', erro);
        feedback.hidden = false;
        mostrarFeedback(
            feedback,
            '❌ Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
            true
        );
        contagem.textContent = 'Erro ao carregar';
    }
}


/* =============================================================================
   3. RENDERIZAÇÃO DA TABELA
============================================================================= */

/**
 * renderizarTabela
 * ---------------------------------------------------------------------------
 * Cria e insere as linhas <tr> dinamicamente no <tbody> da tabela.
 *
 * @param {HTMLTableSectionElement} tbody - Elemento <tbody> alvo.
 * @param {Array<Object>}           itens - Lista de itens retornada pela API.
 */
function renderizarTabela(tbody, itens) {
    // Limpa qualquer conteúdo anterior
    tbody.innerHTML = '';

    itens.forEach((item) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="col-id">${item.id}</td>
            <td class="col-nome">${escaparHTML(item.nome)}</td>
            <td class="col-esporte">
                <span class="${classeBadgeEsporte(item.esporte)}">
                    ${escaparHTML(item.esporte || '—')}
                </span>
            </td>
            <td class="col-tipo">
                <span class="${classeBadgeTipo(item.tipo)}">
                    ${escaparHTML(item.tipo || '—')}
                </span>
            </td>
            <td class="col-ano" style="text-align:center;">
                ${escaparHTML(item.ano_artigo || '—')}
            </td>
            <td class="col-estado" style="text-align:center; display: flex; justify-content: center; align-items: center; gap: 1rem;">
                <span class="${classeBadgeEstado(item.estado_conservacao)}">
                    ${escaparHTML(item.estado_conservacao || '—')}
                </span>
                <a href="../pages/informacao_item.html?id=${item.id}" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;">Detalhes</a>
            </td>
        `;

        tbody.appendChild(tr);
    });
}


/* =============================================================================
   4. FUNÇÕES AUXILIARES
============================================================================= */

/**
 * escaparHTML
 * ---------------------------------------------------------------------------
 * Escapa caracteres especiais HTML para prevenir XSS ao inserir dados
 * da API diretamente no innerHTML.
 *
 * @param {string} texto - Texto a escapar.
 * @returns {string} Texto seguro para inserção HTML.
 */
function escaparHTML(texto) {
    if (texto === null || texto === undefined) return '—';
    return String(texto)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

/**
 * classeBadgeEsporte
 * Retorna a classe CSS correta para o badge de esporte.
 * @param {string} esporte
 * @returns {string}
 */
function classeBadgeEsporte(esporte) {
    return BADGE_ESPORTE[esporte] || 'badge';
}

/**
 * classeBadgeTipo
 * Retorna a classe CSS correta para o badge de tipo.
 * @param {string} tipo
 * @returns {string}
 */
function classeBadgeTipo(tipo) {
    return BADGE_TIPO[tipo] || 'badge';
}

/**
 * classeBadgeEstado
 * Retorna a classe CSS correta para o badge de estado de conservação.
 * @param {string} estado
 * @returns {string}
 */
function classeBadgeEstado(estado) {
    return BADGE_ESTADO[estado] || 'badge';
}

/**
 * mostrarFeedback
 * ---------------------------------------------------------------------------
 * Exibe uma mensagem de status/erro na área de feedback da tabela.
 *
 * @param {HTMLElement} el    - Elemento de feedback.
 * @param {string}      msg   - Mensagem a exibir.
 * @param {boolean}     erro  - true adiciona classe de erro; false remove.
 */
function mostrarFeedback(el, msg, erro) {
    el.textContent = msg;
    el.hidden      = false;
    el.classList.toggle('table-feedback--error', erro);
}
