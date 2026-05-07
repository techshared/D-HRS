const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// LND客户端（使用已验证成功的lncli命令）
class LND {
    constructor(config = {}) {
        // 默认配置
        this.lncliPath = config.lncliPath || '/home/cste/bin/lncli';
        this.lightningDir = config.lightningDir || '/home/cste/.lnd';
        this.macaroonPath = config.macaroonPath || path.join(this.lightningDir, 'data/chain/bitcoin/mainnet/admin.macaroon');
        this.tlsCertPath = config.tlsCertPath || path.join(this.lightningDir, 'tls.cert');
    }
    
    // 执行lncli命令
    _exec(command) {
        try {
            const result = execSync(`${this.lncliPath} --lnddir=${this.lightningDir} ${command}`).toString().trim();
            // 尝试解析JSON，如果失败则返回原始字符串
            try {
                return JSON.parse(result);
            } catch (e) {
                return result;
            }
        } catch (error) {
            throw new Error(`LND命令执行失败: ${error.message}\n命令: ${this.lncliPath} --lnddir=${this.lightningDir} ${command}`);
        }
    }
    
    // 获取节点信息（已验证成功）
    getInfo() {
        return this._exec('getinfo');
    }
    
    // 生成新地址（已验证成功）
    newAddress(type = 'p2wkh') {
        return this._exec(`newaddress ${type === 'p2wkh' ? 'p2wkh' : 'np2wkh'}`);
    }
    
    // 获取余额
    walletBalance() {
        return this._exec('walletbalance');
    }
    
    // 列出通道
    listChannels() {
        return this._exec('listchannels');
    }
    
    // 添加发票
    addInvoice(value, memo = '') {
        return this._exec(`addinvoice --amt=${value} --memo="${memo}"`);
    }
    
    // 支付发票
    payInvoice(paymentRequest) {
        return this._exec(`payinvoice --force ${paymentRequest}`);
    }
}

module.exports = LND;
