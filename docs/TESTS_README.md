# Testes - Zenithly Server

Este documento descreve como executar e contribuir com os testes do servidor Zenithly.

## Estrutura de Testes

```
tests/
├── setup.ts                 # Configuração global dos testes
├── helpers/
│   └── app.ts               # Helper para criar instância da aplicação
├── routes/
│   ├── auth.test.ts         # Testes das rotas de autenticação
│   └── user.test.ts         # Testes das rotas de usuário
├── middleware/
│   └── auth.test.ts         # Testes do middleware de autenticação
└── integration/
    └── app.test.ts          # Testes de integração
```

## Executando os Testes

### Pré-requisitos

Instale as dependências:

```bash
pnpm install
```

### Comandos Disponíveis

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
pnpm test:watch

# Executar testes com relatório de cobertura
pnpm test:coverage
```

### No VSCode

Use as configurações de debug disponíveis no painel "Run and Debug":

- **Run All Tests**: Executa todos os testes
- **Run Tests in Watch Mode**: Executa em modo watch
- **Run Current Test File**: Executa apenas o arquivo atual
- **Run Tests with Coverage**: Executa com relatório de cobertura

## Testando Rotas Manualmente

Use o arquivo `client.http` na raiz do projeto para testar as rotas manualmente. Este arquivo contém exemplos de todas as rotas disponíveis.

### Extensão REST Client (VSCode)

1. Instale a extensão "REST Client" no VSCode
2. Abra o arquivo `client.http`
3. Clique em "Send Request" acima de cada requisição

### Exemplos de Uso

```http
### Health Check
GET http://localhost:3333/health

### Login
POST http://localhost:3333/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Listar usuários
GET http://localhost:3333/users?page=1&limit=10
```

## Estrutura dos Testes

### Testes de Unidade

- **Rotas**: Testam cada endpoint individualmente
- **Middleware**: Testam a lógica de autenticação e validação
- **Utilizam mocks**: Para isolar as dependências

### Testes de Integração

- **Fluxo completo**: Testam a aplicação como um todo
- **Headers de segurança**: Verificam configurações de CORS e segurança
- **Tratamento de erros**: Validam respostas para cenários de erro

## Cobertura de Testes

O projeto usa Vitest com o provedor de cobertura V8. Execute:

```bash
pnpm test:coverage
```

O relatório será gerado em `coverage/` e incluirá:

- Relatório HTML navegável
- Métricas de cobertura por arquivo
- Linhas não cobertas destacadas

## Boas Práticas

### Organização

- **Um arquivo de teste por módulo**: `auth.routes.ts` → `auth.test.ts`
- **Agrupamento por funcionalidade**: Use `describe()` para agrupar testes relacionados
- **Nomes descritivos**: Testes devem descrever claramente o comportamento esperado

### Mocking

- **Isole dependências**: Use mocks para banco de dados e serviços externos
- **Mock no nível correto**: Mock a menor unidade necessária
- **Limpe mocks**: Use `beforeEach()` para garantir estado limpo

### Assertions

```typescript
// ✅ Bom: Específico e claro
expect(response.statusCode).toBe(200);
expect(body.message).toBe("Login realizado com sucesso");

// ❌ Evite: Muito genérico
expect(response).toBeTruthy();
```

### Cenários de Teste

Para cada endpoint, teste:

- **Casos de sucesso**: Fluxo principal funcionando
- **Validação de entrada**: Dados inválidos ou ausentes
- **Autenticação**: Acesso com/sem permissões
- **Casos limite**: Valores extremos ou situações raras
- **Tratamento de erros**: Falhas de dependências

## Debugging

### Logs nos Testes

```typescript
// Para debuggar, adicione logs temporariamente
console.log("Response:", JSON.stringify(response.json(), null, 2));
```

### Rodando um Teste Específico

```bash
# Rodar apenas testes de auth
pnpm test auth

# Rodar um teste específico
pnpm test -- --grep "should login successfully"
```

### Modo Debug no VSCode

1. Adicione breakpoints no código de teste
2. Use "Run Current Test File" no painel de debug
3. O debugger pausará nos breakpoints

## Contribuindo

### Adicionando Novos Testes

1. Crie o arquivo de teste na pasta apropriada
2. Siga a estrutura existente com `describe()` e `it()`
3. Adicione mocks necessários no `setup.ts` se globais
4. Teste casos positivos e negativos
5. Execute os testes para verificar que passam

### Atualizando Testes Existentes

- Mantenha a cobertura atual ou melhore
- Atualize mocks se a API mudou
- Verifique se testes relacionados ainda passam

## Troubleshooting

### Problemas Comuns

**Testes falhando por timeout:**

```typescript
// Aumente o timeout para operações lentas
it("should handle slow operation", async () => {
  // ...
}, 10000); // 10 segundos
```

**Mocks não funcionando:**

```typescript
// Certifique-se de limpar mocks entre testes
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Banco de dados em testes:**

- Use um banco de dados de teste separado
- Configure a variável `NODE_ENV=test`
- Considere usar SQLite em memória para testes rápidos

### Recursos Úteis

- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do Fastify Testing](https://www.fastify.io/docs/latest/Guides/Testing/)
- [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
