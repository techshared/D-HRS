const { execSync } = require('child_process');
const fs = require('fs');

// LND RPC配置（方案B，已验证正常）
const LND_GRPC_HOST = '127.0.0.1:10009';
const MACAROON_PATH = '/home/cste/.lnd/data/chain/bitcoin/mainnet/admin.macaroon';
const TLS_CERT_PATH = '/home/cste/.lnd/tls.cert';

// 测试1：获取节点信息
function testLNDGetInfo() {
    try {
        // 使用lncli命令行（已验证正常）
        const result = execSync('/home/cste/bin/lncli getinfo').toString();
        const info = JSON.parse(result);
        console.log('✅ LND连接成功！');
        console.log('节点ID:', info.identity_pubkey);
        console.log('别名:', info.alias);
        console.log('同步到链:', info.synced_to_chain);
        console.log('区块高度:', info.block_height);
        return true;
    } catch (error) {
        console.error('❌ LND连接失败:', error.message);
        return false;
    }
}

// 测试2：生成新地址
function testLNDNewAddr() {
    try {
        const result = execSync('/home/cste/bin/lncli newaddress p2wkh').toString();
        const addr = JSON.parse(result);
        console.log('✅ 新地址生成成功:', addr.address);
        return true;
    } catch (error) {
        console.error('❌ 生成地址失败:', error.message);
        return false;
    }
}

// 执行测试
console.log('=== D-HRS集成验证（LND方案B）===\n');
testLNDGetInfo();
console.log('');
testLNDNewAddr();
