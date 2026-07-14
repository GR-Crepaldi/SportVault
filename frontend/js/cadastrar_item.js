/**
 * cadastrar_item.js
 * =============================================================================
 * Script responsável pelo comportamento interativo da página "Cadastrar Item".
 *
 * Responsabilidades:
 *  1. Verificar autenticação do usuário (token no localStorage).
 *  2. Contador de caracteres em tempo real para o campo "descrição".
 *  3. Validação customizada do formulário antes do envio.
 *  4. Submissão assíncrona (fetch) para a API do back-end.
 *  5. Exibição de feedback de sucesso ou erro para o usuário.
 *
 * Convenções:
 *  - Funções nomeadas em camelCase com JSDoc.
 *  - Todas as mensagens voltadas ao usuário em português (pt-BR).
 *  - Nenhuma dependência de biblioteca externa.
 * =============================================================================
 */

'use strict';

/* =============================================================================
   CONSTANTES E CONFIGURAÇÃO
============================================================================= */

/** Chave usada para armazenar o token JWT no localStorage. */
const TOKEN_KEY = 'sportvault_token';

/** Chave usada para armazenar os dados do usuário no localStorage. */
const USER_KEY  = 'sportvault_user';

/** URL base da API REST do back-end. Ajuste conforme o ambiente. */
const API_BASE_URL = 'http://localhost:5000/api';

/** Limite máximo de caracteres para o campo "descrição". */
const DESCRICAO_MAX_CHARS = 500;


/* =============================================================================
   INICIALIZAÇÃO — aguarda o DOM estar pronto
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    iniciarContadorDescricao();
    iniciarSubmissaoFormulario();
});


/* =============================================================================
   1. AUTENTICAÇÃO
============================================================================= */

/**
 * verificarAutenticacao
 * ---------------------------------------------------------------------------
 * Verifica se há um token válido no localStorage.
 * Caso o usuário não esteja autenticado, redireciona para a tela de login.
 */
function verificarAutenticacao() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        // Redireciona para o login mantendo a referência de volta
        window.location.href = '../pages/login.html';
    }
}


/* =============================================================================
   2. CONTADOR DE CARACTERES — TEXTAREA DE DESCRIÇÃO
============================================================================= */

/**
 * iniciarContadorDescricao
 * ---------------------------------------------------------------------------
 * Liga o evento de input no textarea "descrição" para atualizar o contador
 * visual de caracteres restantes em tempo real.
 */
function iniciarContadorDescricao() {
    const textarea  = document.getElementById('descricao');
    const contador  = document.getElementById('descricao-contador');

    if (!textarea || !contador) return;

    /**
     * atualizarContador
     * Calcula os caracteres digitados e atualiza o span do contador.
     * Aplica cor de aviso quando próximo do limite.
     */
    function atualizarContador() {
        const total = textarea.value.length;
        contador.textContent = `${total} / ${DESCRICAO_MAX_CHARS}`;

        // Aviso visual quando restam apenas 50 caracteres
        if (total >= DESCRICAO_MAX_CHARS - 50) {
            contador.style.color = '#fbbf24';   // amarelo âmbar
        } else {
            contador.style.color = '';           // restaura a cor padrão do CSS
        }
    }

    textarea.addEventListener('input', atualizarContador);
}


/* =============================================================================
   3. VALIDAÇÃO DO FORMULÁRIO
============================================================================= */

/**
 * validarFormulario
 * ---------------------------------------------------------------------------
 * Executa as validações customizadas antes do envio.
 *
 * @param {FormData} dados - Dados coletados do formulário.
 * @returns {{ valido: boolean, mensagem: string }}
 */
function validarFormulario(dados) {
    const nome              = dados.get('nome')?.trim();
    const esporte           = dados.get('esporte');
    const tipo              = dados.get('tipo');
    const estadoConservacao = dados.get('estado_conservacao');
    const anoArtigo         = dados.get('ano_artigo')?.trim();

    // --- Campos obrigatórios ---
    if (!nome) {
        return { valido: false, mensagem: 'O nome do artigo é obrigatório.' };
    }

    if (!esporte) {
        return { valido: false, mensagem: 'Selecione o esporte do artigo.' };
    }

    if (!tipo) {
        return { valido: false, mensagem: 'Selecione o tipo do item.' };
    }

    if (!estadoConservacao) {
        return { valido: false, mensagem: 'Informe o estado de conservação do artigo.' };
    }

    // --- Validação de formato do campo "Ano / Temporada" (quando preenchido) ---
    if (anoArtigo) {
        const regexAno = /^\d{4}(\/\d{2,4})?$/;
        if (!regexAno.test(anoArtigo)) {
            return {
                valido: false,
                mensagem: 'O formato do ano é inválido. Use AAAA ou AAAA/AA (ex.: 2002, 2024/25).',
            };
        }
    }

    return { valido: true, mensagem: '' };
}


