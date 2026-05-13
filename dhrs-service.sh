#!/bin/bash

# D-HRS Service Management Script
# 链聘通 (ChainHire) - Service Manager

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID files directory
PID_DIR="$PROJECT_ROOT/.pids"
mkdir -p "$PID_DIR"

# Log files directory
LOG_DIR="$PROJECT_ROOT/.logs"
mkdir -p "$LOG_DIR"

# Service definitions
declare -A SERVICES=(
    ["bitcoin"]="Bitcoin Core"
    ["lnd"]="LND Lightning"
    ["hardhat"]="Hardhat Node"
    ["backend"]="Backend API"
    ["webui"]="Web UI"
    ["mobile"]="Mobile App"
)

# Port definitions
declare -A PORTS=(
    ["bitcoin"]="8332"
    ["lnd"]="10009"
    ["hardhat"]="8545"
    ["backend"]="3001"
    ["webui"]="8001"
    ["mobile"]="8081"
)

# ============================================================
# Helper Functions
# ============================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_header() {
    echo -e "\n${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}\n"
}

get_pid() {
    local service=$1
    local pid_file="$PID_DIR/$service.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        fi
        rm -f "$pid_file"
    fi
    return 1
}

is_running() {
    local service=$1
    get_pid "$service" > /dev/null 2>&1
}

check_port() {
    local port=$1
    if command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | grep -q ":$port " && return 0
    elif command -v ss &> /dev/null; then
        ss -tlnp 2>/dev/null | grep -q ":$port " && return 0
    elif command -v lsof &> /dev/null; then
        lsof -i :"$port" &>/dev/null && return 0
    fi
    return 1
}

wait_for_port() {
    local port=$1
    local timeout=${2:-30}
    local count=0
    
    while [ $count -lt $timeout ]; do
        if check_port "$port"; then
            return 0
        fi
        sleep 1
        ((count++))
    done
    return 1
}

# ============================================================
# Service Management Functions
# ============================================================

start_bitcoin() {
    if is_running "bitcoin"; then
        log_warn "Bitcoin Core is already running (PID: $(get_pid bitcoin))"
        return 0
    fi
    
    log_info "Starting Bitcoin Core..."
    
    # Check if bitcoind is already running system-wide
    if pgrep -x "bitcoind" > /dev/null; then
        log_success "Bitcoin Core is already running system-wide"
        echo $(pgrep -x "bitcoind" | head -1) > "$PID_DIR/bitcoin.pid"
        return 0
    fi
    
    bitcoind \
        -zmqpubrawblock=tcp://127.0.0.1:28332 \
        -zmqpubrawtx=tcp://127.0.0.1:28333 \
        -daemon \
        -pid="$PID_DIR/bitcoin.pid" 2>&1 || true
    
    if wait_for_port 8332 10; then
        log_success "Bitcoin Core started (RPC: 8332)"
    else
        log_error "Bitcoin Core failed to start"
        return 1
    fi
}

stop_bitcoin() {
    if pgrep -x "bitcoind" > /dev/null; then
        log_info "Stopping Bitcoin Core..."
        bitcoin-cli stop 2>/dev/null || kill $(pgrep -x "bitcoind") 2>/dev/null || true
        sleep 2
        log_success "Bitcoin Core stopped"
    else
        log_warn "Bitcoin Core is not running"
    fi
    rm -f "$PID_DIR/bitcoin.pid"
}

restart_bitcoin() {
    stop_bitcoin
    sleep 2
    start_bitcoin
}

start_lnd() {
    if is_running "lnd"; then
        log_warn "LND is already running (PID: $(get_pid lnd))"
        return 0
    fi
    
    # Check if lnd is already running system-wide
    if pgrep -x "lnd" > /dev/null; then
        log_success "LND is already running system-wide"
        echo $(pgrep -x "lnd" | head -1) > "$PID_DIR/lnd.pid"
        return 0
    fi
    
    log_info "Starting LND..."
    
    nohup lnd \
        --bitcoin.mainnet \
        --noseedbackup \
        --bitcoin.node=bitcoind \
        --bitcoind.rpcuser=btc_rpc_user \
        --bitcoind.rpcpass=StrongPassw0rd_123 \
        --bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332 \
        --bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333 \
        > "$LOG_DIR/lnd.log" 2>&1 &
    
    echo $! > "$PID_DIR/lnd.pid"
    
    # Wait for LND to start
    sleep 10
    
    # Check if LND is running
    if pgrep -x "lnd" > /dev/null; then
        log_success "LND started (REST: 10009)"
    else
        log_error "LND failed to start. Check $LOG_DIR/lnd.log"
        return 1
    fi
}

