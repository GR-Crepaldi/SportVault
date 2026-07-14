# SportVault 🏆

**SportVault** é uma plataforma moderna e elegante projetada para entusiastas do esporte e colecionadores organizarem, gerenciarem e exibirem suas coleções de artigos esportivos (como camisas, chuteiras, bolas e acessórios).

Com uma interface refinada inspirada em *glassmorphism* e equipada com micro-animações, o SportVault combina estética premium com usabilidade simples para criar o "cofre" virtual perfeito para a sua paixão esportiva.

---

## 🚀 Principais Recursos

- **Cadastro Completo**: Adicione itens informando nome, esporte, tipo de item, ano/temporada, estado de conservação (Novo, Conservado ou Usado) e descrição detalhada.
- **Visualização da Coleção**: Tabela dinâmica com filtros de busca rápidos para localizar itens rapidamente na sua coleção.
- **Páginas Auxiliares**:
  - **Sobre**: Uma introdução sobre a plataforma e seu propósito.
  - **Recursos**: Detalhamento visual das principais funcionalidades do SportVault.
- **Autenticação Segura**: Fluxo de cadastro e login usando tokens JWT e senhas criptografadas com `bcrypt`.
- **Dashboard Estatístico**: Acompanhe o total de itens na coleção e confira os cadastros mais recentes num painel dinâmico.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível.
- **CSS3 (Vanilla)**: Design premium customizado, sem dependências de frameworks, garantindo performance e controle visual máximo (gradientes, variáveis CSS e efeitos glassmorphic).
- **JavaScript (Vanilla)**: Lógica dinâmica de formulários, controle de autenticação local (localStorage) e integração assíncrona com a API (Fetch API).

### Backend
- **Python 3**: Linguagem de programação principal.
- **Flask**: Micro-framework para criação da API Restful.
- **Flask-JWT-Extended**: Gerenciamento seguro de sessões via Tokens JWT.
- **Flask-CORS**: Controle de acesso para permitir requisições do frontend.
- **Marshmallow**: Validação e serialização dos schemas de dados da API.
- **Bcrypt**: Criptografia segura de senhas no cadastro do usuário.

### Banco de Dados
- **SQLite3**: Banco de dados relacional leve e sem necessidade de configuração complexa de servidores externos, ideal para rodar o projeto localmente.

---

## 📁 Estrutura de Pastas

```text
SportVault/
├── backend/                  # Código do servidor Flask e Banco de Dados
│   ├── database/             # Scripts e arquivos do SQLite (db.py, schema.sql)
│   ├── routes/               # Rotas/Endpoints da API (auth, itens, etc.)
│   ├── app.py                # Factory principal da aplicação
│   └── init_db.py            # Script para inicializar o banco de dados
├── frontend/                 # Páginas e estilos da interface
│   ├── css/                  # Arquivos CSS (global, style, auth, dashboard)
│   ├── js/                   # Controladores Javascript para chamadas de API
│   ├── pages/                # Telas (login, register, dashboard, cadastrar, etc.)
│   ├── index.html            # Landing page inicial
│   ├── sobre.html            # Página informativa sobre o sistema
│   └── recursos.html         # Página informativa sobre os recursos
├── requirements.txt          # Dependências do Python
├── run.py                    # Script de inicialização do servidor
├── README.md                 # Visão geral do projeto (este arquivo)
└── HOW_TO_RUN.md             # Manual de instalação e execução do projeto
```

---

## 👤 Licença e Contribuição

Este projeto foi desenvolvido para fins educacionais e de portfólio. Sinta-se livre para clonar, sugerir melhorias ou utilizá-lo como base para outros projetos!
