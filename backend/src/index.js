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

// JWT Authentication middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dhrs-jwt-secret-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Compliance middleware
const ComplianceMiddleware = require('./middleware/compliance');
const { encrypt, hash, decrypt, maskIdNumber, maskSalary } = require('./utils/crypto');
const { moderateEmployeeData, moderateProposal } = require('./utils/moderation');

// In-memory storage (replace with database in production)
const employees = new Map();
const credentials = new Map();
const payrollRuns = new Map();
const proposals = new Map();
const auditLog = [];

// Contract addresses (from local deployment)
const CONTRACT_ADDRESSES = {
  employeeRegistry: process.env.EMPLOYEE_REGISTRY_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  credentialRegistry: process.env.CREDENTIAL_REGISTRY_ADDRESS || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  payrollExecutor: process.env.PAYROLL_EXECUTOR_ADDRESS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  benefitsNFT: process.env.BENEFITS_NFT_ADDRESS || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  hrGovernance: process.env.HR_GOVERNANCE_ADDRESS || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  didRegistry: process.env.DID_REGISTRY_ADDRESS || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
};

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// Authentication endpoints
app.get('/api/v1/auth/challenge', (req, res) => {
  try {
    const challenge = require('crypto').randomBytes(32).toString('hex');
    res.json({ success: true, data: { challenge } });
  } catch (error) {
    logger.error('Auth challenge error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/v1/auth/connect', async (req, res) => {
  try {
    const { wallet_address, kyc_token } = req.body;
    if (!wallet_address) {
      return res.status(400).json({ success: false, error: 'wallet_address required' });
    }
    // Simple token-based auth (KYC verified separately via /compliance/kyc/initiate)
    const token = jwt.sign(
      { wallet_address, authenticated: true, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET || 'dhrs-jwt-secret-change-in-production',
      { expiresIn: '24h' }
    );
    res.json({ success: true, data: { wallet_address, token, authenticated: true } });
  } catch (error) {
    logger.error('Auth connect error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Employee salary adjustment
app.post('/api/v1/employees/:did/salary', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), async (req, res) => {
  try {
    const { did } = req.params;
    const { salary } = req.body;
    if (!salary) {
      return res.status(400).json({ success: false, error: 'Missing salary' });
    }
    const employee = employees.get(did);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    employee.salary = salary;
    employee.updated_at = new Date().toISOString();
    res.json({ success: true, data: { did, salary, status: 'updated' } });
  } catch (error) {
    logger.error('Salary adjustment error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Employee transfer
app.post('/api/v1/employees/:did/transfer', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
  try {
    const { did } = req.params;
    const { new_department, new_position } = req.body;
    const employee = employees.get(did);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    if (new_department) employee.department = new_department;
    if (new_position) employee.position = new_position;
    employee.updated_at = new Date().toISOString();
    res.json({ success: true, data: { did, transfer: 'completed' } });
  } catch (error) {
    logger.error('Transfer error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Employee promotion
app.post('/api/v1/employees/:did/promotion', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), async (req, res) => {
  try {
    const { did } = req.params;
    const { new_position, salary_increase } = req.body;
    const employee = employees.get(did);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    if (new_position) employee.position = new_position;
    if (salary_increase) employee.salary = (employee.salary || 0) + salary_increase;
    employee.updated_at = new Date().toISOString();
    res.json({ success: true, data: { did, promotion: 'completed' } });
  } catch (error) {
    logger.error('Promotion error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Employee layoff
app.post('/api/v1/employees/:did/layoff', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), async (req, res) => {
  try {
    const { did } = req.params;
    const employee = employees.get(did);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    employee.status = 'laid_off';
    employee.updated_at = new Date().toISOString();
    res.json({ success: true, data: { did, layoff: 'completed' } });
  } catch (error) {
    logger.error('Layoff error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get contract addresses
app.get('/api/v1/contracts', (req, res) => {
  res.json({ success: true, data: CONTRACT_ADDRESSES });
});

// Compliance routes
const complianceRoutes = require('./routes/compliance');
app.use('/api/v1/compliance', complianceRoutes);

app.post('/api/v1/employees', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
  try {
    const { wallet_address, did, personal_info_hash, role, department, salary } = req.body;

    if (!wallet_address || !did || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 内容审核
    const moderation = moderateEmployeeData({ role, department, personalInfoHash: personal_info_hash });
    if (!moderation.pass) {
      return res.status(400).json({ success: false, error: 'Content moderation failed', issues: moderation.issues });
    }

    // 加密敏感字段
    const encryptedSalary = salary ? encrypt(String(salary)) : null;
    const hashedPII = personal_info_hash ? hash(personal_info_hash) : null;

    const employee = {
      did,
      wallet_address,
      personal_info_hash: hashedPII,
      role,
      department,
      salary_encrypted: encryptedSalary,
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

app.get('/api/v1/employees/:did', authenticateToken, (req, res) => {
  const { did } = req.params;
  const employee = employees.get(did);

  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }

  res.json({ success: true, data: employee });
});

app.get('/api/v1/employees', authenticateToken, (req, res) => {
  const employeeList = Array.from(employees.values());
  res.json({ success: true, data: { employees: employeeList } });
});

app.patch('/api/v1/employees/:did', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
  const { did } = req.params;
  const employee = employees.get(did);

  if (!employee) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }

  const { role, department, salary } = req.body;

  // 内容审核
  if (role || department) {
    const moderation = moderateEmployeeData({ role, department });
    if (!moderation.pass) {
      return res.status(400).json({ success: false, error: 'Content moderation failed', issues: moderation.issues });
    }
  }

  if (role) employee.role = role;
  if (department) employee.department = department;
  if (salary) employee.salary_encrypted = encrypt(String(salary));
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
app.post('/api/v1/credentials/issue', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
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

app.post('/api/v1/credentials/verify', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
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

app.get('/api/v1/credentials/:did', authenticateToken, (req, res) => {
  const { did } = req.params;
  const creds = credentials.get(did) || [];

  res.json({
    success: true,
    data: { credentials: creds }
  });
});

// Payroll endpoints
app.post('/api/v1/payroll/run', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
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

app.post('/api/v1/payroll/run/:runId/approve', authenticateToken, (req, res) => {
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

app.get('/api/v1/payroll/history', authenticateToken, (req, res) => {
  const runs = Array.from(payrollRuns.values());
  res.json({ success: true, data: { payroll_runs: runs } });
});

// Governance endpoints
app.post('/api/v1/governance/proposals', authenticateToken, ComplianceMiddleware.kycRequired(), ComplianceMiddleware.sanctionsScreen(), (req, res) => {
  try {
    const { title, description, category, quorum_percentage } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 内容审核
    const moderation = moderateProposal({ title, description });
    if (!moderation.pass) {
      return res.status(400).json({ success: false, error: 'Content moderation failed', issues: moderation.issues });
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
  } catch (error) {
    logger.error('Error creating proposal', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/v1/governance/proposals/:proposalId/vote', authenticateToken, (req, res) => {
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

app.get('/api/v1/governance/proposals', authenticateToken, (req, res) => {
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