stop_lnd() {
    if pgrep -x "lnd" > /dev/null; then
        log_info "Stopping LND..."
        lncli stop 2>/dev/null || kill $(pgrep -x "lnd") 2>/dev/null || true
        sleep 2
        log_success "LND stopped"
    else
        log_warn "LND is not running"
    fi
    rm -f "$PID_DIR/lnd.pid"
}

restart_lnd() {
    stop_lnd
    sleep 2
    start_lnd
}

start_hardhat() {
    if is_running "hardhat"; then
        log_warn "Hardhat is already running (PID: $(get_pid hardhat))"
        return 0
    fi
    
    # Check if already running on any port
    for port in 8545 8546 8547 8548 8555 9545 9555; do
        if check_port $port; then
            log_success "Hardhat is already running on port $port"
            return 0
        fi
    done
    
    log_info "Starting Hardhat Node..."
    
    cd "$PROJECT_ROOT/contracts"
    
    # Try multiple ports (WSL1 may have port conflicts with Windows)
    for port in 8545 8546 8547 8555 9545 9555 18545; do
        log_info "Trying port $port..."
        npx hardhat node --port $port > "$LOG_DIR/hardhat.log" 2>&1 &
        local pid=$!
        echo $pid > "$PID_DIR/hardhat.pid"
        
        sleep 5
        
        # Check if process is still running
        if kill -0 $pid 2>/dev/null; then
            log_success "Hardhat Node started (RPC: $port)"
            cd "$PROJECT_ROOT"
            return 0
        fi
        
        # Clean up failed attempt
        rm -f "$PID_DIR/hardhat.pid"
        log_warn "Port $port failed, trying next..."
        sleep 1
    done
    
    log_error "Hardhat failed to start on all ports."
    log_info "Try manually: cd contracts && npx hardhat node --port 8545"
    cd "$PROJECT_ROOT"
    return 1
}

stop_hardhat() {
    if is_running "hardhat"; then
        log_info "Stopping Hardhat..."
        kill $(get_pid hardhat) 2>/dev/null || true
        sleep 1
        log_success "Hardhat stopped"
    else
        # Try to kill any process on port 8545
        if check_port 8545; then
            kill $(lsof -t -i:8545) 2>/dev/null || true
            log_success "Hardhat stopped"
        else
            log_warn "Hardhat is not running"
        fi
    fi
    rm -f "$PID_DIR/hardhat.pid"
}

restart_hardhat() {
    stop_hardhat
    sleep 2
    start_hardhat
}

start_backend() {
    if is_running "backend"; then
        log_warn "Backend API is already running (PID: $(get_pid backend))"
        return 0
    fi
    
    log_info "Starting Backend API..."
    
    cd "$PROJECT_ROOT/backend"
    nohup node src/index.js > "$LOG_DIR/backend.log" 2>&1 &
    
    echo $! > "$PID_DIR/backend.pid"
    
    if wait_for_port 3001 10; then
        log_success "Backend API started (Port: 3001)"
    else
        log_error "Backend API failed to start. Check $LOG_DIR/backend.log"
        return 1
    fi
    cd "$PROJECT_ROOT"
}

stop_backend() {
    if is_running "backend"; then
        log_info "Stopping Backend API..."
        kill $(get_pid backend) 2>/dev/null || true
        sleep 1
        log_success "Backend API stopped"
    else
        log_warn "Backend API is not running"
    fi
    rm -f "$PID_DIR/backend.pid"
}

restart_backend() {
    stop_backend
    sleep 2
    start_backend
}

start_webui() {
    if is_running "webui"; then
        log_warn "Web UI is already running (PID: $(get_pid webui))"
        return 0
    fi
    
    log_info "Starting Web UI..."
    
    cd "$PROJECT_ROOT"
    nohup python3 -m http.server 8001 > "$LOG_DIR/webui.log" 2>&1 &
    
    echo $! > "$PID_DIR/webui.pid"
    
    if wait_for_port 8001 5; then
        log_success "Web UI started (Port: 8001)"
    else
        log_error "Web UI failed to start. Check $LOG_DIR/webui.log"
        return 1
    fi
}

stop_webui() {
    if is_running "webui"; then
        log_info "Stopping Web UI..."
        kill $(get_pid webui) 2>/dev/null || true
        sleep 1
        log_success "Web UI stopped"
    else
        log_warn "Web UI is not running"
    fi
    rm -f "$PID_DIR/webui.pid"
}

restart_webui() {
    stop_webui
    sleep 1
    start_webui
}

