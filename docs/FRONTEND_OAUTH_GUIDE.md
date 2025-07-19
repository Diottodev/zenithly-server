# Guia de Integração OAuth para Frontend

## 📋 Visão Geral

Este guia mostra como implementar OAuth login e integrações com Google (Gmail + Calendar) e Microsoft (Outlook) no frontend usando as APIs do Zenithly Server.

## 🔐 Autenticação Base

### 1. Login com Better Auth

Primeiro, implemente o login básico com Better Auth para obter o token de acesso:

```typescript
// auth.service.ts
export class AuthService {
  private baseUrl = "http://localhost:8080";

  // Login com email/senha
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data;
  }

  // Obter token armazenado
  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

## 🔗 Sistema de Integrações

### 2. Service para Integrações

```typescript
// integrations.service.ts
export interface IntegrationStatus {
  googleCalendar: {
    enabled: boolean;
    connected: boolean;
    tokenExpires: string | null;
  };
  gmail: {
    enabled: boolean;
    connected: boolean;
    tokenExpires: string | null;
  };
  outlook: {
    enabled: boolean;
    connected: boolean;
    tokenExpires: string | null;
  };
  settings?: any;
}

export interface ClientInfo {
  clientId: string;
  scopes: string[];
}

export class IntegrationsService {
  private baseUrl = "http://localhost:8080";
  private authService = new AuthService();

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Obter status das integrações
  async getStatus(): Promise<IntegrationStatus> {
    const response = await fetch(`${this.baseUrl}/integrations/status`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to get integrations status");
    return response.json();
  }

  // Obter informações do cliente Google
  async getGoogleClientInfo(): Promise<ClientInfo> {
    const response = await fetch(
      `${this.baseUrl}/integrations/google/client-info`
    );

    if (!response.ok) throw new Error("Failed to get Google client info");
    return response.json();
  }

  // Obter informações do cliente Microsoft
  async getMicrosoftClientInfo(): Promise<ClientInfo> {
    const response = await fetch(
      `${this.baseUrl}/integrations/microsoft/client-info`
    );

    if (!response.ok) throw new Error("Failed to get Microsoft client info");
    return response.json();
  }

  // Obter URL de autorização do Google
  async getGoogleAuthUrl(): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/integrations/google/auth-url`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Failed to get Google auth URL");
    const data = await response.json();
    return data.authUrl;
  }
}
```

## 🌐 Implementação OAuth

### 3. OAuth com Google (React/Next.js)

```typescript
// hooks/useGoogleOAuth.ts
import { useCallback, useEffect } from "react";

export const useGoogleOAuth = () => {
  const integrationsService = new IntegrationsService();

  // Iniciar fluxo OAuth do Google
  const initiateGoogleOAuth = useCallback(async () => {
    try {
      const authUrl = await integrationsService.getGoogleAuthUrl();

      // Redirecionar para Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Erro ao iniciar OAuth do Google:", error);
    }
  }, []);

  // Processar callback do OAuth
  const handleOAuthCallback = useCallback(
    async (code: string, state?: string) => {
      try {
        const response = await fetch("/api/integrations/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) throw new Error("OAuth callback failed");

        const result = await response.json();
        console.log("Integração configurada:", result.message);

        // Redirecionar de volta para página de integrações
        window.location.href = "/dashboard/integrations";
      } catch (error) {
        console.error("Erro no callback OAuth:", error);
      }
    },
    []
  );

  return {
    initiateGoogleOAuth,
    handleOAuthCallback,
  };
};
```

### 4. OAuth com Microsoft

```typescript
// hooks/useMicrosoftOAuth.ts
import { PublicClientApplication } from "@azure/msal-browser";

export const useMicrosoftOAuth = () => {
  const integrationsService = new IntegrationsService();

  // Configuração MSAL
  const initializeMSAL = useCallback(async () => {
    const clientInfo = await integrationsService.getMicrosoftClientInfo();

    const msalConfig = {
      auth: {
        clientId: clientInfo.clientId,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: `${window.location.origin}/integrations/outlook/callback`,
      },
    };

    return new PublicClientApplication(msalConfig);
  }, []);

  // Iniciar login do Microsoft
  const initiateMicrosoftOAuth = useCallback(async () => {
    try {
      const pca = await initializeMSAL();
      const clientInfo = await integrationsService.getMicrosoftClientInfo();

      const loginRequest = {
        scopes: clientInfo.scopes,
        prompt: "consent",
      };

      const response = await pca.loginPopup(loginRequest);

      // Enviar código para o backend
      if (response.code) {
        await handleMicrosoftCallback(response.code);
      }
    } catch (error) {
      console.error("Erro no OAuth Microsoft:", error);
    }
  }, []);

  const handleMicrosoftCallback = async (code: string) => {
    const response = await fetch("/api/integrations/outlook/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) throw new Error("Microsoft OAuth callback failed");

    const result = await response.json();
    console.log("Integração Microsoft configurada:", result.message);
  };

  return {
    initiateMicrosoftOAuth,
    handleMicrosoftCallback,
  };
};
```

## 📱 Componentes UI

### 5. Página de Integrações (React)

```tsx
// pages/IntegrationsPage.tsx
import React, { useEffect, useState } from "react";
import { useGoogleOAuth } from "../hooks/useGoogleOAuth";
import { useMicrosoftOAuth } from "../hooks/useMicrosoftOAuth";

const IntegrationsPage: React.FC = () => {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const { initiateGoogleOAuth } = useGoogleOAuth();
  const { initiateMicrosoftOAuth } = useMicrosoftOAuth();
  const integrationsService = new IntegrationsService();

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const loadIntegrationsStatus = async () => {
    try {
      const integrationStatus = await integrationsService.getStatus();
      setStatus(integrationStatus);
    } catch (error) {
      console.error("Erro ao carregar status das integrações:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="integrations-page">
      <h1>Minhas Integrações</h1>

      {/* Google Services */}
      <div className="integration-section">
        <h2>Google</h2>

        <div className="integration-item">
          <div className="info">
            <h3>Google Calendar</h3>
            <p>Sincronize seus eventos do calendário</p>
            <span
              className={`status ${
                status?.googleCalendar.connected ? "connected" : "disconnected"
              }`}
            >
              {status?.googleCalendar.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <button
            onClick={initiateGoogleOAuth}
            disabled={status?.googleCalendar.connected}
            className="connect-btn"
          >
            {status?.googleCalendar.connected ? "Conectado" : "Conectar Google"}
          </button>
        </div>

        <div className="integration-item">
          <div className="info">
            <h3>Gmail</h3>
            <p>Gerencie seus emails</p>
            <span
              className={`status ${
                status?.gmail.connected ? "connected" : "disconnected"
              }`}
            >
              {status?.gmail.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <button
            onClick={initiateGoogleOAuth}
            disabled={status?.gmail.connected}
            className="connect-btn"
          >
            {status?.gmail.connected ? "Conectado" : "Conectar Google"}
          </button>
        </div>
      </div>

      {/* Microsoft Services */}
      <div className="integration-section">
        <h2>Microsoft</h2>

        <div className="integration-item">
          <div className="info">
            <h3>Outlook</h3>
            <p>Sincronize calendário e emails do Outlook</p>
            <span
              className={`status ${
                status?.outlook.connected ? "connected" : "disconnected"
              }`}
            >
              {status?.outlook.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <button
            onClick={initiateMicrosoftOAuth}
            disabled={status?.outlook.connected}
            className="connect-btn"
          >
            {status?.outlook.connected ? "Conectado" : "Conectar Microsoft"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
```

### 6. Página de Callback (Next.js)

```tsx
// pages/integrations/google/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useGoogleOAuth } from "../../../hooks/useGoogleOAuth";

const GoogleCallbackPage: React.FC = () => {
  const router = useRouter();
  const { handleOAuthCallback } = useGoogleOAuth();

  useEffect(() => {
    const processCallback = async () => {
      const { code, state } = router.query;

      if (code && typeof code === "string") {
        await handleOAuthCallback(code, state as string);
      } else {
        // Erro no callback
        router.push("/dashboard/integrations?error=oauth_failed");
      }
    };

    if (router.isReady) {
      processCallback();
    }
  }, [router.isReady, router.query, handleOAuthCallback]);

  return (
    <div className="callback-page">
      <h2>Processando autenticação...</h2>
      <p>Aguarde enquanto configuramos sua integração.</p>
    </div>
  );
};

export default GoogleCallbackPage;
```

## 🔧 Configuração de Rotas

### 7. Configuração de Rotas do Backend (adicionar ao arquivo existente)

```typescript
// Adicione essas rotas ao seu arquivo integrations.routes.ts

// POST /integrations/google/callback - Callback do Google OAuth
app.post<{
  Body: { code: string; state?: string };
}>(
  "/integrations/google/callback",
  {
    schema: {
      body: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
          state: { type: "string" },
        },
      },
    },
  },
  async (request, reply) => {
    try {
      const { code } = request.body;
      // @ts-expect-error - Better Auth user object structure
      const userId = request.user?.id || request.currentUser?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        return reply
          .status(500)
          .send({ error: "Credenciais do Google não configuradas" });
      }

      // Trocar código por tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${env.FRONTEND_URL}/integrations/google/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        return reply
          .status(400)
          .send({ error: "Falha na autenticação com Google" });
      }

      const tokens = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Salvar tokens no banco
      const existingIntegration = await db
        .select()
        .from(schema.userIntegrations)
        .where(eq(schema.userIntegrations.userId, userId))
        .limit(1);

      if (existingIntegration.length === 0) {
        await db.insert(schema.userIntegrations).values({
          id: `integration_${userId}_${Date.now()}`,
          userId,
          googleCalendarEnabled: true,
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarRefreshToken: tokens.refresh_token,
          googleCalendarTokenExpiresAt: expiresAt,
          gmailEnabled: true,
          gmailAccessToken: tokens.access_token,
          gmailRefreshToken: tokens.refresh_token,
          gmailTokenExpiresAt: expiresAt,
        });
      } else {
        await db
          .update(schema.userIntegrations)
          .set({
            googleCalendarEnabled: true,
            googleCalendarAccessToken: tokens.access_token,
            googleCalendarRefreshToken: tokens.refresh_token,
            googleCalendarTokenExpiresAt: expiresAt,
            gmailEnabled: true,
            gmailAccessToken: tokens.access_token,
            gmailRefreshToken: tokens.refresh_token,
            gmailTokenExpiresAt: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(schema.userIntegrations.userId, userId));
      }

      return reply.send({
        success: true,
        message: "Integração com Google configurada com sucesso",
      });
    } catch {
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }
);
```

## 📦 Dependências Necessárias

### 8. Instalar no Frontend

```bash
# Para React/Next.js
npm install @azure/msal-browser @azure/msal-react

# Para Vue.js
npm install @azure/msal-browser @azure/msal-vue

# Para Angular
npm install @azure/msal-browser @azure/msal-angular
```

## 🔄 Fluxo Completo

### 9. Resumo do Fluxo

1. **Usuário faz login** → Obtém token de autenticação
2. **Acessa página de integrações** → Vê status atual das conexões
3. **Clica em "Conectar Google"** → Frontend chama `/integrations/google/auth-url`
4. **Redireciona para Google** → Usuário autoriza a aplicação
5. **Google redireciona de volta** → Para `/integrations/google/callback?code=...`
6. **Frontend processa callback** → Envia código para backend via POST
7. **Backend troca por tokens** → Salva na base de dados
8. **Usuário retorna à página** → Vê integração como "Conectada"

## ⚙️ Configuração OAuth

### 10. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie/selecione projeto
3. Habilite APIs: Google Calendar API, Gmail API
4. Crie credenciais OAuth 2.0
5. Configure URLs autorizadas:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seudominio.com` (produção)
6. Configure URLs de redirecionamento:
   - `http://localhost:3000/integrations/google/callback`

### 11. Azure Portal (Microsoft)

1. Acesse [Azure Portal](https://portal.azure.com/)
2. Registre nova aplicação
3. Configure permissões do Microsoft Graph:
   - `Calendars.ReadWrite`
   - `Mail.ReadWrite`
4. Configure URLs de redirecionamento:
   - `http://localhost:3000/integrations/outlook/callback`

## 🔒 Segurança

### 12. Boas Práticas

- **Sempre use HTTPS em produção**
- **Valide tokens no backend**
- **Implemente refresh automático de tokens**
- **Use state parameter para prevenir CSRF**
- **Armazene tokens de forma segura**

```typescript
// Exemplo de renovação automática de token
const checkAndRefreshToken = async (service: "google" | "microsoft") => {
  const status = await integrationsService.getStatus();
  const integration =
    status[service === "google" ? "googleCalendar" : "outlook"];

  if (integration.tokenExpires) {
    const expiresAt = new Date(integration.tokenExpires);
    const now = new Date();
    const hoursUntilExpiry =
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 1) {
      // Token expira em menos de 1 hora, renovar
      await integrationsService.refreshToken(service);
    }
  }
};
```

Este guia fornece uma implementação completa do sistema OAuth para seu frontend. Adapte os exemplos conforme sua stack tecnológica (React, Vue, Angular, etc.).
