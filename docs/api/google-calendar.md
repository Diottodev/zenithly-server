# Google Calendar

Esta seção detalha os endpoints para interagir com o Google Calendar, permitindo listar, criar, atualizar e deletar eventos, além de listar calendários.

## `GET /google/calendar/events/:id`

Lista os eventos do Google Calendar para um usuário específico. Este endpoint é usado para listar eventos de um usuário cujo ID é passado como parâmetro de rota.

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único do usuário.

- **Query Parameters:**
  *   `pageToken` (string, opcional): Token para a próxima página de resultados.
  *   `maxResults` (string, opcional): Número máximo de resultados a serem retornados (padrão: `100`).

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "kind": "string",
      "etag": "string",
      "summary": "string",
      "updated": "string" (ISO 8601),
      "timeZone": "string",
      "accessRole": "string",
      "defaultReminders": [],
      "nextPageToken": "string",
      "items": [
        {
          "kind": "string",
          "etag": "string",
          "id": "string",
          "status": "string",
          "htmlLink": "string",
          "created": "string" (ISO 8601),
          "updated": "string" (ISO 8601),
          "summary": "string",
          "creator": { "email": "string" },
          "organizer": { "email": "string" },
          "start": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
          "end": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
          "iCalUID": "string",
          "sequence": "number",
          "reminders": { "useDefault": "boolean" }
        }
      ]
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Integração com Google Calendar não configurada" # ou "Falha ao acessar Google Calendar"
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

## `GET /google/calendar/events`

Lista os eventos do Google Calendar para o usuário autenticado. Este endpoint requer autenticação JWT e usa o ID do usuário do token.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "kind": "string",
        "etag": "string",
        "id": "string",
        "status": "string",
        "htmlLink": "string",
        "created": "string" (ISO 8601),
        "updated": "string" (ISO 8601),
        "summary": "string",
        "creator": { "email": "string" },
        "organizer": { "email": "string" },
        "start": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
        "end": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
        "iCalUID": "string",
        "sequence": "number",
        "reminders": { "useDefault": "boolean" }
      }
    ]
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `POST /google/calendar/events`

Cria um novo evento no Google Calendar para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "summary"?: "string",
    "description"?: "string",
    "start": {
      "dateTime"?: "string" (ISO 8601),
      "timeZone"?: "string"
    },
    "end": {
      "dateTime"?: "string" (ISO 8601),
      "timeZone"?: "string"
    },
    "attendees"?: [
      {
        "email"?: "string"
      }
    ],
    "reminders"?: {
      "useDefault"?: "boolean",
      "overrides"?: [
        {
          "method": "email" | "popup",
          "minutes": "number"
        }
      ]
    }
  }
  ```
  *   `summary` (string, opcional): Título do evento.
  *   `description` (string, opcional): Descrição do evento.
  *   `start` (object, obrigatório): Objeto com `dateTime` (ISO 8601) e `timeZone` para o início do evento.
  *   `end` (object, obrigatório): Objeto com `dateTime` (ISO 8601) e `timeZone` para o fim do evento.
  *   `attendees` (array de objetos, opcional): Lista de participantes com seus emails.
  *   `reminders` (object, opcional): Configurações de lembretes.

- **Respostas:**
  *   `201 Created`:
    ```json
    {
      "kind": "string",
      "etag": "string",
      "id": "string",
      "status": "string",
      "htmlLink": "string",
      "created": "string" (ISO 8601),
      "updated": "string" (ISO 8601),
      "summary": "string",
      "creator": { "email": "string" },
      "organizer": { "email": "string" },
      "start": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
      "end": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
      "iCalUID": "string",
      "sequence": "number",
      "reminders": { "useDefault": "boolean" }
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `PUT /google/calendar/events/:eventId`

Atualiza um evento existente no Google Calendar para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `eventId` (string, obrigatório): O ID do evento a ser atualizado.

- **Corpo da Requisição:**
  ```json
  {
    "summary"?: "string",
    "description"?: "string",
    "start"?: {
      "dateTime"?: "string" (ISO 8601),
      "timeZone"?: "string"
    },
    "end"?: {
      "dateTime"?: "string" (ISO 8601),
      "timeZone"?: "string"
    },
    "attendees"?: [
      {
        "email": "string"
      }
    ],
    "reminders"?: {
      "useDefault"?: "boolean",
      "overrides"?: [
        {
          "method": "email" | "popup",
          "minutes": "number"
        }
      ]
    }
  }
  ```
  *   Os campos são os mesmos do `POST /google/calendar/events`, mas todos são opcionais para atualização parcial.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "kind": "string",
      "etag": "string",
      "id": "string",
      "status": "string",
      "htmlLink": "string",
      "created": "string" (ISO 8601),
      "updated": "string" (ISO 8601),
      "summary": "string",
      "creator": { "email": "string" },
      "organizer": { "email": "string" },
      "start": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
      "end": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
      "iCalUID": "string",
      "sequence": "number",
      "reminders": { "useDefault": "boolean" }
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `DELETE /google/calendar/events/:eventId`

Deleta um evento do Google Calendar para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `eventId` (string, obrigatório): O ID do evento a ser deletado.

- **Respostas:**
  *   `204 No Content`
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `GET /google/calendar/calendars`

Lista os calendários do Google Calendar do usuário autenticado, incluindo informações de cores.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "id": "string",
        "summary": "string",
        "backgroundColor": "string",
        "foregroundColor": "string",
        "accessRole": "string",
        "eventColors": { /* Objeto de cores de eventos */ },
        "calendarColors": { /* Objeto de cores de calendários */ }
      }
    ]
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```
