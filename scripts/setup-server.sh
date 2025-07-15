#!/bin/bash

# Script para setup inicial do servidor EC2
# Execute este script no seu servidor EC2 para configurar o ambiente

set -e

echo "🚀 Iniciando setup do servidor Zenithly..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logs
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está executando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root!"
   exit 1
fi

# Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
log "Instalando dependências básicas..."
sudo apt install -y curl wget git build-essential

# Instalar Node.js 20
log "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
log "Instalando pnpm..."
sudo npm install -g pnpm

# Instalar PM2
log "Instalando PM2..."
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
log "Configurando PM2 para iniciar no boot..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Instalar PostgreSQL
log "Instalando PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE USER zenithly WITH PASSWORD 'zenithly_password';"
sudo -u postgres psql -c "CREATE DATABASE zenithly OWNER zenithly;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zenithly TO zenithly;"

# Criar diretório da aplicação
APP_DIR="/home/$USER/zenithly-server"
log "Criando diretório da aplicação em $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clonar repositório (se não existir)
if [ ! -d ".git" ]; then
    log "Clonando repositório..."
    git clone https://github.com/Diottodev/zenithly-server.git .
fi

# Instalar dependências
log "Instalando dependências da aplicação..."
pnpm install --frozen-lockfile

# Criar arquivo .env (template)
if [ ! -f ".env" ]; then
    log "Criando arquivo .env template..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://zenithly:zenithly_password@localhost:5432/zenithly

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=3000
NODE_ENV=production

# Better Auth
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=https://your-domain.com

# Add other environment variables as needed
EOF
    warn "⚠️  Arquivo .env criado! EDITE-O com suas configurações reais antes de continuar!"
fi

# Executar migrações
log "Executando migrações do banco de dados..."
pnpm db:migrate

# Criar diretório de logs
mkdir -p logs

# Configurar firewall (opcional)
log "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

# Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# Instalar nginx (opcional)
read -p "Deseja instalar e configurar nginx como reverse proxy? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Instalando nginx..."
    sudo apt install -y nginx
    
    # Configurar nginx
    sudo tee /etc/nginx/sites-available/zenithly << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    sudo ln -s /etc/nginx/sites-available/zenithly /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log "Nginx configurado! Lembre-se de ajustar o server_name em /etc/nginx/sites-available/zenithly"
fi

log "✅ Setup concluído com sucesso!"
echo
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações reais"
echo "2. Configure os secrets no GitHub:"
echo "   - EC2_HOST: IP ou hostname do seu servidor"
echo "   - EC2_USER: usuário SSH (provavelmente '$USER')"
echo "   - EC2_SSH_KEY: sua chave SSH privada"
echo "   - EC2_PORT: porta SSH (padrão: 22)"
echo "3. Faça push do código para o GitHub"
echo "4. O deploy automático será executado!"
echo
echo "Comandos úteis:"
echo "- Ver status: pm2 status"
echo "- Ver logs: pm2 logs zenithly-server"
echo "- Reiniciar: pm2 restart zenithly-server"
echo "- Monitorar: pm2 monit"
