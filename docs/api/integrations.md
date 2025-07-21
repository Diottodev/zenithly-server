# Integrações

Esta seção detalha os endpoints para gerenciar as integrações do usuário com serviços de terceiros, como Google (Calendar e Gmail) e Outlook. Todos os endpoints requerem autenticação JWT.

## `GET /integrations/status`

Obtém o status atual das integrações do usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "googleCalendar": {
        "enabled": "boolean",
        "connected": "boolean",
        "tokenExpires": "string | null" (ISO 8601)
      },
      "gmail": {
        "enabled": "boolean",
        "connected": "boolean",
        "tokenExpires": "string | null" (ISO 8601)
      },
      "outlook": {
        "enabled": "boolean",
        "connected": "boolean",
        "tokenExpires": "string | null" (ISO 8601)
      },
      "settings": { /* Objeto de configurações adicionais */ }
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/google/auth-url`

Obtém a URL de autorização do Google para iniciar o fluxo OAuth para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (opcional, mas o usuário deve estar autenticado para que o `state` seja gerado corretamente)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "authUrl": "string" # URL para redirecionamento do usuário
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `POST /integrations/google/callback`

Endpoint de callback para o Google OAuth. Recebe o código de autorização e troca por tokens de acesso e refresh para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "code": "string",
    "state"?: "string"
  }
  ```
  *   `code` (string, obrigatório): Código de autorização recebido do Google.
  *   `state` (string, opcional): Estado opcional para prevenção de CSRF.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "success": true,
      "message": "Integração com Google configurada com sucesso",
      "accessToken": "string"
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Falha na autenticação com Google"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `POST /integrations/outlook/callback`

Endpoint de callback para o Outlook OAuth. Recebe o código de autorização e troca por tokens de acesso e refresh para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "code": "string",
    "state"?: "string"
  }
  ```
  *   `code` (string, obrigatório): Código de autorização recebido do Outlook.
  *   `state` (string, opcional): Estado opcional para prevenção de CSRF.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "success": true,
      "message": "Integração com Outlook configurada com sucesso",
      "accessToken": "string"
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Falha na autenticação com Microsoft"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/google/tokens`

Obtém os tokens de acesso do Google para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "accessToken": "string",
      "tokenType": "Bearer",
      "expiresAt": "string" (ISO 8601),
      "scopes": ["string"]
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Integração com Google não configurada"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado" # ou "Token expirado", "needsRefresh": true
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/google/refresh`

Renova o token de acesso do Google usando o refresh token para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "accessToken": "string",
      "tokenType": "Bearer",
      "expiresAt": "string" (ISO 8601),
      "success": true,
      "message": "Token renovado com sucesso"
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Refresh token do Google não encontrado" # ou "Falha ao renovar token do Google"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/outlook/tokens`

Obtém os tokens de acesso do Outlook para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "accessToken": "string",
      "tokenType": "Bearer",
      "expiresAt": "string" (ISO 8601),
      "scopes": ["string"]
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Integração com Outlook não configurada"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado" # ou "Token expirado", "needsRefresh": true
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/outlook/refresh`

Renova o token de acesso do Outlook usando o refresh token para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "accessToken": "string",
      "tokenType": "Bearer",
      "expiresAt": "string" (ISO 8601),
      "success": true,
      "message": "Token renovado com sucesso"
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Refresh token do Outlook não encontrado" # ou "Falha ao renovar token do Outlook"
    }
    ```
  *   `401 Unauthorized`:
    ```json
    {
      "error": "Usuário não autenticado"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```

## `GET /integrations/outlook/auth-url`

Obtém a URL de autorização do Outlook para iniciar o fluxo OAuth para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (opcional, mas o usuário deve estar autenticado para que o `state` seja gerado corretamente)

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "authUrl": "string" # URL para redirecionamento do usuário
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "error": "Erro interno do servidor"
    }
    ```