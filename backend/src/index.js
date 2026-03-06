const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// In-memory storage (replace with database in production)
const employees = new Map();
const credentials = new Map();
const payrollRuns = new Map();
const proposals = new Map();

// Contract addresses (from local deployment)
const CONTRACT_ADDRESSES = {
  employeeRegistry: process.env.EMPLOYEE_REGISTRY_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  credentialRegistry: process.env.CREDENTIAL_REGISTRY_ADDRESS || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  payrollExecutor: process.env.PAYROLL_EXECUTOR_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  benefitsNFT: process.env.BENEFITS_NFT_ADDRESS || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  hrGovernance: process.env.HR_GOVERNANCE_ADDRESS || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  didRegistry: process.env.DID_REGISTRY_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  hrToken: process.env.HR_TOKEN_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
};

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get contract addresses
app.get('/api/v1/contracts', (req, res) => {
  res.json({ success: true, data: CONTRACT_ADDRESSES });
});

// Employee endpoints
app.post('/api/v1/employees', (req, res) => {
  try {
    const { wallet_address, did, personal_info_hash, role, department, salary } = req.body;
    
    if (!wallet_address || !did || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const employee = {
      did,
      wallet_address,
      personal_info_hash,
      role,
      department,
      salary,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    employees.set(did, employee);

    logger.info('Employee registered', { did, role });

    res.json({
      success: true,
      data: {
        did,
        transaction_hash: '0x' + Math.random().toString(16).slice(2),
        status: 'confirmed'
      }
    });
  } catch (error) {
    logger.error('Error registering employee', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/v1/employees/:did', (req, res) => {
  const { did } = req.params;
  const employee = employees.get(did);

  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }

  res.json({ success: true, data: employee });
});

app.get('/api/v1/employees', (req, res) => {
  const employeeList = Array.from(employees.values());
  res.json({ success: true, data: { employees: employeeList } });
});

app.patch('/api/v1/employees/:did', (req, res) => {
  const { did } = req.params;
  const employee = employees.get(did);

  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }

  const { role, department, salary } = req.body;
  if (role) employee.role = role;
  if (department) employee.department = department;
  if (salary) employee.salary = salary;
  employee.updated_at = new Date().toISOString();

  employees.set(did, employee);

  logger.info('Employee updated', { did });

  res.json({
    success: true,
    data: {
      did,
      updated_fields: Object.keys(req.body)
    }
  });
});

// Credential endpoints
app.post('/api/v1/credentials/issue', (req, res) => {
  try {
    const { subject_did, credential_type, data, expiry_days, metadata_uri } = req.body;

    if (!subject_did || !credential_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const credential = {
      id: '0x' + Math.random().toString(16).slice(2),
      subject_did,
      credential_type,
      data_hash: data ? require('crypto').createHash('sha256').update(JSON.stringify(data)).digest('hex') : null,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (expiry_days || 365) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'valid'
    };

    if (!credentials.has(subject_did)) {
      credentials.set(subject_did, []);
    }
    credentials.get(subject_did).push(credential);

    logger.info('Credential issued', { subject_did, credential_type });

    res.json({
      success: true,
      data: {
        credential_id: credential.id,
        issued_at: credential.issued_at,
        expires_at: credential.expires_at
      }
    });
  } catch (error) {
    logger.error('Error issuing credential', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/v1/credentials/verify', (req, res) => {
  const { subject_did, credential_type } = req.body;
  const creds = credentials.get(subject_did);

  if (!creds) {
    return res.json({ success: true, data: { is_valid: false } });
  }

  const credential = creds.find(c => c.credential_type === credential_type);
  const isValid = credential && credential.status === 'valid' && new Date(credential.expires_at) > new Date();

  res.json({
    success: true,
    data: {
      is_valid: isValid,
      credential: isValid ? {
        issued_at: credential.issued_at,
        expires_at: credential.expires_at
      } : null
    }
  });
});

app.get('/api/v1/credentials/:did', (req, res) => {
  const { did } = req.params;
  const creds = credentials.get(did) || [];

  res.json({
    success: true,
    data: { credentials: creds }
  });
});

// Payroll endpoints
app.post('/api/v1/payroll/run', (req, res) => {
  const { period_start, period_end, payments } = req.body;

  if (!period_start || !period_end || !payments) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const runId = payrollRuns.size;
  const totalAmount = payments.reduce((sum, p) => sum + (p.net_amount || 0), 0);

  const payrollRun = {
    id: runId,
    period_start,
    period_end,
    total_amount: totalAmount,
    status: 'pending_approval',
    required_approvals: 2,
    current_approvals: 0,
    payments,
    created_at: new Date().toISOString()
  };

  payrollRuns.set(runId, payrollRun);

  logger.info('Payroll run created', { runId, totalAmount });

  res.json({
    success: true,
    data: {
      run_id: runId,
      total_amount: totalAmount,
      status: 'pending_approval',
      required_approvals: 2,
      current_approvals: 0
    }
  });
});

app.post('/api/v1/payroll/run/:runId/approve', (req, res) => {
  const { runId } = req.params;
  const run = payrollRuns.get(parseInt(runId));

  if (!run) {
    return res.status(404).json({ success: false, error: 'Payroll run not found' });
  }

  if (run.status !== 'pending_approval') {
    return res.status(400).json({ success: false, error: 'Payroll not pending approval' });
  }

  run.current_approvals += 1;
  if (run.current_approvals >= run.required_approvals) {
    run.status = 'approved';
  }

  payrollRuns.set(parseInt(runId), run);

  logger.info('Payroll approved', { runId, approvals: run.current_approvals });

  res.json({
    success: true,
    data: {
      run_id: runId,
      approval_count: run.current_approvals,
      required_approvals: run.required_approvals,
      status: run.status
    }
  });
});

app.get('/api/v1/payroll/history', (req, res) => {
  const runs = Array.from(payrollRuns.values());
  res.json({ success: true, data: { payroll_runs: runs } });
});

// Governance endpoints
app.post('/api/v1/governance/proposals', (req, res) => {
  const { title, description, category, quorum_percentage } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const proposalId = proposals.size;
  const proposal = {
    id: proposalId,
    title,
    description,
    category,
    proposer: req.body.proposer || '0x0000000000000000000000000000000000000000',
    status: 'active',
    for_votes: 0,
    against_votes: 0,
    abstain_votes: 0,
    quorum_required: quorum_percentage || 50,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  proposals.set(proposalId, proposal);

  logger.info('Proposal created', { proposalId, title });

  res.json({
    success: true,
    data: {
      proposal_id: proposalId,
      start_time: proposal.start_time,
      end_time: proposal.end_time,
      status: 'active'
    }
  });
});

app.post('/api/v1/governance/proposals/:proposalId/vote', (req, res) => {
  const { proposalId } = req.params;
  const { support, weight, reason } = req.body;
  const proposal = proposals.get(parseInt(proposalId));

  if (!proposal) {
    return res.status(404).json({ success: false, error: 'Proposal not found' });
  }

  if (support === true) {
    proposal.for_votes += weight || 1;
  } else if (support === false) {
    proposal.against_votes += weight || 1;
  } else {
    proposal.abstain_votes += weight || 1;
  }

  proposals.set(parseInt(proposalId), proposal);

  logger.info('Vote cast', { proposalId, support, weight });

  res.json({
    success: true,
    data: {
      proposal_id: proposalId,
      vote: support ? 'for' : 'against',
      weight: weight || 1,
      for_votes: proposal.for_votes,
      against_votes: proposal.against_votes,
      abstain_votes: proposal.abstain_votes
    }
  });
});

app.get('/api/v1/governance/proposals', (req, res) => {
  const proposalList = Array.from(proposals.values());
  res.json({ success: true, data: { proposals: proposalList } });
});

// WebSocket for real-time events
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

// Broadcast function for events
function broadcastEvent(eventType, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: eventType, data }));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = { app, broadcastEvent };
