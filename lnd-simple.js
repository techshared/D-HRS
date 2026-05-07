const { execSync } = require('child_process');
const path = require('path');

// LND客户端（方案B，使用已验证成功的命令行方式）
class LND {
    constructor(options = {}) {
        this.lncliPath = options.lncliPath || '/home/cste/bin/lncli';
        this.lightningDir = options.lightningDir || '/home/cste/.lnd';
    }

    // 执行lncli命令
    _exec(command) {
        try {
            const result = execSync(`${this.lncliPath} --lightning-dir=${this.lightningDir} ${command}`).toString().trim();
            try {
                return JSON.parse(result);
            } catch (e) {
                return result;
            }
        } catch (error) {
            throw new Error(`LND命令执行失败: ${error.message}\n命令: ${this.lncliPath} --lightning-dir=${this.lightningDir} ${command}`);
        }
    }

    // 获取节点信息（已验证成功）
    getInfo() {
        return this._exec('getinfo');
    }

    // 生成新地址（已验证成功）
    newAddress(type = 'p2wkh') {
        return this._exec(`newaddress --type=${type}`);
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
}

module.exports = LND;