start_mobile() {
    if is_running "mobile"; then
        log_warn "Mobile App is already running (PID: $(get_pid mobile))"
        return 0
    fi

    log_info "Starting Mobile App..."
    
    cd "$PROJECT_ROOT/mobile"
    
    # --web starts Metro (Expo Go) + Webpack (browser) simultaneously
    nohup npx expo start --web > "$LOG_DIR/mobile.log" 2>&1 &
    local pid=$!
    echo $pid > "$PID_DIR/mobile.pid"
    
    sleep 10
    if is_running "mobile"; then
        log_success "Mobile App started (Metro: 8081, Web: 19006)"
        log_info "Web:  http://localhost:19006"
        log_info "Expo: scan QR code with Expo Go App"
    else
        log_error "Mobile App failed to start. Check $LOG_DIR/mobile.log"
        rm -f "$PID_DIR/mobile.pid"
        cd "$PROJECT_ROOT"
        return 1
    fi
    cd "$PROJECT_ROOT"
}

stop_mobile() {
    if is_running "mobile"; then
        log_info "Stopping Mobile App..."
        kill $(get_pid mobile) 2>/dev/null || true
        sleep 1
        log_success "Mobile App stopped"
    else
        log_warn "Mobile App is not running"
    fi
    rm -f "$PID_DIR/mobile.pid"
}

restart_mobile() {
    stop_mobile
    sleep 2
    start_mobile
}

# ============================================================
# Aggregate Functions
# ============================================================

start_all() {
    log_header "Starting All D-HRS Services"
    
    local services_order=("bitcoin" "lnd" "hardhat" "backend" "webui" "mobile")
    local failed=0
    
    for service in "${services_order[@]}"; do
        case $service in
            bitcoin)  start_bitcoin  || ((failed++)) ;;
            lnd)      start_lnd      || ((failed++)) ;;
            hardhat)  start_hardhat  || ((failed++)) ;;
            backend)  start_backend  || ((failed++)) ;;
            webui)    start_webui    || ((failed++)) ;;
            mobile)   start_mobile   || ((failed++)) ;;
        esac
        echo ""
    done
    
    log_header "Service Status Summary"
    show_status
    
    if [ $failed -gt 0 ]; then
        log_warn "$failed service(s) failed to start"
    else
        log_success "All services started successfully!"
    fi
}

stop_all() {
    log_header "Stopping All D-HRS Services"
    
    local services_order=("mobile" "webui" "backend" "hardhat" "lnd" "bitcoin")
    
    for service in "${services_order[@]}"; do
        case $service in
            mobile)   stop_mobile   ;;
            webui)    stop_webui    ;;
            backend)  stop_backend  ;;
            hardhat)  stop_hardhat  ;;
            lnd)      stop_lnd      ;;
            bitcoin)  stop_bitcoin  ;;
        esac
    done
    
    log_success "All services stopped"
}

restart_all() {
    log_header "Restarting All D-HRS Services"
    stop_all
    sleep 3
    start_all
}

show_status() {
    echo -e "${CYAN}Service Status:${NC}"
    echo -e "${CYAN}──────────────────────────────────────────────────────${NC}"
    printf "%-15s %-10s %-10s %-15s\n" "SERVICE" "STATUS" "PID" "PORT"
    echo -e "${CYAN}──────────────────────────────────────────────────────${NC}"
    
    for service in "${!SERVICES[@]}"; do
        local name="${SERVICES[$service]}"
        local port="${PORTS[$service]}"
        
        # For mobile, show the actual ports from the log
        if [ "$service" = "mobile" ] && is_running "$service"; then
            local metro_port
            metro_port=$(grep -oP 'http://localhost:\K\d+' "$LOG_DIR/mobile.log" 2>/dev/null | head -1)
            [ -n "$metro_port" ] || metro_port="8081"
            # Check if webpack is also running (--web mode)
            local web_port
            web_port=$(grep -oP 'port \K\d+' "$LOG_DIR/mobile.log" 2>/dev/null | head -1)
            if [ -n "$web_port" ] && [ "$web_port" != "$metro_port" ]; then
                port="$metro_port (Go), $web_port (Web)"
            else
                port="$metro_port"
            fi
        fi
        
        local status=""
        local pid="-"
        
        if is_running "$service"; then
            status="${GREEN}Running${NC}"
            pid=$(get_pid "$service")
        else
            status="${RED}Stopped${NC}"
        fi
        
        printf "%-15s %-20b %-10s %-15s\n" "$name" "$status" "$pid" "$port"
    done
    
    echo -e "${CYAN}──────────────────────────────────────────────────────${NC}"
}

