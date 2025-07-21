# Guia de Integração Frontend

Este guia tem como objetivo auxiliar desenvolvedores frontend na integração com o Zenithly Server. Ele aborda os principais aspectos de comunicação com a API, incluindo autenticação, estrutura de requisições e tratamento de erros.

## Visão Geral da API

A API do Zenithly Server é uma API RESTful que utiliza JSON para troca de dados. Todas as requisições devem ser feitas para o endpoint base do servidor (geralmente `http://localhost:3000` em desenvolvimento, ou o domínio configurado em produção).

### Autenticação

A maioria dos endpoints da API requer autenticação. O Zenithly Server utiliza JSON Web Tokens (JWT) para autenticação. Após o login bem-sucedido, o servidor retorna um token JWT que deve ser incluído em todas as requisições subsequentes no cabeçalho `Authorization` como um token `Bearer`.

Exemplo de cabeçalho de autenticação:

```
Authorization: Bearer <seu_token_jwt_aqui>
```

Para mais detalhes sobre o fluxo de autenticação, consulte a seção [Autenticação da API](/api/auth).

### Estrutura de Requisições

*   **Métodos HTTP:** Utilize os métodos HTTP padrão (GET, POST, PUT, DELETE) conforme a operação desejada.
*   **Corpo da Requisição:** Para requisições `POST` e `PUT`, o corpo da requisição deve ser um objeto JSON com o cabeçalho `Content-Type: application/json`.
*   **Parâmetros de Rota e Query:** Parâmetros de rota são indicados na URL (ex: `/users/get`), enquanto parâmetros de query são adicionados após `?` (ex: `/integrations/status`).

### Respostas da API

As respostas da API geralmente seguem um padrão JSON, incluindo dados, mensagens de sucesso ou erro. Os códigos de status HTTP são utilizados para indicar o resultado da operação (ex: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).

## Próximos Passos

*   **Autenticação:** Entenda o fluxo de autenticação e como gerenciar tokens JWT na seção [Autenticação da API](/api/auth).
*   **Integrações:** Aprenda a integrar com serviços externos como Google e Outlook na seção [Integrações da API](/api/integrations).
*   **Gerenciamento de Dados:** Explore os endpoints para gerenciar [Notas](/api/notes), [Senhas](/api/passwords) e [Tarefas](/api/tasks).
*   **Tratamento de Erros:** Saiba como lidar com os diferentes tipos de erros retornados pela API (consulte a documentação de cada endpoint para detalhes específicos de erros).