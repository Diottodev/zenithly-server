# Senhas

Esta seção detalha os endpoints para gerenciamento de senhas dos usuários, permitindo criar, listar, buscar, atualizar e deletar senhas. Todos os endpoints requerem autenticação JWT.

## `POST /passwords/create`

Cria uma nova entrada de senha para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "service": "string",
    "username": "string",
    "password": "string"
  }
  ```
  *   `service` (string, obrigatório): Nome do serviço (ex: `Google`, `Facebook`).
  *   `username` (string, obrigatório): Nome de usuário ou email para o serviço.
  *   `password` (string, obrigatório): A senha (será armazenada criptografada).

- **Respostas:**
  *   `201 Created`:
    ```json
    {
      "id": "string",
      "service": "string",
      "username": "string",
      "password": "string", # Senha criptografada
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `GET /passwords/list`

Lista todas as senhas armazenadas para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "id": "string",
        "service": "string",
        "username": "string",
        "password": "string", # Senha criptografada
        "userId": "string",
        "createdAt": "string" (ISO 8601),
        "updatedAt": "string" (ISO 8601)
      }
    ]
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `GET /passwords/get/:id`

Busca uma entrada de senha específica pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da senha.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "service": "string",
      "username": "string",
      "password": "string", # Senha criptografada
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Password not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `PUT /passwords/update/:id`

Atualiza uma entrada de senha existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da senha a ser atualizada.

- **Corpo da Requisição:**
  ```json
  {
    "service"?: "string",
    "username"?: "string",
    "password"?: "string"
  }
  ```
  *   `service` (string, opcional): Novo nome do serviço.
  *   `username` (string, opcional): Novo nome de usuário ou email.
  *   `password` (string, opcional): Nova senha (será criptografada).

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "service": "string",
      "username": "string",
      "password": "string", # Senha criptografada
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Password not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `DELETE /passwords/delete/:id`

Deleta uma entrada de senha existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da senha a ser deletada.

- **Respostas:**
  *   `204 No Content`
  *   `404 Not Found`:
    ```json
    {
      "message": "Password not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```