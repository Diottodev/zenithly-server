#!/bin/bash

# Script para deploy manual local
# Use este script para fazer deploy direto do seu ambiente local

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se os argumentos foram passados
if [ $# -eq 0 ]; then
    error "Uso: $0 <user@host> [restart-only]"
    echo "Exemplos:"
    echo "  $0 ubuntu@ec2-123-456-789.compute-1.amazonaws.com"
    echo "  $0 ubuntu@ec2-123-456-789.compute-1.amazonaws.com restart-only"
    exit 1
fi

SERVER=$1
RESTART_ONLY=${2:-false}

log "🚀 Iniciando deploy manual para $SERVER..."

# Verificar se consegue conectar ao servidor
log "Testando conexão SSH..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" echo "Conexão OK" > /dev/null 2>&1; then
    error "Não foi possível conectar ao servidor $SERVER"
    echo "Verifique:"
    echo "- Se o servidor está rodando"
    echo "- Se a chave SSH está configurada"
    echo "- Se o usuário e host estão corretos"
    exit 1
fi

# Função para executar comandos no servidor
run_remote() {
    local cmd=$1
    log "Executando: $cmd"
    ssh "$SERVER" "$cmd"
}

# Função para deploy completo
deploy_full() {
    log "📦 Executando deploy completo..."
    
    run_remote "cd zenithly-server || cd /var/www/zenithly-server"
    run_remote "git pull origin master"
    run_remote "pnpm install --frozen-lockfile"
    run_remote "pnpm db:migrate"
    run_remote "pm2 restart zenithly-server || pm2 start ecosystem.config.js"
}

# Função para apenas reiniciar
restart_only() {
    log "🔄 Reiniciando apenas PM2..."
    
    run_remote "pm2 restart zenithly-server"
}

# Executar deploy baseado no parâmetro
if [ "$RESTART_ONLY" = "restart-only" ]; then
    restart_only
else
    deploy_full
fi

# Mostrar status final
log "📊 Status final da aplicação:"
run_remote "pm2 status"

log "📝 Últimas linhas do log:"
run_remote "pm2 logs zenithly-server --lines 10"

# Testar health check
log "🏥 Testando health check..."
HEALTH_CHECK=$(run_remote "curl -s http://localhost:8080/health || echo 'FAILED'")

if echo "$HEALTH_CHECK" | grep -q '"status":"OK"'; then
    log "✅ Health check passou! Aplicação está saudável."
else
    warn "⚠️  Health check falhou. Verifique os logs:"
    run_remote "pm2 logs zenithly-server --err --lines 20"
fi

log "🎉 Deploy concluído!"
echo
echo "Comandos úteis:"
echo "  ssh $SERVER 'pm2 status'           # Ver status"
echo "  ssh $SERVER 'pm2 logs zenithly-server'  # Ver logs"
echo "  ssh $SERVER 'pm2 restart zenithly-server'  # Reiniciar"
echo "  ssh $SERVER 'pm2 monit'            # Monitorar"
