# Instruções de Instalação e Execução 🛠️

Este documento descreve como configurar o ambiente e executar o **SportVault** localmente na sua máquina.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- [Python 3.10+](https://www.python.org/downloads/)
- Um navegador web moderno (Google Chrome, Firefox, Edge, etc.)
- Opcional: Extensão **Live Server** (no VS Code) ou similar para rodar o frontend.

---

## 🔧 Passo a Passo de Configuração

### 1. Clonar o Repositório
Abra o seu terminal e clone o projeto:
```bash
git clone https://github.com/SEU-USUARIO/SportVault.git
cd SportVault
```

### 2. Configurar o Ambiente Virtual (venv)
É recomendável utilizar um ambiente virtual para isolar as dependências do Python:

No **Windows (PowerShell)**:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

No **Linux / macOS**:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências do Python
Com o ambiente virtual ativado, instale os pacotes necessários:
```bash
pip install -r requirements.txt
```

### 4. Inicializar o Banco de Dados
Para criar o banco de dados SQLite (`sportvault.db`) e estruturar as tabelas e dados iniciais, execute o script de inicialização:
```bash
python backend/init_db.py
```
*(Esse comando executará o arquivo `schema.sql` configurando a estrutura do banco).*

---

## 🏃 Como Rodar a Aplicação

### 1. Iniciar o Backend (Servidor Flask)
Inicie o servidor de API rodando o script na raiz do projeto:
```bash
python run.py
```
O servidor do Flask iniciará no endereço `http://127.0.0.1:5000/`. Mantenha esse terminal aberto.

### 2. Executar o Frontend (Interface Web)
Para que a comunicação funcione corretamente devido a políticas de segurança de navegadores (CORS), o ideal é rodar o frontend através de um servidor local simples em vez de apenas abrir o arquivo `.html` diretamente.

- **Se você utiliza o VS Code**: Abra a pasta do projeto no VS Code, clique com o botão direito sobre o arquivo `frontend/index.html` e selecione **Open with Live Server**. Ele abrirá por padrão em `http://127.0.0.1:5500/frontend/index.html`.
- **Alternativa via Python**: Você pode rodar um servidor HTTP rápido pelo terminal. Abra outro terminal na pasta `frontend` e rode:
  ```bash
  python -m http.server 8000
  ```
  E acesse `http://localhost:8000` no seu navegador.
