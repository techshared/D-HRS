const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

// LND client
const LND = require('./lnd-client');
const lnd = new LND();

// Bitcoin router
const bitcoinRouter = require('../routes/bitcoin');

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// App
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Bitcoin routes
app.use('/api/v1/bitcoin', bitcoinRouter);

// In-memory storage
const employees = new Map();
const credentials = new Map();
const payrollRuns = new Map();
const proposals = new Map();

// Contract addresses
const CONTRACT_ADDRESSES = {
  employeeRegistry: process.env.EMPLOYEE_REGISTRY_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  credentialRegistry: process.env.CREDENTIAL_REGISTRY_ADDRESS || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  payrollExecutor: process.env.PAYROLL_EXECUTOR_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  benefitsNFT: process.env.BENEFITS_NFT_ADDRESS || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  hrGovernance: process.env.HR_GOVERNANCE_ADDRESS || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  didRegistry: process.env.DID_REGISTRY_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  hrToken: process.env.HR_TOKEN_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
};

// Health and basic routes
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/contracts', (req, res) => {
  res.json({ success: true, data: CONTRACT_ADDRESSES });
});

// Start server
const WebSocket = require('ws');
const server = app.listen(PORT, () => {
  logger.info(`D-HRS API Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

function broadcastEvent(eventType, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: eventType, data }));
    }
  });
}

module.exports = { app, broadcastEvent };
