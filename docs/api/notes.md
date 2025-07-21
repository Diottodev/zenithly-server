# Notas

Esta seção detalha os endpoints para gerenciamento de notas dos usuários, permitindo criar, listar, buscar, atualizar e deletar notas. Todos os endpoints requerem autenticação JWT.

## `POST /notes/create`

Cria uma nova nota para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "title"?: "string",
    "content"?: "string"
  }
  ```
  *   `title` (string, opcional): Título da nota.
  *   `content` (string, opcional): Conteúdo da nota.

- **Respostas:**
  *   `201 Created`:
    ```json
    {
      "id": "string",
      "title": "string",
      "content": "string",
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

## `GET /notes/list`

Lista todas as notas do usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "id": "string",
        "title": "string",
        "content": "string",
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

## `GET /notes/get/:id`

Busca uma nota específica pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da nota.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Note not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `PUT /notes/update/:id`

Atualiza uma nota existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da nota a ser atualizada.

- **Corpo da Requisição:**
  ```json
  {
    "title"?: "string",
    "content"?: "string"
  }
  ```
  *   `title` (string, opcional): Novo título da nota.
  *   `content` (string, opcional): Novo conteúdo da nota.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Note not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `DELETE /notes/delete/:id`

Deleta uma nota existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da nota a ser deletada.

- **Respostas:**
  *   `204 No Content`
  *   `404 Not Found`:
    ```json
    {
      "message": "Note not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```