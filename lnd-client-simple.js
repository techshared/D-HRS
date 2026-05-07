const axios = require('axios');
const fs = require('fs');
const https = require('https');

class LNDClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'https://127.0.0.1:8080';
        this.macaroonPath = options.macaroonPath || require('path').join(process.env.HOME, '.lnd/data/chain/bitcoin/mainnet/admin.macaroon');
        this.tlsCertPath = options.tlsCertPath || require('path').join(process.env.HOME, '.lnd/tls.cert');
        
        // 读取macaroon
        this.macaroon = options.macaroon || fs.readFileSync(this.macaroonPath).toString('hex');
        
        // 创建axios实例（简化HTTPS配置）
        this.client = axios.create({
            baseURL: this.baseUrl,
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(this.tlsCertPath)
            }),
            headers: {
                'Grpc-Metadata-Macaroon': this.macaroon
            }
        });
    }
    
    async getInfo() {
        try {
            const res = await this.client.get('/v1/getinfo');
            return res.data;
        } catch (e) {
            throw new Error(`GetInfo failed: ${e.response?.data || e.message}`);
        }
    }
    
    async newAddress(type = 'p2wkh') {
        try {
            const typeNum = type === 'p2wkh' ? 0 : 1;
            const res = await this.client.post('/v1/newaddress', { type: typeNum });
            return res.data;
        } catch (e) {
            throw new Error(`NewAddress failed: ${e.response?.data || e.message}`);
        }
    }
    
    async getBalance() {
        try {
            const res = await this.client.get('/v1/balance/blockchain');
            return res.data;
        } catch (e) {
            throw new Error(`GetBalance failed: ${e.response?.data || e.message}`);
        }
    }
}

module.exports = LNDClient;
