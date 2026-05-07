#!/bin/bash
cd /mnt/c/Projects/AI/Decentralized/D-HRS/backend
nohup node src/index.js > /tmp/dhrs.log 2>&1 &
echo $! > /tmp/dhrs.pid
echo "D-HRS已启动，PID: $(cat /tmp/dhrs.pid)"
sleep 2
if ps -p $(cat /tmp/dhrs.pid) > /dev/null; then
  echo "✅ D-HRS运行正常"
  curl -s http://localhost:3001/api/v1/health | jq .
else
  echo "❌ D-HRS启动失败，检查 /tmp/dhrs.log"
fi
