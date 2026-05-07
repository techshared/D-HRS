const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

class LNDRestClient {
    constructor(options = {}) {
        // 默认配置
        this.baseUrl = options.baseUrl || 'https://127.0.0.1:8080';
        this.macaroonPath = options.macaroonPath || path.join(process.env.HOME, '.lnd/data/chain/bitcoin/mainnet/admin.macaroon');
        this.tlsCertPath = options.tlsCertPath || path.join(process.env.HOME, '.lnd/tls.cert');
        
        // 读取macaroon (hex字符串)
        this.macaroon = options.macaroon || fs.readFileSync(this.macaroonPath).toString('hex');
        
        // 创建axios实例，配置HTTPS和macaroon
        const agent = new https.Agent({
            cert: fs.readFileSync(this.tlsCertPath)
        });
        
        this.client = axios.create({
            baseURL: this.baseUrl,
            httpsAgent: agent,
            headers: {
                'Grpc-Metadata-macaroon': this.macaroon
            }
        });
    }
    
    // 获取节点信息
    async getInfo() {
        try {
            const response = await this.client.get('/v1/getinfo');
            return response.data;
        } catch (error) {
            throw new Error(`GetInfo failed: ${error.response?.data || error.message}`);
        }
    }
    
    // 生成新地址
    async newAddress(type = 'p2wkh') {
        try {
            const typeNum = type === 'p2wkh' ? 0 : 1;
            const response = await this.client.post('/v1/newaddress', { type: typeNum });
            return response.data;
        } catch (error) {
            throw new Error(`NewAddress failed: ${error.response?.data || error.message}`);
        }
    }
    
    // 获取余额
    async walletBalance() {
        try {
            const response = await this.client.get('/v1/balance/blockchain');
            return response.data;
        } catch (error) {
            throw new Error(`WalletBalance failed: ${error.response?.data || error.message}`);
        }
    }
    
    // 列出通道
    async listChannels() {
        try {
            const response = await this.client.get('/v1/channels');
            return response.data;
        } catch (error) {
            throw new Error(`ListChannels failed: ${error.response?.data || error.message}`);
        }
    }
    
    // 添加发票
    async addInvoice(value, memo = '') {
        try {
            const response = await this.client.post('/v1/invoices', {
                value: value.toString(),
                memo: memo
            });
            return response.data;
        } catch (error) {
            throw new Error(`AddInvoice failed: ${error.response?.data || error.message}`);
        }
    }
}

module.exports = LNDRestClient;
