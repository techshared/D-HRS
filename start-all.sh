#!/bin/bash

echo "🚀 Starting D-HRS (链聘通) All Services..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Bitcoin Core
echo -e "${YELLOW}[1/5] Checking Bitcoin Core...${NC}"
if pgrep -x "bitcoind" > /dev/null; then
    echo -e "${GREEN}✓ Bitcoin Core is running${NC}"
else
    echo -e "${RED}✗ Bitcoin Core is NOT running${NC}"
    echo "  Start it with: bitcoind -zmqpubrawblock=tcp://127.0.0.1:28332 -zmqpubrawtx=tcp://127.0.0.1:28333 -daemon"
fi

# Check LND
echo -e "${YELLOW}[2/5] Checking LND...${NC}"
if pgrep -x "lnd" > /dev/null; then
    echo -e "${GREEN}✓ LND is running${NC}"
else
    echo -e "${RED}✗ LND is NOT running${NC}"
    echo "  Start it with: lnd --bitcoin.mainnet --nosebackup --bitcoin.node=bitcoind --bitcoind.rpcuser=btc_rpc_user --bitcoind.rpcpass=StrongPassw0rd_123"
fi

# Start Hardhat
echo -e "${YELLOW}[3/5] Starting Hardhat node...${NC}"
if pgrep -f "hardhat node" > /dev/null; then
    echo -e "${GREEN}✓ Hardhat is already running${NC}"
else
    cd /mnt/c/Projects/AI/Decentralized/D-HRS/contracts
    nohup npx hardhat node --hostname 127.0.0.1 --port 8545 > /tmp/hardhat.log 2>&1 &
    sleep 3
    if pgrep -f "hardhat node" > /dev/null; then
        echo -e "${GREEN}✓ Hardhat started on port 8545${NC}"
    else
        echo -e "${RED}✗ Failed to start Hardhat${NC}"
    fi
fi

# Start Backend
echo -e "${YELLOW}[4/5] Starting Backend API...${NC}"
pkill -f "node src/index.js" 2>/dev/null
sleep 1
cd /mnt/c/Projects/AI/Decentralized/D-HRS/backend
nohup node src/index.js > /tmp/backend.log 2>&1 &
sleep 2
if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API running on port 3001${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo "  Check log: tail -f /tmp/backend.log"
fi

# Start Web UI
echo -e "${YELLOW}[5/5] Starting Web UI...${NC}"
pkill -f "python3 -m http.server 8001" 2>/dev/null
sleep 1
cd /mnt/c/Projects/AI/Decentralized/D-HRS
nohup python3 -m http.server 8001 > /tmp/webui.log 2>&1 &
sleep 1
if curl -s -I http://localhost:8001/index.html > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Web UI running on port 8001${NC}"
else
    echo -e "${RED}✗ Web UI failed to start${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All Services Started!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Access Points:"
echo "  🌐 Web UI:           http://localhost:8001/index.html"
echo "  🔌 Backend API:       http://localhost:3001/api/v1/health"
echo "  ⛓️  Hardhat RPC:      http://127.0.0.1:8545"
echo "  ₿  Bitcoin RPC:       http://127.0.0.1:8332"
echo "  ⚡ LND REST:          https://127.0.0.1:10009"
echo ""
echo "Test Commands:"
echo "  curl http://localhost:3001/api/v1/health"
echo "  curl http://localhost:3001/api/v1/bitcoin/info"
echo ""
