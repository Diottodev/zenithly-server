# Outlook

Esta seção detalha os endpoints para interagir com o Outlook, permitindo listar mensagens e eventos do calendário.

## `GET /outlook/messages/:id`

Lista as mensagens do Outlook para um usuário específico.

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único do usuário.

- **Query Parameters:**
  *   `pageToken` (string, opcional): Token para a próxima página de resultados.
  *   `maxResults` (string, opcional): Número máximo de resultados a serem retornados (padrão: `100`).

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "@odata.context": "string",
      "@odata.nextLink": "string",
      "value": [
        {
          "@odata.etag": "string",
          "id": "string",
          "createdDateTime": "string" (ISO 8601),
          "lastModifiedDateTime": "string" (ISO 8601),
          "changeKey": "string",
          "categories": [],
          "receivedDateTime": "string" (ISO 8601),
          "sentDateTime": "string" (ISO 8601),
          "hasAttachments": "boolean",
          "internetMessageId": "string",
          "subject": "string",
          "bodyPreview": "string",
          "importance": "string",
          "parentFolderId": "string",
          "conversationId": "string",
          "isReadReceiptRequested": "boolean",
          "isDeliveryReceiptRequested": "boolean",
          "isRead": "boolean",
          "isDraft": "boolean",
          "webLink": "string",
          "inferenceClassification": "string",
          "body": { "contentType": "string", "content": "string" },
          "sender": { "emailAddress": { "name": "string", "address": "string" } },
          "from": { "emailAddress": { "name": "string", "address": "string" } },
          "toRecipients": [],
          "ccRecipients": [],
          "bccRecipients": [],
          "replyTo": [],
          "flag": { "flagStatus": "string" }
        }
      ]
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Integração com Outlook não configurada" # ou "Falha ao acessar Outlook"
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

## `GET /outlook/calendar/events/:id`

Lista os eventos do Outlook Calendar para um usuário específico.

- **Parâmetros de Rota:**
  *   `id` (string, obrigatório): O ID único do usuário.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "@odata.context": "string",
      "value": [
        {
          "@odata.etag": "string",
          "id": "string",
          "createdDateTime": "string" (ISO 8601),
          "lastModifiedDateTime": "string" (ISO 8601),
          "changeKey": "string",
          "categories": [],
          "transactionId": "string",
          "originalStartTimeZone": "string",
          "originalEndTimeZone": "string",
          "iCalUId": "string",
          "reminderMinutesBeforeStart": "number",
          "isReminderOn": "boolean",
          "hasAttachments": "boolean",
          "subject": "string",
          "bodyPreview": "string",
          "importance": "string",
          "sensitivity": "string",
          "isAllDay": "boolean",
          "isCancelled": "boolean",
          "isOrganizer": "boolean",
          "responseRequested": "boolean",
          "seriesMasterId": "string",
          "showAs": "string",
          "type": "string",
          "webLink": "string",
          "onlineMeetingUrl": "string",
          "isOnlineMeeting": "boolean",
          "onlineMeetingProvider": "string",
          "allowNewTimeProposals": "boolean",
          "occurrenceId": "string",
          "isSetAsTask": "boolean",
          "recurrence": null,
          "body": { "contentType": "string", "content": "string" },
          "start": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
          "end": { "dateTime": "string" (ISO 8601), "timeZone": "string" },
          "location": { "displayName": "string" },
          "locations": [],
          "attendees": [],
          "organizer": { "emailAddress": { "name": "string", "address": "string" } },
          "seriesMaster": null
        }
      ]
    }
    ```
  *   `400 Bad Request`:
    ```json
    {
      "error": "Integração com Outlook não configurada" # ou "Falha ao acessar Outlook Calendar"
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
