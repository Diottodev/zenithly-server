# Autenticação

Esta seção detalha os endpoints de autenticação do Zenithly Server, que permitem o registro, login, logout e gerenciamento de sessões de usuários, além de integração com provedores OAuth como GitHub e Google.

## `POST /auth/login`

Realiza o login de um usuário com email e senha.

- **Corpo da Requisição:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
  *   `email` (string, obrigatório): O email do usuário.
  *   `password` (string, obrigatório): A senha do usuário.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "message": "Login realizado com sucesso",
      "user": { /* Objeto do usuário */ },
      "token": "string" # JWT
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Dados inválidos",
      "message": "Email e senha são obrigatórios"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Credenciais inválidas",
      "message": "Email ou senha incorretos"
    }
    ```

## `POST /auth/logout`

Realiza o logout do usuário, invalidando a sessão atual.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "message": "Logout realizado com sucesso"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor",
      "message": "Não foi possível realizar o logout"
    }
    ```

## `GET /auth/session`

Verifica a sessão atual do usuário e retorna os dados do usuário logado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório, ou token via cookie)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "user": { /* Objeto do usuário */ },
      "session": { /* Objeto da sessão */ }
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Não autenticado",
      "message": "Token de sessão não fornecido" # ou "Sessão inválida ou expirada"
    }
    ```

## `POST /auth/register`

Registra um novo usuário com nome, email e senha.

- **Corpo da Requisição:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
  *   `name` (string, obrigatório): Nome do usuário (mínimo 2 caracteres).
  *   `email` (string, obrigatório): Email do usuário (formato de email válido).
  *   `password` (string, obrigatório): Senha do usuário (mínimo 8 caracteres).

- **Respostas:**
  *   `201 Created`:
    ```json
    {
      "message": "Conta criada com sucesso",
      "user": { /* Objeto do usuário */ },
      "token": "string" # JWT
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Erro no registro",
      "message": "Não foi possível criar a conta" # ou erros de validação
    }
    ```

## `GET /auth/github`

Inicia o fluxo de autenticação OAuth com o GitHub. Redireciona o usuário para a página de autorização do GitHub.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "url": "string", # URL para redirecionamento do GitHub
      "provider": "github"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro na autenticação",
      "message": "Não foi possível iniciar login com GitHub"
    }
    ```

## `GET /auth/google`

Inicia o fluxo de autenticação OAuth com o Google. Redireciona o usuário para a página de autorização do Google.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "url": "string", # URL para redirecionamento do Google
      "provider": "google"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro na autenticação",
      "message": "Não foi possível iniciar login com Google"
    }
    ```

## `GET /auth/callback`

Endpoint de callback para provedores OAuth (GitHub, Google). Após a autorização, o provedor redireciona para este endpoint. Este endpoint, por sua vez, redireciona para o frontend com o token de sessão ou mensagem de erro.

- **Query Parameters (Redirecionamento para Frontend):**
  *   `success` (boolean): Indica se a autenticação foi bem-sucedida.
  *   `token` (string, opcional): O token JWT da sessão, presente se `success` for `true`.
  *   `error` (string, opcional): Código de erro, presente se `success` for `false`.

- **Respostas:**
  *   `302 Found` (Redirecionamento para o frontend):
    *   `Location: <FRONTEND_URL>/auth/callback?success=true&token=<JWT>`
    *   `Location: <FRONTEND_URL>/auth/callback?error=invalid_session`

## `GET /auth/callback/error`

Endpoint de callback para erros de provedores OAuth. Redireciona para o frontend com a mensagem de erro.

- **Query Parameters:**
  *   `error` (string, opcional): Descrição do erro.

- **Respostas:**
  *   `302 Found` (Redirecionamento para o frontend):
    *   `Location: <FRONTEND_URL>/auth/callback?error=<error_code>`

## `GET /auth/providers`

Lista os provedores de autenticação disponíveis no servidor.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "providers": [
        {
          "id": "email",
          "name": "Email e Senha",
          "type": "credentials",
          "endpoints": {
            "login": "/auth/login",
            "register": "/auth/register"
          }
        },
        {
          "id": "github",
          "name": "GitHub",
          "type": "oauth",
          "url": "/auth/github",
          "available": true # ou false
        },
        {
          "id": "google",
          "name": "Google",
          "type": "oauth",
          "url": "/auth/google",
          "available": true # ou false
        }
      ]
    }
    ```