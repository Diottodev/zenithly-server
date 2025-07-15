#!/bin/bash

# Script para monitoramento da aplicação
# Use este script para monitorar a aplicação remotamente

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
    error "Uso: $0 <user@host> [comando]"
    echo "Comandos disponíveis:"
    echo "  status     - Mostra status do PM2"
    echo "  logs       - Mostra logs da aplicação"
    echo "  health     - Testa health check"
    echo "  restart    - Reinicia aplicação"
    echo "  monitor    - Monitora recursos"
    echo "  full       - Executa todos os comandos"
    echo ""
    echo "Exemplos:"
    echo "  $0 ubuntu@ec2-123-456-789.compute-1.amazonaws.com status"
    echo "  $0 ubuntu@ec2-123-456-789.compute-1.amazonaws.com full"
    exit 1
fi

SERVER=$1
COMMAND=${2:-full}

log "🔍 Iniciando monitoramento para $SERVER..."

# Verificar se consegue conectar ao servidor
log "Testando conexão SSH..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER" echo "Conexão OK" > /dev/null 2>&1; then
    error "Não foi possível conectar ao servidor $SERVER"
    exit 1
fi

# Função para executar comandos no servidor
run_remote() {
    local cmd=$1
    ssh "$SERVER" "$cmd"
}

# Função para mostrar status do PM2
show_status() {
    log "📊 Status do PM2:"
    run_remote "pm2 status"
    echo
}

# Função para mostrar logs
show_logs() {
    log "📝 Logs da aplicação (últimas 20 linhas):"
    run_remote "pm2 logs zenithly-server --lines 20"
    echo
}

# Função para testar health check
test_health() {
    log "🏥 Testando health check..."
    
    HEALTH_RESULT=$(run_remote "curl -s http://localhost:8080/health 2>/dev/null || echo 'FAILED'")
    
    if echo "$HEALTH_RESULT" | grep -q '"status":"OK"'; then
        log "✅ Health check passou!"
        echo "$HEALTH_RESULT" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESULT"
    else
        warn "⚠️  Health check falhou!"
        echo "$HEALTH_RESULT"
    fi
    echo
}

# Função para reiniciar aplicação
restart_app() {
    log "🔄 Reiniciando aplicação..."
    run_remote "pm2 restart zenithly-server"
    sleep 3
    show_status
}

# Função para monitorar recursos
monitor_resources() {
    log "💻 Recursos do sistema:"
    run_remote "echo '=== CPU e Memória ==='; top -bn1 | head -10"
    run_remote "echo '=== Espaço em disco ==='; df -h"
    run_remote "echo '=== Memória ==='; free -h"
    run_remote "echo '=== Conexões de rede ==='; netstat -tuln | grep :3000"
    echo
}

# Função para monitoramento completo
full_monitor() {
    show_status
    test_health
    show_logs
    monitor_resources
    
    log "🔍 Análise dos logs para erros..."
    ERROR_COUNT=$(run_remote "pm2 logs zenithly-server --lines 100 --err | wc -l")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        warn "⚠️  Encontrados $ERROR_COUNT erros nos logs recentes:"
        run_remote "pm2 logs zenithly-server --lines 20 --err"
    else
        log "✅ Nenhum erro encontrado nos logs recentes"
    fi
    echo
}

# Executar comando baseado no parâmetro
case $COMMAND in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "health")
        test_health
        ;;
    "restart")
        restart_app
        ;;
    "monitor")
        monitor_resources
        ;;
    "full")
        full_monitor
        ;;
    *)
        error "Comando '$COMMAND' não reconhecido"
        exit 1
        ;;
esac

log "✅ Monitoramento concluído!"
echo
echo "Comandos úteis para execução direta:"
echo "  ssh $SERVER 'pm2 status'"
echo "  ssh $SERVER 'pm2 logs zenithly-server'"
echo "  ssh $SERVER 'pm2 restart zenithly-server'"
echo "  ssh $SERVER 'pm2 monit'"
echo "  ssh $SERVER 'curl http://localhost:8080/health'"
