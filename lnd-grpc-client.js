const fs = require('fs');
const path = require('path');
const { LoadProto } = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

class LNDGrpcClient {
    constructor(options = {}) {
        // 默认配置
        this.host = options.host || '127.0.0.1:10009';
        this.macaroonPath = options.macaroonPath || path.join(process.env.HOME, '.lnd/data/chain/bitcoin/mainnet/admin.macaroon');
        this.tlsCertPath = options.tlsCertPath || path.join(process.env.HOME, '.lnd/tls.cert');
        
        // 读取凭证
        this.macaroon = options.macaroon || fs.readFileSync(this.macaroonPath).toString('hex');
        const tlsCert = fs.readFileSync(this.tlsCertPath);
        
        // 创建SSL凭证（使用macaroon作为SSL密码）
        this.credentials = grpc.credentials.createSsl(
            tlsCert,
            null,  // 私钥（不需要）
            null,  // 根证书（不需要）
            {
                'grpc.ssl_target_name_override': 'localhost',
                'grpc.default_authority': this.host
            }
        );
        
        // 加载proto文件
        const protoPath = path.join(__dirname, 'lnrpc/lightning.proto');
        if (!fs.existsSync(protoPath)) {
            throw new Error(`Proto file not found at ${protoPath}. Please run: wget -P lnrpc https://raw.githubusercontent.com/lightningnetwork/lnd/master/lnrpc/lightning.proto`);
        }
        
        const proto = LoadProto(protoPath);
        this.lightning = proto.lnrpc.Lightning;
        
        // 创建客户端
        this.client = new this.lightning(this.host, this.credentials);
        
        // 添加macaroon元数据
        this.metadata = new grpc.Metadata();
        this.metadata.add('macaroon', this.macaroon);
    }
    
    // 获取节点信息
    async getInfo() {
        return new Promise((resolve, reject) => {
            this.client.GetInfo({}, this.metadata, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }
    
    // 生成新地址
    async newAddress(type = 'p2wkh') {
        return new Promise((resolve, reject) => {
            const request = { type: type === 'p2wkh' ? 0 : 1 };
            this.client.NewAddress(request, this.metadata, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }
    
    // 添加发票
    async addInvoice(value, memo = '') {
        return new Promise((resolve, reject) => {
            const request = { value: value.toString(), memo: memo };
            this.client.AddInvoice(request, this.metadata, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }
    
    // 支付发票
    async payInvoice(paymentRequest) {
        return new Promise((resolve, reject) => {
            const request = { payment_request: paymentRequest };
            this.client.SendPaymentSync(request, this.metadata, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }
    
    // 列出通道
    async listChannels() {
        return new Promise((resolve, reject) => {
            this.client.ListChannels({}, this.metadata, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }
}

module.exports = LNDGrpcClient;
