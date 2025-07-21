# Gmail

Esta seção detalha os endpoints para interagir com o Gmail, permitindo listar mensagens, obter detalhes de mensagens e enviar emails. Todos os endpoints requerem autenticação JWT.

## `GET /gmail/messages`

Lista as mensagens do Gmail para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Respostas:**
  *   `200 OK`:
    ```json
    [
      {
        "id": "string",
        "threadId": "string"
      }
    ]
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `GET /gmail/messages/:messageId`

Obtém os detalhes de uma mensagem específica do Gmail para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Parâmetros de Rota:**
  *   `messageId` (string, obrigatório): O ID da mensagem do Gmail.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "id": "string",
      "threadId": "string",
      "labelIds": ["string"],
      "snippet": "string",
      "historyId": "string",
      "internalDate": "string",
      "payload": { /* Objeto de payload da mensagem */ },
      "sizeEstimate": "number",
      "raw": "string"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```

## `POST /gmail/send`

Envia um email através do Gmail para o usuário autenticado.

- **Headers:**
  *   `Authorization`: `Bearer <token>` (obrigatório)

- **Corpo da Requisição:**
  ```json
  {
    "to": "string",
    "subject": "string",
    "body": "string"
  }
  ```
  *   `to` (string, obrigatório): Endereço de email do destinatário.
  *   `subject` (string, obrigatório): Assunto do email.
  *   `body` (string, obrigatório): Corpo do email.

- **Respostas:**
  *   `200 OK`:
    ```json
    {
      "message": "Email sent successfully"
    }
    ```
  *   `500 Internal Server Error`:
    ```json
    {
      "message": "Internal server error"
    }
    ```