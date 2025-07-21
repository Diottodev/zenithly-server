# Autenticação no Frontend

Para interagir com a maioria dos endpoints do Zenithly Server, seu aplicativo frontend precisará autenticar os usuários. O servidor utiliza JSON Web Tokens (JWT) para gerenciar sessões de usuário.

## Fluxo de Autenticação

O fluxo de autenticação geralmente segue os seguintes passos:

1.  **Login do Usuário:** O usuário fornece suas credenciais (email e senha) ou inicia um fluxo OAuth (Google, GitHub).
2.  **Requisição ao Servidor:** O frontend envia essas credenciais para o endpoint de login (`POST /auth/login`) ou inicia o fluxo OAuth (`GET /auth/google`, `GET /auth/github`).
3.  **Resposta do Servidor:**
    *   Em caso de sucesso no login com email/senha, o servidor retorna um objeto contendo os dados do usuário e um `token` JWT.
    *   Em caso de sucesso no OAuth, o servidor redireciona o navegador para uma URL de callback no frontend, que incluirá o token JWT como um parâmetro de query.
4.  **Armazenamento do Token:** O frontend deve armazenar este token JWT de forma segura (por exemplo, em `localStorage`, `sessionStorage` ou cookies HTTP-only, dependendo da sua estratégia de segurança).
5.  **Requisições Autenticadas:** Para todas as requisições subsequentes a endpoints protegidos, o token JWT deve ser incluído no cabeçalho `Authorization` no formato `Bearer <token>`. O servidor validará este token para autorizar a requisição.
6.  **Logout:** Quando o usuário faz logout, o frontend deve enviar uma requisição para `POST /auth/logout` para invalidar o token no servidor e remover o token armazenado localmente.

### Exemplo de Login com Email e Senha (usando `fetch`)

```javascript
async function login(email, password) {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('jwt_token', data.token);
      console.log('Login bem-sucedido!', data.user);
      return data.user;
    } else {
      console.error('Erro no login:', data.message);
      throw new Error(data.message || 'Falha no login');
    }
  } catch (error) {
    console.error('Erro de rede ou servidor:', error);
    throw error;
  }
}

// Exemplo de uso
// login('usuario@example.com', 'minhasenha123');
```

### Exemplo de Requisição Autenticada (usando `fetch`)

```javascript
async function fetchProtectedData() {
  const token = localStorage.getItem('jwt_token');

  if (!token) {
    console.error('Nenhum token JWT encontrado. Usuário não autenticado.');
    return;
  }

  try {
    const response = await fetch('/users/me', { // Exemplo de endpoint protegido
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Dados protegidos:', data);
      return data;
    } else if (response.status === 401) {
      console.error('Sessão expirada ou inválida. Redirecionando para login...');
      // Lógica para redirecionar para a página de login e limpar o token
      localStorage.removeItem('jwt_token');
    } else {
      console.error('Erro ao buscar dados protegidos:', data.message);
      throw new Error(data.message || 'Erro ao buscar dados');
    }
  } catch (error) {
    console.error('Erro de rede ou servidor:', error);
    throw error;
  }
}

// Exemplo de uso
// fetchProtectedData();
```

### Gerenciamento de Sessão

É recomendável verificar a validade do token periodicamente ou ao iniciar a aplicação (usando `GET /auth/session`) para garantir que a sessão do usuário ainda é válida. Se o token expirar ou for inválido, o usuário deve ser redirecionado para a tela de login.

## Integração OAuth (Google/GitHub)

Para integrações OAuth, o fluxo é um pouco diferente:

1.  **Obter URL de Autorização:** O frontend faz uma requisição para `GET /auth/google` ou `GET /auth/github`. O servidor retorna uma URL de autorização do provedor OAuth.
2.  **Redirecionar Usuário:** O frontend redireciona o navegador do usuário para esta URL.
3.  **Autorização do Usuário:** O usuário autoriza seu aplicativo no site do provedor OAuth.
4.  **Callback:** O provedor OAuth redireciona o navegador do usuário de volta para a URL de callback configurada no servidor (`/auth/callback`).
5.  **Processamento no Servidor:** O servidor processa o código de autorização, troca por tokens de acesso e refresh, e então redireciona o navegador do usuário para uma URL de callback no frontend (ex: `/auth/callback?success=true&token=<JWT>`).
6.  **Armazenamento do Token no Frontend:** O frontend extrai o token JWT da URL e o armazena, seguindo os mesmos passos do login com email/senha.

Para mais detalhes sobre os endpoints de autenticação, consulte a [API Reference - Autenticação](/api/auth).
