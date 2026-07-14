/**
 * auth.js — Lógica de Autenticação no Frontend
 * 
 * Lida com o envio dos formulários de login e cadastro,
 * efetuando chamadas para a API Flask e salvando o Token JWT.
 */

const BASE_URL = "http://127.0.0.1:5000/api";

// Elementos da Interface
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMsg = document.getElementById('error-message');

/**
 * Função utilitária para exibir erros na tela
 */
function showError(message) {
    if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
}

/**
 * Event Listener para o Formulário de Login
 */
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        try {
            const resposta = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            const resultado = await resposta.json();
            
            if (!resposta.ok) {
                showError(resultado.mensagem || "Erro ao realizar login.");
                return;
            }
            
            // Salva o Token JWT e os dados do usuário no LocalStorage
            localStorage.setItem('sportvault_token', resultado.token);
            localStorage.setItem('sportvault_user', JSON.stringify(resultado.usuario));
            
            // Redireciona para o Dashboard (página com os itens da coleção)
            window.location.href = 'dashboard.html';
            
        } catch (erro) {
            console.error(erro);
            showError("Falha na comunicação com o servidor.");
        }
    });
}

/**
 * Event Listener para o Formulário de Cadastro
 */
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmar_senha = document.getElementById('confirmar_senha').value;
        
        if (senha !== confirmar_senha) {
            showError("A senha e a confirmação de senha não coincidem.");
            return;
        }

        try {
            const resposta = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, confirmar_senha })
            });
            
            const resultado = await resposta.json();
            
            if (!resposta.ok) {
                showError(resultado.mensagem || "Erro ao criar conta.");
                return;
            }
            
            // Cadastro deu certo. Agora faz login automático para facilitar para o usuário
            const loginResp = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            if (loginResp.ok) {
                const loginResult = await loginResp.json();
                localStorage.setItem('sportvault_token', loginResult.token);
                localStorage.setItem('sportvault_user', JSON.stringify(loginResult.usuario));
                window.location.href = 'dashboard.html';
            } else {
                // Se o login automático falhar, redireciona para a tela de login
                window.location.href = 'login.html';
            }
            
        } catch (erro) {
            console.error(erro);
            showError("Falha na comunicação com o servidor.");
        }
    });
}
