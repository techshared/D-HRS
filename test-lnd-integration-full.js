const LNDRestClient = require('./lnd-rest-client');
const LNDGrpcClient = require('./lnd-grpc-client');

// 配置
const config = {
    // REST客户端配置（推荐，axios已安装）
    rest: {
        baseUrl: 'https://127.0.0.1:8080',
        macaroonPath: '/home/cste/.lnd/data/chain/bitcoin/mainnet/admin.macaroon',
        tlsCertPath: '/home/cste/.lnd/tls.cert'
    },
    // gRPC客户端配置（需要@grpc/grpc-js）
    grpc: {
        host: '127.0.0.1:10009',
        macaroonPath: '/home/cste/.lnd/data/chain/bitcoin/mainnet/admin.macaroon',
        tlsCertPath: '/home/cste/.lnd/tls.cert'
    }
};

// 测试REST集成
async function testRestIntegration() {
    console.log('\n=== 测试LND REST集成（方案B）===\n');
    
    try {
        const client = new LNDRestClient(config.rest);
        
        // 1. 获取节点信息
        console.log('1. 获取节点信息...');
        const info = await client.getInfo();
        console.log('✅ 节点ID:', info.identity_pubkey);
        console.log('   别名:', info.alias);
        console.log('   同步到链:', info.synced_to_chain);
        console.log('   区块高度:', info.block_height);
        
        // 2. 获取余额
        console.log('\n2. 获取余额...');
        const balance = await client.walletBalance();
        console.log('✅ 链上余额:', balance.total_balance, 'satoshis');
        console.log('   通道余额:', balance.channel_balance, 'satoshis');
        
        // 3. 生成新地址
        console.log('\n3. 生成新地址...');
        const addr = await client.newAddress('p2wkh');
        console.log('✅ 新地址:', addr.address);
        
        // 4. 列出通道
        console.log('\n4. 列出通道...');
        const channels = await client.listChannels();
        console.log('✅ 通道数量:', channels.channels?.length || 0);
        
        console.log('\n✅ LND REST集成测试通过！\n');
        return true;
    } catch (error) {
        console.error('\n❌ REST集成测试失败:', error.message);
        return false;
    }
}

// 测试gRPC集成（如果依赖已安装）
async function testGrpcIntegration() {
    console.log('\n=== 测试LND gRPC集成（方案B）===\n');
    
    try {
        // 检查依赖
        require('@grpc/grpc-js');
        require('@grpc/proto-loader');
        
        const client = new LNDGrpcClient(config.grpc);
        
        // 1. 获取节点信息
        console.log('1. 获取节点信息...');
        const info = await client.getInfo();
        console.log('✅ 节点ID:', info.identity_pubkey);
        console.log('   别名:', info.alias);
        console.log('   同步到链:', info.synced_to_chain);
        
        // 2. 生成新地址
        console.log('\n2. 生成新地址...');
        const addr = await client.newAddress('p2wkh');
        console.log('✅ 新地址:', addr.address);
        
        console.log('\n✅ LND gRPC集成测试通过！\n');
        return true;
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log('⚠️ gRPC依赖未安装，跳过gRPC测试');
            console.log('   安装命令: cd /mnt/c/Projects/AI/Decentralized/D-HRS && npm install @grpc/grpc-js @grpc/proto-loader\n');
        } else {
            console.error('\n❌ gRPC集成测试失败:', error.message);
        }
        return false;
    }
}

// 主函数
async function main() {
    console.log('=== D-HRS LND集成测试（方案B）===');
    console.log('时间:', new Date().toLocaleString());
    console.log('LND版本: v0.20.1-beta');
    console.log('节点ID: 03e9e769993dc642d80ddae0e4ba98977bdefa998a9a32529d91337cd13c6d7ff1\n');
    
    // 测试REST集成（推荐）
    await testRestIntegration();
    
    // 测试gRPC集成（可选）
    await testGrpcIntegration();
    
    console.log('=== 测试完成 ===');
}

// 执行
main().catch(console.error);
