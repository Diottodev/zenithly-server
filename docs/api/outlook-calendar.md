# Outlook Calendar

Esta seção detalha os endpoints para interagir com o Outlook Calendar, permitindo listar eventos. Todos os endpoints requerem autenticação JWT.

## `GET /outlook-calendar/events/list`

Lista os eventos do Outlook Calendar para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

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
