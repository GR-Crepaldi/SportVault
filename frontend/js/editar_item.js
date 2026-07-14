'use strict';

const TOKEN_KEY    = 'sportvault_token';
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const DESCRICAO_MAX_CHARS = 500;

document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacao();

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        alert("ID do item não fornecido!");
        window.location.href = 'listar_itens.html';
        return;
    }

    // Configura botões de voltar
    document.getElementById('btn-voltar-inicio').href = `informacao_item.html?id=${itemId}`;
    document.getElementById('btn-cancelar').href = `informacao_item.html?id=${itemId}`;

    await carregarDadosItem(itemId);
    inicializarContadorDescricao();
    configurarEnvioFormulario(itemId);
});

function verificarAutenticacao() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        window.location.href = '../pages/login.html';
    }
}

async function carregarDadosItem(itemId) {
    const loading = document.getElementById('loading-feedback');
    const form = document.getElementById('form-editar-item');
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const res = await fetch(`${API_BASE_URL}/itens/${itemId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.sucesso && data.item) {
            loading.hidden = true;
            form.hidden = false;
            
            const item = data.item;
            document.getElementById('nome').value = item.nome;
            document.getElementById('esporte').value = item.esporte;
            document.getElementById('tipo').value = item.tipo;
            document.getElementById('ano-artigo').value = item.ano_artigo || '';
            
            const radioSelecionado = document.querySelector(`input[name="estado_conservacao"][value="${item.estado_conservacao}"]`);
            if (radioSelecionado) radioSelecionado.checked = true;

            document.getElementById('descricao').value = item.descricao || '';
            document.getElementById('descricao-contador').textContent = `${(item.descricao || '').length} / ${DESCRICAO_MAX_CHARS}`;
        } else {
            loading.textContent = "Erro: " + (data.mensagem || "Item não encontrado.");
        }
    } catch (e) {
        loading.textContent = "Erro de conexão com o servidor.";
    }
}

function inicializarContadorDescricao() {
    const textarea = document.getElementById('descricao');
    const contador = document.getElementById('descricao-contador');
    if (!textarea || !contador) return;

    textarea.addEventListener('input', () => {
        const tamanhoAtual = textarea.value.length;
        contador.textContent = `${tamanhoAtual} / ${DESCRICAO_MAX_CHARS}`;
    });
}

function configurarEnvioFormulario(itemId) {
    const form = document.getElementById('form-editar-item');
    if (!form) return;

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const btnSalvar = document.getElementById('btn-salvar');

        const dados = new FormData(form);
        const payload = {
            nome:               dados.get('nome')?.trim(),
            esporte:            dados.get('esporte'),
            tipo:               dados.get('tipo'),
            ano_artigo:         dados.get('ano_artigo')?.trim() || null,
            estado_conservacao: dados.get('estado_conservacao'),
            descricao:          dados.get('descricao')?.trim() || null,
        };

        setCarregando(btnSalvar, true);

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const resposta = await fetch(`${API_BASE_URL}/itens/${itemId}`, {
                method:  'PUT',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                exibirFeedback('✅ Alterações salvas com sucesso! Redirecionando...', 'success');
                setTimeout(() => {
                    window.location.href = `informacao_item.html?id=${itemId}`;
                }, 1500);
            } else {
                exibirFeedback(`❌ ${resultado?.mensagem || 'Erro ao atualizar.'}`, 'error');
                setCarregando(btnSalvar, false);
            }
        } catch (erro) {
            exibirFeedback('❌ Não foi possível conectar ao servidor.', 'error');
            setCarregando(btnSalvar, false);
        }
    });
}

function exibirFeedback(mensagem, tipo) {
    const feedbackEl = document.getElementById('form-feedback');
    if (!feedbackEl) return;
    feedbackEl.classList.remove('form-feedback--success', 'form-feedback--error');
    feedbackEl.classList.add(`form-feedback--${tipo}`);
    feedbackEl.textContent = mensagem;
    feedbackEl.hidden = false;
}

function setCarregando(btnElement, isCarregando) {
    if (!btnElement) return;
    const txt = btnElement.querySelector('.btn-text');
    const spn = btnElement.querySelector('.btn-spinner');
    if (isCarregando) {
        btnElement.disabled = true;
        btnElement.classList.add('btn--loading');
        if (txt) txt.style.opacity = '0';
        if (spn) spn.hidden = false;
    } else {
        btnElement.disabled = false;
        btnElement.classList.remove('btn--loading');
        if (txt) txt.style.opacity = '1';
        if (spn) spn.hidden = true;
    }
}
