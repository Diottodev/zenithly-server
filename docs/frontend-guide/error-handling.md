# Tratamento de Erros no Frontend

É crucial que o frontend lide de forma robusta com os erros retornados pela API do Zenithly Server para proporcionar uma boa experiência ao usuário e depurar problemas. A API retorna respostas padronizadas para erros, facilitando o tratamento.

## Estrutura de Respostas de Erro

Quando ocorre um erro, a API geralmente retorna um objeto JSON com a seguinte estrutura:

```json
{
  "error": "string",
  "message": "string",
  "details"?: [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

*   `error` (string): Um código ou tipo de erro geral (ex: `Dados inválidos`, `Não autenticado`, `Erro interno do servidor`).
*   `message` (string): Uma mensagem mais descritiva sobre o erro, que pode ser exibida ao usuário.
*   `details` (array de objetos, opcional): Presente principalmente em erros de validação (`400 Bad Request`), contendo detalhes específicos sobre quais campos falharam na validação e por quê.

## Códigos de Status HTTP Comuns

O frontend deve estar preparado para lidar com os seguintes códigos de status HTTP:

*   **`2xx` (Sucesso):** Indica que a requisição foi recebida, entendida, aceita e processada com sucesso.
    *   `200 OK`: Requisição bem-sucedida.
    *   `201 Created`: Recurso criado com sucesso (geralmente em `POST`).
    *   `204 No Content`: Requisição bem-sucedida, mas sem conteúdo para retornar (geralmente em `DELETE`).

*   **`4xx` (Erro do Cliente):** Indica que houve um erro na requisição do cliente.
    *   `400 Bad Request`: A requisição não pôde ser entendida ou processada devido a sintaxe inválida ou dados incorretos (erros de validação).
    *   `401 Unauthorized`: A requisição requer autenticação. O token JWT está ausente, é inválido ou expirou.
    *   `403 Forbidden`: O servidor entendeu a requisição, mas se recusa a autorizá-la (o usuário não tem permissão para acessar o recurso).
    *   `404 Not Found`: O recurso solicitado não foi encontrado no servidor.
    *   `409 Conflict`: A requisição não pôde ser processada devido a um conflito com o estado atual do recurso (ex: tentar registrar um email já existente).

*   **`5xx` (Erro do Servidor):** Indica que o servidor falhou ao processar uma requisição válida.
    *   `500 Internal Server Error`: Um erro genérico do servidor que impede o processamento da requisição.

## Exemplo de Tratamento de Erros (usando `fetch`)

```javascript
async function makeApiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Lidar com erros baseados no código de status HTTP
      switch (response.status) {
        case 400:
          console.error('Erro de validação:', data.details || data.message);
          // Exibir mensagens de erro específicas para cada campo
          if (data.details) {
            data.details.forEach(detail => {
              console.error(`Campo: ${detail.field}, Mensagem: ${detail.message}`);
              // Atualizar UI para mostrar erro no campo específico
            });
          }
          throw new Error(data.message || 'Dados inválidos');
        case 401:
          console.error('Erro de autenticação:', data.message);
          // Redirecionar para a página de login, limpar token
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          throw new Error(data.message || 'Não autorizado');
        case 403:
          console.error('Erro de permissão:', data.message);
          // Exibir mensagem de acesso negado
          throw new Error(data.message || 'Acesso negado');
        case 404:
          console.error('Recurso não encontrado:', data.message);
          throw new Error(data.message || 'Recurso não encontrado');
        case 409:
          console.error('Conflito:', data.message);
          throw new Error(data.message || 'Conflito de dados');
        case 500:
          console.error('Erro interno do servidor:', data.message);
          // Exibir mensagem genérica de erro para o usuário
          throw new Error(data.message || 'Erro interno do servidor');
        default:
          console.error(`Erro ${response.status}:`, data.message);
          throw new Error(data.message || `Erro desconhecido: ${response.status}`);
      }
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    // Lidar com erros de rede ou outros erros inesperados
    throw error;
  }
}

// Exemplo de uso:
// makeApiRequest('/api/some-resource', { method: 'GET' })
//   .then(data => console.log(data))
//   .catch(error => console.error('Falha na operação:', error.message));
```

## Dicas para o Frontend

*   **Mensagens Amigáveis:** Traduza as mensagens de erro da API para uma linguagem mais amigável ao usuário, se necessário.
*   **Feedback Visual:** Forneça feedback visual claro ao usuário sobre o que deu errado (ex: campos com bordas vermelhas, mensagens de erro abaixo dos inputs).
*   **Logs:** Utilize os logs do navegador para depurar as respostas de erro da API.
*   **Global Error Handler:** Considere implementar um manipulador de erros global em seu aplicativo frontend para capturar e processar erros de API de forma centralizada.