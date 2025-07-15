# CI/CD e Deploy Automático - Zenithly Server

Este projeto inclui um sistema completo de CI/CD com GitHub Actions para deploy automático no EC2 da AWS usando PM2.

## 🚀 Funcionalidades

- **CI/CD Automático**: Deploy automático no push para branch `master`
- **Testes Automatizados**: Execução de testes, linting e coverage
- **Health Check**: Monitoramento automático da aplicação
- **Deploy Manual**: Possibilidade de deploy manual via GitHub Actions
- **Restart Automático**: Reinício automático da aplicação via PM2

## 📋 Pré-requisitos

### No servidor EC2:
- Ubuntu 20.04+ ou Amazon Linux 2
- Node.js 20+
- pnpm
- PM2
- PostgreSQL
- Git

### No GitHub:
- Repositório com acesso às GitHub Actions
- Secrets configurados (veja seção abaixo)

## 🔧 Configuração Inicial

### 1. Setup do Servidor EC2

Execute o script de setup no seu servidor EC2:

```bash
# Baixar e executar o script de setup
wget https://raw.githubusercontent.com/Diottodev/zenithly-server/master/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### 2. Configuração dos Secrets no GitHub

Vá até `Settings > Secrets and variables > Actions` no seu repositório GitHub e adicione:

#### Secrets Obrigatórios:
- `EC2_HOST`: IP público ou hostname do seu servidor EC2
- `EC2_USER`: Usuário SSH (geralmente `ubuntu` ou `ec2-user`)
- `EC2_SSH_KEY`: Sua chave SSH privada para conectar ao EC2
- `EC2_PORT`: Porta SSH (padrão: 22)

#### Secrets Opcionais:
- `API_URL`: URL da sua API para health check (ex: `https://api.zenithly.com`)
- `SLACK_WEBHOOK`: Webhook do Slack para notificações de falhas

### 3. Configuração do Arquivo .env

No servidor EC2, edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/zenithly

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta

# Server
PORT=3000
NODE_ENV=production

# Better Auth
BETTER_AUTH_SECRET=sua_chave_better_auth_secreta
BETTER_AUTH_URL=https://seu-dominio.com

# Adicione outras variáveis conforme necessário
```

## 📁 Estrutura dos Workflows

### 1. CI/CD Principal (`.github/workflows/ci-cd.yml`)
- **Trigger**: Push para `master` ou Pull Request
- **Funcionalidades**:
  - Executa testes com PostgreSQL
  - Roda linting e coverage
  - Deploy automático no EC2
  - Reinicia PM2

### 2. Deploy Manual (`.github/workflows/deploy.yml`)
- **Trigger**: Manual via GitHub Actions
- **Funcionalidades**:
  - Deploy para production ou staging
  - Opção de apenas reiniciar PM2
  - Logs detalhados do processo

### 3. Health Check (`.github/workflows/health-check.yml`)
- **Trigger**: A cada 5 minutos (cron) ou manual
- **Funcionalidades**:
  - Verifica se a API está respondendo
  - Reinicia PM2 se houver falha
  - Notificações no Slack (opcional)

## 🛠 Comandos Úteis

### No servidor EC2:

```bash
# Ver status do PM2
pm2 status

# Ver logs da aplicação
pm2 logs zenithly-server

# Reiniciar aplicação
pm2 restart zenithly-server

# Monitorar aplicação
pm2 monit

# Salvar configuração atual do PM2
pm2 save

# Recarregar configuração do PM2
pm2 reload ecosystem.config.js
```

### Via GitHub Actions:

1. **Deploy Manual**:
   - Vá para `Actions > Deploy to EC2`
   - Clique em `Run workflow`
   - Escolha o ambiente e opções

2. **Health Check Manual**:
   - Vá para `Actions > Health Check`
   - Clique em `Run workflow`

## 📊 Monitoramento

### Endpoints de Health Check:
- `GET /health`: Retorna status da aplicação e database

### Logs:
- PM2 logs: `~/zenithly-server/logs/`
- Aplicação: `pm2 logs zenithly-server`

## 🔄 Processo de Deploy

1. **Desenvolvimento**: Faça push para branch `master`
2. **CI**: GitHub Actions executa testes automaticamente
3. **Deploy**: Se os testes passarem, deploy automático no EC2
4. **Verificação**: Health check automático verifica se a aplicação está OK

## 🚨 Solução de Problemas

### Deploy falha:
1. Verifique se os secrets estão configurados corretamente
2. Confirme se o servidor EC2 está acessível
3. Verifique os logs do GitHub Actions

### Aplicação não inicia:
1. Verifique o arquivo `.env`
2. Confirme se o banco de dados está rodando
3. Verifique os logs do PM2: `pm2 logs zenithly-server`

### Health check falha:
1. Verifique se a aplicação está rodando: `pm2 status`
2. Teste o endpoint manualmente: `curl localhost:3000/health`
3. Verifique logs de erro: `pm2 logs zenithly-server --err`

## 📝 Personalização

### Alterar configurações do PM2:
Edite o arquivo `ecosystem.config.js` e execute:
```bash
pm2 reload ecosystem.config.js
```

### Adicionar novos workflows:
Crie novos arquivos `.yml` na pasta `.github/workflows/`

### Modificar health check:
Edite o endpoint `/health` no arquivo `src/server.ts`

## 🔒 Segurança

- Nunca commite secrets no código
- Use variáveis de ambiente para dados sensíveis
- Mantenha as chaves SSH seguras
- Configure firewall no EC2
- Use HTTPS em produção

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do GitHub Actions
2. Confirme a configuração dos secrets
3. Teste a conexão SSH manualmente
4. Verifique os logs do PM2 no servidor
