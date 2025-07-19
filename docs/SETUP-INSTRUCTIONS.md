# Instruções de Configuração CI/CD - Zenithly Server

## ✅ Arquivos Criados

O sistema de CI/CD foi configurado com os seguintes arquivos:

### GitHub Actions (`.github/workflows/`)

- `ci-cd.yml` - Pipeline principal de CI/CD
- `deploy.yml` - Deploy manual
- `health-check.yml` - Monitoramento automático
- `notifications.yml` - Notificações Discord/Slack

### Scripts (`scripts/`)

- `setup-server.sh` - Setup inicial do servidor EC2
- `deploy.sh` - Deploy manual
- `monitor.sh` - Monitoramento da aplicação

### Configuração

- `ecosystem.config.js` - Configuração do PM2
- `DEPLOYMENT.md` - Documentação completa
- `README.md` - Documentação atualizada

## 🔧 Próximos Passos

### 1. Configurar Secrets no GitHub

Vá para `Settings > Secrets and variables > Actions` no seu repositório e adicione:

**Obrigatórios:**

- `EC2_HOST` - IP ou hostname do seu EC2
- `EC2_USER` - Usuário SSH (ex: ubuntu)
- `EC2_SSH_KEY` - Sua chave SSH privada
- `EC2_PORT` - Porta SSH (padrão: 22)

**Opcionais:**

- `API_URL` - URL da sua API para health check
- `DISCORD_WEBHOOK` - Webhook do Discord para notificações
- `SLACK_WEBHOOK` - Webhook do Slack para notificações

### 2. Configurar o Servidor EC2

**Opção 1: Usar o script automático**

```bash
# No servidor EC2
curl -o setup-server.sh https://raw.githubusercontent.com/Diottodev/zenithly-server/master/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

**Opção 2: Manual**

```bash
# Instalar dependências
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm e PM2
sudo npm install -g pnpm pm2

# Configurar PM2 para boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configurar banco
sudo -u postgres psql -c "CREATE USER zenithly WITH PASSWORD 'zenithly_password';"
sudo -u postgres psql -c "CREATE DATABASE zenithly OWNER zenithly;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zenithly TO zenithly;"
```

### 3. Clonar e Configurar Aplicação

```bash
# Clonar repo
git clone https://github.com/Diottodev/zenithly-server.git
cd zenithly-server

# Instalar dependências
pnpm install

# Criar arquivo .env
cp .env.example .env
# Editar com suas configurações

# Executar migrações
pnpm db:migrate

# Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### 4. Testar o Sistema

```bash
# Testar localmente
curl http://localhost:3000/health

# Fazer um commit para testar CI/CD
git add .
git commit -m "feat: adicionar CI/CD completo"
git push origin master
```

## 🚀 Funcionalidades Disponíveis

### Deploy Automático

- ✅ Testes automáticos no PR/push
- ✅ Deploy automático no push para master
- ✅ Reinicialização automática do PM2
- ✅ Migrações automáticas do banco

### Monitoramento

- ✅ Health check a cada 5 minutos
- ✅ Reinício automático em caso de falha
- ✅ Notificações no Discord/Slack
- ✅ Logs detalhados

### Deploy Manual

- ✅ Deploy via GitHub Actions
- ✅ Deploy via script local
- ✅ Opção de apenas reiniciar
- ✅ Logs em tempo real

### Ferramentas de Monitoramento

- ✅ Script de monitoramento completo
- ✅ Health check detalhado
- ✅ Logs estruturados
- ✅ Métricas de sistema

## 🛠 Comandos Úteis

### No servidor EC2:

```bash
# Status da aplicação
pm2 status

# Logs
pm2 logs zenithly-server

# Reiniciar
pm2 restart zenithly-server

# Monitorar
pm2 monit
```

### Localmente:

```bash
# Deploy manual
./scripts/deploy.sh ubuntu@seu-servidor.com

# Monitor
./scripts/monitor.sh ubuntu@seu-servidor.com

# Apenas reiniciar
./scripts/deploy.sh ubuntu@seu-servidor.com restart-only
```

## 🔒 Segurança

- ✅ Secrets não expostos no código
- ✅ Variáveis de ambiente seguras
- ✅ Conexões SSH seguras
- ✅ Firewall configurado
- ✅ Logs protegidos

## 📊 Monitoramento Incluído

- ✅ Health check endpoint: `/health`
- ✅ Métricas de sistema
- ✅ Status do banco de dados
- ✅ Uptime e memória
- ✅ Logs estruturados

## 🎯 Conclusão

O sistema está pronto para uso! Após configurar os secrets e o servidor:

1. **Push para master** = Deploy automático
2. **GitHub Actions** = Monitoramento contínuo
3. **PM2** = Gerenciamento de processos
4. **Scripts** = Ferramentas de operação

Para suporte, consulte o arquivo `DEPLOYMENT.md` ou abra uma issue no GitHub.

**Sucesso! 🚀**
