const { execSync } = require('child_process');
const fs = require('fs');

// Core Lightning RPC配置（方案D）
const LIGHTNING_CLI = '/home/cste/bin/lightning-cli';
const CLN_DIR = '/home/cste/.lightning';

// 测试1：获取节点信息
function testGetInfo() {
    try {
        const result = execSync('/home/cste/bin/lightning-cli --rpc-file=/home/cste/.lightning/bitcoin/lightning-rpc getinfo').toString();
        const info = JSON.parse(result);
        console.log('✅ Core Lightning连接成功！');
        console.log('节点ID:', info.id);
        console.log('别名:', info.alias);
        console.log('区块高度:', info.blockheight);
        console.log('网络:', info.network);
        return true;
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        return false;
    }
}

// 测试2：生成新地址
function testNewAddr() {
    try {
        const result = execSync('/home/cste/bin/lightning-cli --rpc-file=/home/cste/.lightning/bitcoin/lightning-rpc newaddr').toString();
        const addr = JSON.parse(result);
        console.log('✅ 新地址生成成功:', addr.bech32);
        return true;
    } catch (error) {
        console.error('❌ 生成地址失败:', error.message);
        return false;
    }
}

// 测试3：列出对等节点
function testListPeers() {
    try {
        const result = execSync('/home/cste/bin/lightning-cli --rpc-file=/home/cste/.lightning/bitcoin/lightning-rpc listpeers').toString();
        const data = JSON.parse(result);
        console.log('✅ 对等节点数量:', data.peers.length);
        return true;
    } catch (error) {
        console.error('❌ 列出节点失败:', error.message);
        return false;
    }
}

// 执行所有测试
console.log('=== D-HRS集成验证（Core Lightning方案D）===\n');
testGetInfo();
console.log('');
testNewAddr();
console.log('');
testListPeers();
