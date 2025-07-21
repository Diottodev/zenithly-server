# Guia de Integração Frontend

Este guia tem como objetivo auxiliar desenvolvedores frontend na integração com o Zenithly Server. Ele aborda os principais aspectos de comunicação com a API, incluindo autenticação, estrutura de requisições e tratamento de erros.

## Visão Geral da API

A API do Zenithly Server é uma API RESTful que utiliza JSON para troca de dados. Todas as requisições devem ser feitas para o endpoint base do servidor (definido pela variável de ambiente `FRONTEND_URL` no servidor, ou `http://localhost:3000` em desenvolvimento).

### Autenticação

A maioria dos endpoints da API requer autenticação. O Zenithly Server utiliza JSON Web Tokens (JWT) para autenticação. Após o login bem-sucedido, o servidor retorna um token JWT que deve ser incluído em todas as requisições subsequentes no cabeçalho `Authorization` como um token `Bearer`.

Exemplo de cabeçalho de autenticação:

```
Authorization: Bearer <seu_token_jwt_aqui>
```

### Estrutura de Requisições

*   **Métodos HTTP:** Utilize os métodos HTTP padrão (GET, POST, PUT, DELETE) conforme a operação desejada.
*   **Corpo da Requisição:** Para requisições `POST` e `PUT`, o corpo da requisição deve ser um objeto JSON com o cabeçalho `Content-Type: application/json`.
*   **Parâmetros de Rota e Query:** Parâmetros de rota são indicados na URL (ex: `/users/:id`), enquanto parâmetros de query são adicionados após `?` (ex: `/users?page=1`).

### Respostas da API

As respostas da API geralmente seguem um padrão JSON, incluindo dados, mensagens de sucesso ou erro. Os códigos de status HTTP são utilizados para indicar o resultado da operação (ex: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).

## Próximos Passos

*   **Autenticação:** Entenda o fluxo de autenticação e como gerenciar tokens JWT.
*   **Tratamento de Erros:** Saiba como lidar com os diferentes tipos de erros retornados pela API.
