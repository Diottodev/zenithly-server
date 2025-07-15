# Zenithly Server

API do servidor Zenithly construída com Fastify, TypeScript e PostgreSQL.

## 🚀 Funcionalidades

- **Autenticação**: Sistema completo de autenticação com JWT e Better Auth
- **Integrações**: Gerenciamento de integrações de usuários
- **Banco de dados**: PostgreSQL com Drizzle ORM
- **Testes**: Cobertura completa de testes com Vitest
- **CI/CD**: Deploy automático no AWS EC2 com GitHub Actions
- **Monitoramento**: Health checks e logs automáticos

## 🛠 Tecnologias

- **Runtime**: Node.js 20+ com TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Autenticação**: Better Auth + JWT
- **Testes**: Vitest
- **Linting**: Biome
- **Deploy**: PM2 + GitHub Actions
- **Monitoramento**: PM2 + Health Checks

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- pnpm
- PostgreSQL
- Git

### Setup Local

```bash
# Clonar repositório
git clone https://github.com/Diottodev/zenithly-server.git
cd zenithly-server

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar migrações
pnpm db:migrate

# Iniciar em modo desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/zenithly
JWT_SECRET=your_jwt_secret_here
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

## 🚀 Deploy

### Deploy Automático (Recomendado)

O projeto inclui CI/CD automático com GitHub Actions:

1. **Configure os secrets no GitHub**:
   - `EC2_HOST`: IP do seu servidor EC2
   - `EC2_USER`: Usuário SSH (ex: ubuntu)
   - `EC2_SSH_KEY`: Chave SSH privada
   - `EC2_PORT`: Porta SSH (padrão: 22)

2. **Configure o servidor EC2**:
   ```bash
   ./scripts/setup-server.sh
   ```

3. **Faça push para master**:
   ```bash
   git push origin master
   ```

4. **Deploy automático será executado**!

### Deploy Manual

```bash
# Deploy completo
pnpm deploy user@servidor.com

# Apenas reiniciar
pnpm deploy user@servidor.com restart-only
```

### Monitoramento

```bash
# Status completo
pnpm monitor user@servidor.com

# Apenas status
pnpm monitor user@servidor.com status

# Apenas logs
pnpm monitor user@servidor.com logs
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📊 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia servidor em modo desenvolvimento |
| `pnpm start` | Inicia servidor em modo produção |
| `pnpm test` | Executa todos os testes |
| `pnpm test:watch` | Executa testes em modo watch |
| `pnpm test:coverage` | Executa testes com coverage |
| `pnpm lint` | Executa linting |
| `pnpm format` | Formata código |
| `pnpm db:generate` | Gera migrações do banco |
| `pnpm db:migrate` | Executa migrações |
| `pnpm deploy` | Deploy manual |
| `pnpm monitor` | Monitor da aplicação |
| `pnpm setup-server` | Setup inicial do servidor |

## 🏥 Health Check

A aplicação inclui um endpoint de health check em `/health` que retorna:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "memory": {...},
  "pid": 1234,
  "environment": "production",
  "version": "v20.0.0",
  "database": "connected"
}
```

## 📁 Estrutura do Projeto

```
src/
├── auth.ts                 # Configuração de autenticação
├── env.ts                  # Validação de variáveis de ambiente
├── server.ts               # Servidor principal
├── db/
│   ├── connection.ts       # Conexão com banco
│   ├── drizzle/            # Schemas do banco
│   └── migrations/         # Migrações
├── http/
│   ├── handlers/           # Handlers HTTP
│   ├── routes/             # Rotas da API
│   ├── schemas/            # Schemas de validação
│   └── types/              # Tipos TypeScript
├── middleware/             # Middlewares
└── plugins/                # Plugins do Fastify

.github/
└── workflows/              # GitHub Actions
    ├── ci-cd.yml           # CI/CD principal
    ├── deploy.yml          # Deploy manual
    ├── health-check.yml    # Health checks
    └── notifications.yml   # Notificações

scripts/
├── setup-server.sh         # Setup do servidor
├── deploy.sh              # Deploy manual
└── monitor.sh             # Monitoramento
```

## 🔧 Configuração do PM2

O projeto inclui configuração completa do PM2 no arquivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'zenithly-server',
    script: 'src/server.ts',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 📈 Monitoramento

### GitHub Actions

- **CI/CD**: Deploy automático no push para master
- **Health Check**: Verifica saúde da aplicação a cada 5 minutos
- **Notificações**: Slack/Discord para falhas

### PM2

- **Logs**: Logs automáticos em `logs/`
- **Restart**: Reinício automático em caso de falha
- **Monitoramento**: Interface web com `pm2 monit`

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com banco**:
   ```bash
   # Verificar se PostgreSQL está rodando
   sudo systemctl status postgresql
   
   # Verificar configuração
   psql -U zenithly -d zenithly -h localhost
   ```

2. **Aplicação não inicia**:
   ```bash
   # Verificar logs do PM2
   pm2 logs zenithly-server
   
   # Verificar arquivo .env
   cat .env
   ```

3. **Deploy falha**:
   ```bash
   # Verificar secrets do GitHub
   # Testar conexão SSH
   ssh user@servidor.com
   ```

### Logs Úteis

```bash
# Logs da aplicação
pm2 logs zenithly-server

# Logs do sistema
tail -f /var/log/syslog

# Logs do nginx (se configurado)
tail -f /var/log/nginx/error.log
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 📞 Suporte

Para suporte, entre em contato:

- **GitHub**: [Diottodev](https://github.com/Diottodev)
- **Email**: seu-email@exemplo.com

## 📚 Documentação Adicional

- [Guia de Deploy](./DEPLOYMENT.md)
- [Guia de OAuth](./OAUTH_IMPLEMENTATION_SUMMARY.md)
- [Guia de Integrações](./INTEGRATIONS.md)
- [Guia Frontend OAuth](./FRONTEND_OAUTH_GUIDE.md)