show_logs() {
    local service=$1
    local log_file="$LOG_DIR/$service.log"
    
    if [ -f "$log_file" ]; then
        log_info "Showing logs for ${SERVICES[$service]}:"
        tail -50 "$log_file"
    else
        log_warn "No log file found for $service"
    fi
}

clean_logs() {
    log_info "Cleaning log files..."
    rm -rf "$LOG_DIR"/*
    log_success "Logs cleaned"
}

clean_pids() {
    log_info "Cleaning PID files..."
    rm -rf "$PID_DIR"/*
    log_success "PID files cleaned"
}

clean_all() {
    clean_logs
    clean_pids
}

# ============================================================
# Main Menu
# ============================================================

show_help() {
    echo -e "${CYAN}D-HRS Service Manager${NC}"
    echo -e "${CYAN}链聘通 (ChainHire)${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <command> [service]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}start${NC}    <service|all>  Start a service or all services"
    echo -e "  ${GREEN}stop${NC}     <service|all>  Stop a service or all services"
    echo -e "  ${GREEN}restart${NC}  <service|all>  Restart a service or all services"
    echo -e "  ${GREEN}status${NC}                  Show status of all services"
    echo -e "  ${GREEN}logs${NC}     <service>      Show logs for a service"
    echo -e "  ${GREEN}clean${NC}    <logs|pids|all>Clean log/pid files"
    echo -e "  ${GREEN}help${NC}                    Show this help message"
    echo ""
    echo -e "${YELLOW}Services:${NC}"
    echo -e "  ${BLUE}bitcoin${NC}   - Bitcoin Core (RPC: 8332)"
    echo -e "  ${BLUE}lnd${NC}       - LND Lightning (REST: 10009)"
    echo -e "  ${BLUE}hardhat${NC}   - Hardhat Node (RPC: 8545)"
    echo -e "  ${BLUE}backend${NC}   - Backend API (Port: 3001)"
    echo -e "  ${BLUE}webui${NC}     - Web UI (Port: 8001)"
    echo -e "  ${BLUE}mobile${NC}    - Mobile App (Metro: 8081, Web: 19006)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 start all          # Start all services"
    echo "  $0 start backend      # Start only backend"
    echo "  $0 restart webui      # Restart Web UI"
    echo "  $0 stop all           # Stop all services"
    echo "  $0 status             # Show service status"
    echo "  $0 logs backend       # Show backend logs"
}

# ============================================================
# Command Parser
# ============================================================

case "${1:-help}" in
    start)
        case "${2:-}" in
            all)      start_all ;;
            bitcoin)  start_bitcoin ;;
            lnd)      start_lnd ;;
            hardhat)  start_hardhat ;;
            backend)  start_backend ;;
            webui)    start_webui ;;
            mobile)   start_mobile ;;
            "")       log_error "Please specify a service or 'all'"; show_help ;;
            *)        log_error "Unknown service: $2"; show_help ;;
        esac
        ;;
    stop)
        case "${2:-}" in
            all)      stop_all ;;
            bitcoin)  stop_bitcoin ;;
            lnd)      stop_lnd ;;
            hardhat)  stop_hardhat ;;
            backend)  stop_backend ;;
            webui)    stop_webui ;;
            mobile)   stop_mobile ;;
            "")       log_error "Please specify a service or 'all'"; show_help ;;
            *)        log_error "Unknown service: $2"; show_help ;;
        esac
        ;;
    restart)
        case "${2:-}" in
            all)      restart_all ;;
            bitcoin)  restart_bitcoin ;;
            lnd)      restart_lnd ;;
            hardhat)  restart_hardhat ;;
            backend)  restart_backend ;;
            webui)    restart_webui ;;
            mobile)   restart_mobile ;;
            "")       log_error "Please specify a service or 'all'"; show_help ;;
            *)        log_error "Unknown service: $2"; show_help ;;
        esac
        ;;
    status)
        show_status
        ;;
    logs)
        case "${2:-}" in
            bitcoin|lnd|hardhat|backend|webui|mobile)
                show_logs "$2" ;;
            "")       log_error "Please specify a service"; show_help ;;
            *)        log_error "Unknown service: $2"; show_help ;;
        esac
        ;;
    clean)
        case "${2:-}" in
            logs)     clean_logs ;;
            pids)     clean_pids ;;
            all)      clean_all ;;
            "")       log_error "Please specify 'logs', 'pids', or 'all'"; show_help ;;
            *)        log_error "Unknown option: $2"; show_help ;;
        esac
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
