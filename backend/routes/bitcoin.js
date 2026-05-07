const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Bitcoin Core RPC client
class BitcoinRPC {
  constructor(config) {
    this.host = config.rpc_host || '127.0.0.1';
    this.port = config.rpc_port || 8332;
    this.user = config.rpc_user;
    this.pass = config.rpc_password;
  }

  async call(method, params = []) {
    const auth = Buffer.from(`${this.user}:${this.pass}`).toString('base64');
    const url = `http://${this.host}:${this.port}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        method: method,
        params: params,
        id: Date.now()
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`Bitcoin RPC Error: ${data.error.message}`);
    return data.result;
  }

  async getNewAddress(label = 'd-hrs') {
    return await this.call('getnewaddress', [label, 'bech32']);
  }

  async getBalance() {
    return await this.call('getbalance');
  }

  async sendToAddress(address, amount, comment = '') {
    return await this.call('sendtoaddress', [address, amount, comment]);
  }

  async getTransaction(txid) {
    return await this.call('gettransaction', [txid]);
  }

  async validateAddress(address) {
    return await this.call('validateaddress', [address]);
  }
}

// LND client (Lightning Network)
class LNDClient {
  constructor(config) {
    this.host = config.host || '127.0.0.1';
    this.port = config.port || 10009;
    this.macaroonPath = config.macaroon_path;
    this.tlsCertPath = config.tls_cert_path;
  }

  async call(method, params = {}) {
    // LND uses gRPC - requires lncli or grpc library
    const macaroon = this.macaroonPath ? `--macaroonpath=${this.macaroonPath}` : '';
    const tlsCert = this.tlsCertPath ? `--tlscertpath=${this.tlsCertPath}` : '';
    
    return new Promise((resolve, reject) => {
      const cmd = spawn('lncli', [
        '--network=mainnet',
        `--rpcserver=${this.host}:${this.port}`,
        macaroon,
        tlsCert,
        method,
        JSON.stringify(params)
      ]);
      
      let output = '';
      let error = '';
      
      cmd.stdout.on('data', (data) => output += data.toString());
      cmd.stderr.on('data', (data) => error += data.toString());
      
      cmd.on('close', (code) => {
        if (code !== 0) reject(new Error(error || `lncli exited with code ${code}`));
        else resolve(JSON.parse(output));
      });
    });
  }

  async createInvoice(amount, memo = 'D-HRS Payment') {
    const result = await this.call('addinvoice', {
      value: amount,
      memo: memo
    });
    return {
      paymentRequest: result.payment_request,
      rHash: result.r_hash,
      amount: amount
    };
  }

  async payInvoice(paymentRequest) {
    return await this.call('payinvoice', {
      payment_request: paymentRequest,
      force: true
    });
  }

  async decodeInvoice(paymentRequest) {
    return await this.call('decodeinvoice', { payment_request: paymentRequest });
  }

  async getInfo() {
    return await this.call('getinfo');
  }
}

// Core Lightning (c-lightning) client
class CLightningClient {
  constructor(config) {
    this.rpcPath = config.rpc_path || '~/.lightning/bitcoin/lightning-rpc';
    this.host = config.host || '127.0.0.1';
    this.port = config.port || 9736;
  }

  async call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const args = ['--rpc-file', this.rpcPath, method];
      
      if (typeof params === 'object' && params !== null) {
        Object.entries(params).forEach(([key, value]) => {
          args.push(`${key}=${value}`);
        });
      }
      
      const cmd = spawn('lightning-cli', args);
      
      let output = '';
      let error = '';
      
      cmd.stdout.on('data', (data) => output += data.toString());
      cmd.stderr.on('data', (data) => error += data.toString());
      
      cmd.on('close', (code) => {
        if (code !== 0) reject(new Error(error || `lightning-cli exited with code ${code}`));
        else {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            resolve(output.trim());
          }
        }
      });
    });
  }

  async createInvoice(amount, description = 'D-HRS Payment') {
    const result = await this.call('invoice', {
      msatoshi: amount * 1000,
      label: `d-hrs-${Date.now()}`,
      description: description
    });
    return {
      paymentRequest: result.bolt11,
      paymentHash: result.payment_hash,
      amount: amount
    };
  }

  async payInvoice(bolt11) {
    return await this.call('pay', { bolt11: bolt11 });
  }

  async decodeInvoice(bolt11) {
    return await this.call('decodepay', { bolt11: bolt11 });
  }

  async getInfo() {
    return await this.call('getinfo');
  }

  async newAddress() {
    return await this.call('newaddr', { addresstype: 'bech32' });
  }
}

// Load configuration
let config = {};
const configPath = path.join(__dirname, '../../config/bitcoin-config.json');
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('Bitcoin config not found, using defaults');
}

// Initialize clients
const bitcoinRPC = new BitcoinRPC(config.bitcoin || {});
let lightningClient = null;

// Initialize Lightning client based on config
if (config.lnd && fs.existsSync(config.lnd.macaroon_path || '')) {
  lightningClient = new LNDClient(config.lnd);
} else if (config.clightning) {
  lightningClient = new CLightningClient(config.clightning);
}

// API Routes

// Get Bitcoin balance
router.get('/balance', async (req, res) => {
  try {
    const balance = await bitcoinRPC.getBalance();
    res.json({ success: true, balance: balance, currency: 'BTC' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new Bitcoin address
router.get('/address/new', async (req, res) => {
  try {
    const label = req.query.label || 'd-hrs';
    const address = await bitcoinRPC.getNewAddress(label);
    res.json({ success: true, address: address, network: 'mainnet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate Bitcoin address
router.post('/address/validate', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    
    const result = await bitcoinRPC.validateAddress(address);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Bitcoin payment (on-chain)
router.post('/send', async (req, res) => {
  try {
    const { address, amount, comment } = req.body;
    if (!address || !amount) {
      return res.status(400).json({ error: 'Address and amount required' });
    }
    
    const txid = await bitcoinRPC.sendToAddress(address, amount, comment || 'D-HRS Payment');
    res.json({ success: true, txid: txid, amount: amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction details
router.get('/transaction/:txid', async (req, res) => {
  try {
    const { txid } = req.params;
    const tx = await bitcoinRPC.getTransaction(txid);
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lightning Network - Create invoice
router.post('/lightning/invoice', async (req, res) => {
  try {
    if (!lightningClient) {
      return res.status(503).json({ error: 'Lightning service not available' });
    }
    
    const { amount, memo } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount required' });
    
    const invoice = await lightningClient.createInvoice(amount, memo || 'D-HRS Payment');
    res.json({ success: true, ...invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lightning Network - Pay invoice
router.post('/lightning/pay', async (req, res) => {
  try {
    if (!lightningClient) {
      return res.status(503).json({ error: 'Lightning service not available' });
    }
    
    const { paymentRequest } = req.body;
    if (!paymentRequest) return res.status(400).json({ error: 'Payment request required' });
    
    const result = await lightningClient.payInvoice(paymentRequest);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lightning Network - Decode invoice
router.post('/lightning/decode', async (req, res) => {
  try {
    if (!lightningClient) {
      return res.status(503).json({ error: 'Lightning service not available' });
    }
    
    const { paymentRequest } = req.body;
    if (!paymentRequest) return res.status(400).json({ error: 'Payment request required' });
    
    const decoded = await lightningClient.decodeInvoice(paymentRequest);
    res.json({ success: true, ...decoded });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Lightning node info
router.get('/lightning/info', async (req, res) => {
  try {
    if (!lightningClient) {
      return res.status(503).json({ error: 'Lightning service not available' });
    }
    
    const info = await lightningClient.getInfo();
    res.json({ success: true, ...info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get new Lightning address (c-lightning)
router.get('/lightning/address/new', async (req, res) => {
  try {
    if (!lightningClient || !(lightningClient instanceof CLightningClient)) {
      return res.status(503).json({ error: 'c-lightning service not available' });
    }
    
    const result = await lightningClient.newAddress();
    res.json({ success: true, address: result.bech32 || result.address, network: 'mainnet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Bitcoin network info
router.get('/info', async (req, res) => {
  try {
    const info = await bitcoinRPC.call('getblockchaininfo');
    res.json({
      success: true,
      network: info.chain,
      blocks: info.blocks,
      headers: info.headers,
      difficulty: info.difficulty,
      lightning: lightningClient ? 'connected' : 'not available'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for ZMQ (Bitcoin transaction notifications)
router.post('/zmq/webhook', async (req, res) => {
  try {
    const { type, txid, blockhash } = req.body;
    console.log(`ZMQ Notification: ${type} - TXID: ${txid || 'N/A'}`);
    
    // Process transaction notification
    if (type === 'rawtx' && txid) {
      const tx = await bitcoinRPC.getTransaction(txid);
      // Emit event or save to database
      console.log('Transaction processed:', tx);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.bitcoinRPC = bitcoinRPC;
module.exports.lightningClient = lightningClient;
