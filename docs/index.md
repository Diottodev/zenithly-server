# Zenithly Server Documentation

Bem-vindo à documentação do Zenithly Server!

Este servidor é o backend robusto e escalável para a aplicação Zenithly, projetado para gerenciar diversas funcionalidades essenciais, como autenticação de usuários, integração com serviços de terceiros (Google Calendar, Gmail, Outlook), gerenciamento de senhas, notas e tarefas.

## Visão Geral

O Zenithly Server é construído utilizando [Fastify](https://www.fastify.io/), um framework web rápido e de baixo overhead para Node.js, e [Valibot](https://valibot.dev/) para validação de esquemas. A persistência de dados é gerenciada com [Drizzle ORM](https://orm.drizzle.team/) e PostgreSQL.

### Principais Características:

*   **Autenticação e Autorização:** Sistema seguro de autenticação baseado em JWT.
*   **Integrações:** Conectividade com Google Calendar, Gmail e Outlook para sincronização de dados.
*   **Gerenciamento de Dados:** APIs para gerenciar senhas, notas e tarefas dos usuários.
*   **Performance:** Desenvolvido com foco em alta performance e escalabilidade.
*   **Validação de Dados:** Validação rigorosa de entrada e saída de dados usando Valibot.

## Estrutura do Projeto

```
.
├── src/
│   ├── db/                 # Configuração do banco de dados e schemas Drizzle
│   ├── http/               # Definições de rotas, handlers e schemas HTTP
│   │   ├── handlers/       # Funções de tratamento de erros e lógica de negócio
│   │   ├── routes/         # Definição das rotas da API
│   │   └── schemas/        # Schemas de validação de dados (Valibot)
│   ├── middleware/         # Middlewares Fastify
│   ├── plugins/            # Plugins Fastify
│   ├── utils/              # Funções utilitárias
│   ├── env.ts              # Variáveis de ambiente
│   └── server.ts           # Ponto de entrada da aplicação e configuração do servidor
├── tests/                  # Testes unitários e de integração
├── docs/                   # Documentação do projeto (VitePress)
├── drizzle.config.ts       # Configuração do Drizzle ORM
├── package.json            # Dependências e scripts do projeto
└── ...
```

## Como Usar esta Documentação

Esta documentação está dividida nas seguintes seções:

*   **Visão Geral do Projeto:** Você está aqui! Uma introdução ao Zenithly Server.
*   **API Reference:** Detalhes completos sobre todos os endpoints da API, incluindo métodos, URLs, parâmetros de requisição e respostas.
*   **Guia de Integração Frontend:** Um manual para desenvolvedores frontend sobre como interagir com a API do Zenithly Server, incluindo exemplos de código e fluxo de autenticação.

Use a barra lateral para navegar entre as seções.