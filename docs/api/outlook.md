# Outlook

Esta seção detalha os endpoints para interagir com o Outlook, permitindo listar mensagens. Todos os endpoints requerem autenticação JWT.

## `GET /outlook/messages`

Lista as mensagens do Outlook para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

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