/* =============================================================================
   4. SUBMISSÃO DO FORMULÁRIO
============================================================================= */

/**
 * iniciarSubmissaoFormulario
 * ---------------------------------------------------------------------------
 * Escuta o evento "submit" do formulário, executa a validação customizada
 * e, se tudo estiver correto, envia os dados para a API via fetch.
 */
function iniciarSubmissaoFormulario() {
    const form      = document.getElementById('form-cadastrar-item');
    const btnSalvar = document.getElementById('btn-salvar');

    if (!form) return;

    form.addEventListener('submit', async (evento) => {
        // Impede o comportamento padrão do navegador (recarregar a página)
        evento.preventDefault();

        const dados = new FormData(form);

        // --- Validação customizada ---
        const { valido, mensagem } = validarFormulario(dados);
        if (!valido) {
            exibirFeedback(mensagem, 'error');
            return;
        }

        // --- Monta o payload para a API ---
        const payload = {
            nome:               dados.get('nome').trim(),
            esporte:            dados.get('esporte'),
            tipo:               dados.get('tipo'),
            ano_artigo:         dados.get('ano_artigo')?.trim() || null,
            estado_conservacao: dados.get('estado_conservacao'),
            descricao:          dados.get('descricao')?.trim() || null,
        };

        // --- Estado de carregamento no botão ---
        setCarregando(btnSalvar, true);

        try {
            const token    = localStorage.getItem(TOKEN_KEY);
            const resposta = await fetch(`${API_BASE_URL}/itens`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                // Sucesso: exibe mensagem e reseta o formulário sem redirecionar
                exibirFeedback('✅ Item cadastrado com sucesso!', 'success');
                form.reset();
                document.getElementById('descricao-contador').textContent = `0 / ${DESCRICAO_MAX_CHARS}`;
                // Oculta o estado de carregamento do botão
                setCarregando(btnSalvar, false);
            } else {
                // Erro vindo da API
                const mensagemErro = resultado?.message || 'Erro ao cadastrar o item. Tente novamente.';
                exibirFeedback(`❌ ${mensagemErro}`, 'error');
            }
        } catch (erro) {
            // Erro de rede ou indisponibilidade do servidor
            console.error('[cadastrar_item.js] Erro de rede:', erro);
            exibirFeedback(
                '❌ Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
                'error'
            );
        } finally {
            // Sempre restaura o estado do botão
            setCarregando(btnSalvar, false);
        }
    });
}


/* =============================================================================
   5. FUNÇÕES AUXILIARES DE UI
============================================================================= */

/**
 * exibirFeedback
 * ---------------------------------------------------------------------------
 * Exibe uma mensagem de sucesso ou erro na área de feedback do formulário.
 * A mensagem é anunciada para leitores de tela via aria-live="polite".
 *
 * @param {string} mensagem   - Texto a exibir para o usuário.
 * @param {'success'|'error'} tipo - Tipo visual da mensagem.
 */
function exibirFeedback(mensagem, tipo) {
    const feedbackEl = document.getElementById('form-feedback');
    if (!feedbackEl) return;

    // Remove classes anteriores
    feedbackEl.classList.remove('form-feedback--success', 'form-feedback--error');
    feedbackEl.classList.add(`form-feedback--${tipo}`);
    feedbackEl.textContent = mensagem;
    feedbackEl.hidden      = false;

    // Rola suavemente até o feedback para garantir visibilidade
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * setCarregando
 * ---------------------------------------------------------------------------
 * Alterna o estado visual do botão de submit entre "normal" e "carregando".
 * Desabilita o botão durante o envio para evitar submissões duplicadas.
 *
 * @param {HTMLButtonElement} botao      - Elemento do botão.
 * @param {boolean}           carregando - true para exibir spinner; false para restaurar.
 */
function setCarregando(botao, carregando) {
    const textEl    = botao.querySelector('.btn-text');
    const spinnerEl = botao.querySelector('.btn-spinner');

    if (carregando) {
        botao.disabled          = true;
        botao.setAttribute('aria-busy', 'true');
        if (textEl)    textEl.textContent    = 'Salvando…';
        if (spinnerEl) spinnerEl.hidden      = false;
    } else {
        botao.disabled          = false;
        botao.setAttribute('aria-busy', 'false');
        if (textEl)    textEl.textContent    = 'Salvar Item';
        if (spinnerEl) spinnerEl.hidden      = true;
    }
}
