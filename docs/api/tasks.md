# Tarefas

Esta seção detalha os endpoints para gerenciamento de tarefas dos usuários, permitindo criar, listar, buscar, atualizar e deletar tarefas.

## `POST /tasks`

Cria uma nova tarefa para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "title": "string",
    "description"?: "string",
    "status"?: "string"
  }
  ```
  *   `title` (string, obrigatório): Título da tarefa.
  *   `description` (string, opcional): Descrição da tarefa.
  *   `status` (string, opcional): Status da tarefa (ex: `pending`, `completed`).

- **Respostas:**
  *   `201 Created`:
    ```json
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "status": "string",
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

## `GET /tasks`

Lista todas as tarefas do usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "id": "string",
        "title": "string",
        "description": "string | null",
        "status": "string",
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

## `GET /tasks/:id`

Busca uma tarefa específica pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da tarefa.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "status": "string",
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `PUT /tasks/:id`

Atualiza uma tarefa existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da tarefa a ser atualizada.

- **Corpo da Requisição:**
  ```json
  {
    "title"?: "string",
    "description"?: "string",
    "status"?: "string"
  }
  ```
  *   `title` (string, opcional): Novo título da tarefa.
  *   `description` (string, opcional): Nova descrição da tarefa.
  *   `status` (string, opcional): Novo status da tarefa.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "status": "string",
      "userId": "string",
      "createdAt": "string" (ISO 8601),
      "updatedAt": "string" (ISO 8601)
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `DELETE /tasks/:id`

Deleta uma tarefa existente pelo seu ID para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único da tarefa a ser deletada.

- **Respostas:**
  *   `204 No Content`
  *   `404 Not Found`:
    ```json
    {
      "message": "Task not found"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```
