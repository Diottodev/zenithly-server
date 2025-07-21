# Usuários

Esta seção detalha os endpoints para gerenciamento do usuário autenticado no Zenithly Server, incluindo busca, atualização e exclusão do próprio perfil.

## `GET /users/get`

Busca as informações do usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "emailVerified": "boolean",
        "image": "string | null",
        "role": "string",
        "createdAt": "string" (ISO 8601),
        "updatedAt": "string" (ISO 8601),
        "hasCompletedOnboarding": "boolean",
        "onboardingStep": "string | null"
      }
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "error": "Usuário não encontrado",
      "message": "Usuário não foi encontrado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor",
      "message": "Não foi possível buscar o usuário"
    }
    ```

## `PUT /users/update`

Atualiza as informações do usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "name"?: "string",
    "email"?: "string",
    "image"?: "string",
    "hasCompletedOnboarding"?: "boolean",
    "onboardingStep"?: "string"
  }
  ```
  *   `name` (string, opcional): Novo nome do usuário (mínimo 2 caracteres).
  *   `email` (string, opcional): Novo email do usuário (formato de email válido).
  *   `image` (string, opcional): URL da imagem do perfil do usuário.
  *   `hasCompletedOnboarding` (boolean, opcional): Indica se o usuário completou o onboarding.
  *   `onboardingStep` (string, opcional): Passo atual do onboarding do usuário.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "message": "Usuário atualizado com sucesso",
      "user": { /* Objeto do usuário atualizado */ }
    }
    ```
  *   `404 Not Found`:
    ```json
    {
      "error": "Usuário não encontrado",
      "message": "Usuário não foi encontrado"
    }
    ```
  *   `409 Conflict`:
    ```json
    {
      "error": "Email já cadastrado",
      "message": "Este email já está sendo usado por outro usuário"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor",
      "message": "Não foi possível atualizar o usuário"
    }
    ```

## `DELETE /users/delete`

Deleta o usuário autenticado. Esta operação também remove dados relacionados ao usuário (contas, sessões, progresso de tutorial, integrações).

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `204 No Content`
  *   `404 Not Found`:
    ```json
    {
      "error": "Usuário não encontrado",
      "message": "Usuário não foi encontrado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor",
      "message": "Não foi possível deletar o usuário"
    }
    ```