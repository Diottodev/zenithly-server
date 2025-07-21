# Documentação do Zenithly Server

Bem-vindo à documentação do Zenithly Server!

Este servidor é o backend robusto e escalável para a aplicação Zenithly, projetado para gerenciar diversas funcionalidades essenciais, como autenticação de usuários, gerenciamento de notas, senhas, tarefas e integrações com serviços de terceiros como Google Calendar e Outlook. Construído com foco em performance e segurança, este servidor oferece uma API RESTful completa para suportar as operações do frontend.

## Visão Geral

O Zenithly Server é construído com um conjunto de tecnologias modernas e eficientes, garantindo alta performance, segurança e facilidade de manutenção:

*   **Node.js**: Ambiente de execução JavaScript assíncrono e orientado a eventos.
*   **Fastify**: Framework web rápido e de baixo overhead para Node.js, focado em performance e experiência do desenvolvedor.
*   **Drizzle ORM**: ORM TypeScript de próxima geração para bancos de dados relacionais, oferecendo tipagem segura e alta performance.
*   **PostgreSQL**: Banco de dados relacional robusto e de código aberto.
*   **Valibot**: Biblioteca de validação de dados leve e poderosa.
*   **bcryptjs**: Para hashing seguro de senhas.
*   **jsonwebtoken (JWT)**: Para autenticação baseada em tokens.
*   **googleapis**: SDK oficial do Google para integração com serviços Google (e.g., Google Calendar).

### Principais Características:

*   **Autenticação e Autorização:** Sistema completo de registro, login, recuperação de senha e autenticação baseada em JWT.
*   **Gerenciamento de Usuários**: Criação, leitura, atualização e exclusão de perfis de usuário.
*   **Notas**: Funcionalidades para criar, organizar e gerenciar notas pessoais.
*   **Senhas**: Armazenamento seguro e gerenciamento de senhas com criptografia.
*   **Tarefas**: Criação e acompanhamento de tarefas e listas de afazeres.
*   **Integrações:** Conectividade com Google Calendar, Gmail e Outlook para sincronização de dados.
*   **Segurança**: Implementação de melhores práticas de segurança, incluindo criptografia de dados sensíveis e proteção contra ataques comuns.
*   **Validação de Dados:** Validação rigorosa de todas as entradas para garantir a integridade dos dados.

## Estrutura do Projeto

O projeto segue uma arquitetura modular, com a API organizada em rotas, handlers e schemas. A camada de banco de dados é abstraída pelo Drizzle ORM, garantindo uma interação segura e tipada com o PostgreSQL. A estrutura de pastas é organizada para facilitar a manutenção e a escalabilidade:

```
src/
├── auth.ts             # Lógica de autenticação
├── env.ts              # Variáveis de ambiente
├── server.ts           # Configuração principal do servidor Fastify
├── db/                 # Configuração do banco de dados e schemas Drizzle
│   ├── connection.ts
│   ├── drizzle/
│   └── migrations/
├── http/               # Definições de rotas, handlers e schemas da API
│   ├── handlers/       # Funções de tratamento de erros e lógica de negócio
│   ├── routes/         # Definição das rotas da API
│   └── schemas/        # Schemas de validação de dados (Valibot)
├── middleware/         # Middlewares Fastify
├── plugins/            # Plugins Fastify
└── utils/              # Funções utilitárias
```

## Como Usar esta Documentação

Esta documentação está dividida nas seguintes seções:

*   **Visão Geral do Projeto:** Você está aqui! Uma introdução ao Zenithly Server.
*   **API Reference:** Detalhes completos sobre todos os endpoints da API, incluindo métodos, URLs, parâmetros de requisição e respostas.
*   **Guia de Integração Frontend:** Um manual para desenvolvedores frontend sobre como interagir com a API do Zenithly Server, incluindo exemplos de código e fluxo de autenticação.

Use a barra lateral para navegar entre as seções.
