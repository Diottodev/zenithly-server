# Integrations API

## Endpoints disponíveis

### Status das Integrações

#### GET /integrations/status

Obtém o status das integrações do usuário autenticado.

**Resposta:**

```json
{
  "googleCalendar": {
    "enabled": true,
    "connected": true,
    "tokenExpires": "2024-12-31T23:59:59Z"
  },
  "gmail": {
    "enabled": true,
    "connected": true,
    "tokenExpires": "2024-12-31T23:59:59Z"
  },
  "outlook": {
    "enabled": false,
    "connected": false,
    "tokenExpires": null
  }
}
```

### Google OAuth

#### GET /integrations/google/auth-url

Obtém a URL de autorização do Google OAuth.

**Resposta:**

```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

#### GET /integrations/google/client-info

Obtém informações do cliente Google (Client ID e escopos).

**Resposta:**

```json
{
  "clientId": "your-google-client-id",
  "scopes": [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.modify"
  ]
}
```

#### POST /integrations/google/callback

Processa o callback do OAuth do Google e salva os tokens.

**Body:**

```json
{
  "code": "authorization_code_from_google",
  "state": "optional_state_parameter"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Integração com Google configurada com sucesso"
}
```

#### DELETE /integrations/google/disconnect

Desconecta a integração com o Google.

**Resposta:**

```json
{
  "success": true,
  "message": "Integração com Google desconectada com sucesso"
}
```

### Microsoft OAuth

#### GET /integrations/microsoft/client-info

Obtém informações do cliente Microsoft (Client ID e escopos).

**Resposta:**

```json
{
  "clientId": "your-microsoft-client-id",
  "scopes": [
    "https://graph.microsoft.com/Calendars.ReadWrite",
    "https://graph.microsoft.com/Mail.ReadWrite"
  ]
}
```

#### POST /integrations/outlook/callback

Processa o callback do OAuth do Microsoft e salva os tokens.

**Body:**

```json
{
  "code": "authorization_code_from_microsoft",
  "state": "optional_state_parameter"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Integração com Outlook configurada com sucesso"
}
```

#### DELETE /integrations/outlook/disconnect

Desconecta a integração com o Outlook.

**Resposta:**

```json
{
  "success": true,
  "message": "Integração com Outlook desconectada com sucesso"
}
```

### Google Services

#### GET /integrations/google/calendar/events

Lista eventos do Google Calendar do usuário.

**Resposta:**

```json
{
  "items": [
    {
      "id": "event_id",
      "summary": "Título do evento",
      "start": {
        "dateTime": "2024-01-01T10:00:00Z"
      },
      "end": {
        "dateTime": "2024-01-01T11:00:00Z"
      }
    }
  ]
}
```

#### GET /integrations/google/gmail/messages

Lista mensagens do Gmail do usuário (últimas 50).

**Resposta:**

```json
{
  "messages": [
    {
      "id": "message_id",
      "threadId": "thread_id"
    }
  ]
}
```

### Microsoft Services

#### GET /integrations/outlook/calendar/events

Lista eventos do Outlook Calendar do usuário.

**Resposta:**

```json
{
  "value": [
    {
      "id": "event_id",
      "subject": "Título do evento",
      "start": {
        "dateTime": "2024-01-01T10:00:00.0000000",
        "timeZone": "UTC"
      },
      "end": {
        "dateTime": "2024-01-01T11:00:00.0000000",
        "timeZone": "UTC"
      }
    }
  ]
}
```

#### GET /integrations/outlook/mail/messages

Lista mensagens do Outlook Mail do usuário (últimas 50).

**Resposta:**

```json
{
  "value": [
    {
      "id": "message_id",
      "subject": "Assunto do email",
      "from": {
        "emailAddress": {
          "address": "sender@example.com",
          "name": "Nome do Remetente"
        }
      },
      "receivedDateTime": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## Códigos de Erro

- `401` - Usuário não autenticado
- `400` - Integração não configurada ou erro na API externa
- `500` - Erro interno do servidor

## Configuração necessária

### Variáveis de ambiente:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Frontend URL para callbacks
FRONTEND_URL=http://localhost:3000
```

### Configuração dos provedores OAuth:

#### Google:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite as APIs do Google Calendar e Gmail
4. Crie credenciais OAuth 2.0
5. Configure URLs de redirecionamento: `${FRONTEND_URL}/integrations/google/callback`

#### Microsoft:

1. Acesse o [Azure Portal](https://portal.azure.com/)
2. Registre uma nova aplicação
3. Configure permissões para Microsoft Graph (Calendars.ReadWrite, Mail.ReadWrite)
4. Configure URLs de redirecionamento: `${FRONTEND_URL}/integrations/outlook/callback`

## Escopos utilizados

### Google:

- `https://www.googleapis.com/auth/calendar` - Acesso completo ao Google Calendar
- `https://www.googleapis.com/auth/gmail.modify` - Acesso de leitura e escrita ao Gmail
- `openid` - Identificação do usuário
- `email` - Acesso ao email do usuário
- `profile` - Acesso ao perfil do usuário

### Microsoft:

- `https://graph.microsoft.com/Calendars.ReadWrite` - Acesso completo ao Outlook Calendar
- `https://graph.microsoft.com/Mail.ReadWrite` - Acesso de leitura e escrita ao Outlook Mail
- `openid` - Identificação do usuário
- `profile` - Acesso ao perfil do usuário
- `email` - Acesso ao email do usuário

## Uso no frontend

### Fluxo OAuth Google:

1. Chamar `/integrations/google/auth-url` para obter a URL de autorização
2. Redirecionar o usuário para a URL retornada
3. Após autorização, o usuário será redirecionado para `${FRONTEND_URL}/integrations/google/callback?code=...`
4. Extrair o código da query string e enviar para o backend para trocar por tokens

### Fluxo OAuth Microsoft:

1. Chamar `/integrations/microsoft/client-info` para obter client ID e escopos
2. Construir URL de autorização manualmente ou usar biblioteca MSAL
3. Redirecionar para Microsoft para autorização
4. Processar o callback e trocar código por tokens
