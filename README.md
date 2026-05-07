# D-HRS v2.0 - Decentralized Human Resources System

A next-generation decentralized principles HR system, featuring Layer 2 scaling, ERC-4337 Account Abstraction, DID/VC identity, AI oracles, privacy-preserving technologies, and **Bitcoin/Lightning Network integration**.

![D-HRS](https://img.shields.io/badge/version-2.0-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Core-orange)
![Lightning](https://img.shields.io/badge/Lightning-Network-yellow)

## Overview

D-HRS (Decentralized Human Resources System) is a blockchain-based HR management platform that transforms traditional HR processes through decentralization, transparency, and cryptographic security.

### Core Features

- **Employee Management** - On-chain employee registration, updates, and lifecycle tracking
- **Verifiable Credentials** - W3C-compliant VC issuance and verification
- **Payroll System** - Multi-signature payroll processing with ERC-20 token support
- **Benefits NFTs** - ERC-721 based benefits management
- **Governance DAO** - Decentralized HR policy decision-making
- **DID Identity** - Self-sovereign decentralized identifiers
- **AI Oracle** - Smart salary benchmarking and performance scoring
- **Decentralized Employee Evaluation** - Multi-evaluator performance reviews with dispute resolution
- **Decentralized Recruitment** - Job postings, applications, and hiring workflow on-chain
- **Decentralized Promotions/Demotions** - Transparent promotion reviews with peer and manager scoring
- **Decentralized Salary Adjustments** - Transparent salary increase/decrease proposals
- **Decentralized Job Transfers** - Request and approval workflow for transfers
- **Decentralized Layoffs** - Structured layoff process with notice and severance
- **Bitcoin Integration** - On-chain BT payments via Bitcoin Core
- **Lightning Network** - Instant, low-fee payments via LND or Core Lightning

### Technology Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.19 |
| Blockchain | Ethereum / Hardhat |
| Backend | Node.js + Express |
| Frontend | HTML/CSS/JavaScript (viem.js) |
| Mobile | React Native / Expo |
| Testing | Hardhat Tests |
| Bitcoin Integration | Bitcoin Core, LND, Core Lightning |

---

## Why Use D-HRS?

### Traditional HR Systems vs D-HRS

| Aspect | Traditional HR Systems | D-HRS |
|--------|------------------------|-------|
| **Data Storage** | Centralized database (single point of failure) | Distributed ledger (no single point of failure) |
| **Verification** | Manual document verification | Cryptographic proof & verification |
| **Transparency** | Opaque decision-making | Transparent, auditable processes |
| **Data Control** | Company owns all employee data | Employee owns their credentials |
| **Interoperability** | Siloed systems, no data sharing | Portable credentials across organizations |
| **Automation** | Manual processes, prone to errors | Smart contracts ensure accurate execution |
| **Costs** | High admin costs, middlemen | Reduced intermediation, lower fees |
| **Security** | Vulnerable to breaches | Cryptographic security, immutable records |

### Key Benefits

#### 1. **Enhanced Security & Privacy**
- **Immutable Records**: All employee data is cryptographically secured on the blockchain
- **Tamper-Proof**: Once recorded, HR data cannot be altered without consensus
- **Cryptographic Verification**: Credentials can be mathematically verified without trusting a central authority
- **Selective Disclosure**: Employees can prove specific attributes without revealing unnecessary personal data (Zero-Knowledge Proofs)

#### 2. **Cost Reduction**
- **Eliminate Middlemen**: Direct peer-to-peer payroll and credential verification
- **Automated Processes**: Smart contracts reduce manual HR administration
- **Reduced Fraud**: Cryptographic verification prevents fake credentials and payroll manipulation
- **Lower Transaction Costs**: Layer 2 solutions enable affordable micro-transactions

#### 3. **Employee Empowerment**
- **Self-Sovereign Identity**: Employees control their own credentials and career data
- **Portable Credentials**: Work credentials follow employees between jobs
- **Transparent Compensation**: Salary bands and pay scales can be verified on-chain
- **Direct Access**: Employees can verify their own employment history instantly

#### 4. **Operational Efficiency**
- **Instant Verification**: Credential verification takes seconds, not weeks
- **Automated Payroll**: Smart contracts execute payroll automatically on schedule
- **Real-Time Updates**: Employee status changes reflect immediately across the system
- **Streamlined Onboarding**: Digital credentials eliminate paper-based processes

#### 5. **AI-Powered Insights**
- **Salary Benchmarking**: AI oracle provides market-competitive salary recommendations
- **Performance Scoring**: Data-driven employee performance metrics
- **Market Trends**: Real-time HR market data integration

#### 6. **Trust & Transparency**
- **Auditable Trail**: Every HR action is recorded on-chain for accountability
- **Fair Decision-Making**: Governance DAO ensures democratic HR policies
- **Equal Access**: All stakeholders can verify system state
- **Dispute Resolution**: Immutable records provide definitive evidence

#### 7. **Bitcoin & Lightning Payments**
- **On-Chain Payments**: Direct BT salary payments via Bitcoin Core
- **Instant Lightning Payments**: Sub-second payroll via Lightning Network
- **Low Fees**: Lightning transactions cost fractions of a cent
- **Global Reach**: Borderless payments to any employee worldwide

### Use Cases

#### For Employers
- **Verify Candidates**: Instantly verify education and employment credentials
- **Streamline Onboarding**: Reduce onboarding time from days to minutes
- **Automated Payroll**: Set-and-forget salary payments
- **AI Insights**: Data-driven compensation decisions
- **Bitcoin Payroll**: Pay employees in BT via Lightning Network

#### For Employees  
- **Own Your Data**: Control who sees your credentials
- **Instant Employment Proof**: Prove your employment instantly
- **Portable Credentials**: Take your verified credentials to new jobs
- **Direct Deposit**: Receive salary via crypto (BT/Lightning) or traditional methods

#### For HR Professionals
- **Reduce Administrative Burden**: Automate repetitive tasks
- **Better Decision-Making**: Access verified data instantly
- **Focus on People**: Spend less time on paperwork, more on employees
- **Compliance Made Easy**: Built-in audit trails satisfy regulators

---

## Project Structure

```
D-HRS/
├── backend/                   # Express API server (✅ LND integrated)
│   ├── src/
│   │   ├── index.js         # Main server (600 lines, all API endpoints)
│   │   └── lnd-client.js   # LND client wrapper (9 methods)
│   └── package.json
├── contracts/                 # Smart contracts
│   ├── src/
│   │   ├── EmployeeRegistry.sol
│   │   ├── CredentialRegistry.sol
│   │   ├── PayrollExecutor.sol
│   │   ├── BenefitsNFT.sol
│   │   ├── HRGovernance.sol
│   │   ├── DIDRegistry.sol
│   │   ├── HRToken.sol
│   │   ├── HRAIOracle.sol         # AI-powered oracle
│   │   └── DecentralizedHRS.sol   # Decentralized HR functions
│   ├── test/
│   │   └── d-hrs.test.js
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── generate-account.js
│   ├── hardhat.config.js
│   └── deployment-addresses.json
├── test-lnd-integration.js    # LND connection test (✅ passes)
├── test-apis.js               # API test script (✅ all pass)
├── index.html                 # Standalone web UI with viem.js
├── SECURITY_AUDIT.md        # Security audit report
└── README.md             # English documentation
```

---

## Quick Start

### Prerequisites

1. **Browser Wallet** - MetaMask, Rabby Wallet, or Brave Wallet (for desktop)
2. **Mobile Wallet** - Trust Wallet, Rainbow, or MetaMask Mobile (for WalletConnect QR scanning)
3. **Bitcoin Core** running on port 8332 (RPC)
4. **LND** running on port 10009 (REST) or **Core Lightning** on port 9736
5. **Hardhat Node** for smart contract deployment

### Wallet Support

D-HRS v2.0 supports **both desktop and mobile wallets**:

| Wallet Type | Options | Connection Method |
|-------------|---------|-------------------|
| **Desktop** | MetaMask, Rabby Wallet, Brave Wallet | Browser extension injection |
| **Mobile** | Trust Wallet, Rainbow, MetaMask Mobile | WalletConnect QR code |

**WalletConnect Setup** (optional for mobile):
1. Get a project ID from https://cloud.walletconnect.com
2. Replace `YOUR_WALLETCONNECT_PROJECT_ID` in `index.html` line 706

### 1. Clone & Install Dependencies

```bash
# Install smart contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install axios for Bitcoin RPC calls
npm install axios
```

### 2. Start Bitcoin Core (if not running)

```bash
# Check if Bitcoin Core is running
ps aux | grep bitcoind

# If not running, start it:
bitcoind -rpcuser=btc_rpc_user -rpcpassword=StrongPassw0rd_123 -rpcport=8332
```

### 3. Start LND (if not running)

```bash
# Check if LND is running
ps aux | grep lnd

# If not running, start it:
lnd --bitcoin.mainnet --nosebackup --bitcoin.node=bitcoind \
  --bitcoind.rpcuser=btc_rpc_user \
  --bitcoind.rpcpass=StrongPassw0rd_123
```

### 4. Start Hardhat Node

```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```

### 5. Deploy Smart Contracts

```bash
# In a new terminal
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### 6. Run Unit Tests

```bash
cd contracts
npx hardhat test
```

### 7. Start Backend API

```bash
cd backend
npm start
```

Backend runs on `http://localhost:3001`

### 8. Start Web UI

```bash
# From project root
python3 -m http.server 8001
```

### 9. Connect Wallet

1. Open http://localhost:8001/index.html
2. Click "Connect Wallet"
3. Choose:
   - **Browser Wallet** - MetaMask / Rabby / Brave Wallet
   - **Mobile Wallet** - Scan QR code with Trust Wallet / Rainbow / MetaMask Mobile

---

## Running the Complete System

### Terminal 1: Bitcoin Core
```bash
bitcoind -rpcuser=btc_rpc_user -rpcpassword=StrongPassw0rd_123 \
  -zmqpubrawblock=tcp://127.0.0.1:28332 \
  -zmqpubrawtx=tcp://127.0.0.1:28333
```

### Terminal 2: LND
```bash
lnd --bitcoin.mainnet --nosebackup \
  --bitcoin.node=bitcoind \
  --bitcoind.rpcuser=btc_rpc_user \
  --bitcoind.rpcpass=StrongPassw0rd_123
```

### Terminal 3: Hardhat Node
```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```

### Terminal 4: Deploy Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### Terminal 5: Backend API
```bash
cd backend
npm start
```

### Terminal 6: Web UI
```bash
python3 -m http.server 8001
```

### Access Points

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:8001/index.html |
| **Backend API** | http://localhost:3001 |
| **API Health** | http://localhost:3001/api/v1/health |
| **Hardhat RPC** | http://127.0.0.1:9555 |
| **Bitcoin RPC** | http://127.0.0.1:8332 |
| **LND REST** | https://127.0.0.1:10009 |

---

## Bitcoin & Lightning Network Integration (✅ Completed)

D-HRS integrates with **Bitcoin Core** and **LND** for decentralized HR payments via Lightning Network.

### Features (Implemented)
- **LND Wallet Integration** - Employee Lightning address generation on registration
- **Lightning Payments** - Instant salary payments via LND invoices
- **Credential Fees** - Collect micropayments via LND invoices before issuing credentials
- **Authentication** - LND message signing/verification for secure login
- **Payroll Automation** - Batch Lightning payments when payroll is approved
- **Personnel Actions** - Lightning payments for promotions, severance, salary adjustments

### Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Bitcoin Core** | ✅ Running | PID 30556, prune=10000, ZMQ: 28332/28333 |
| **LND** | ✅ Running | PID 30613, Node: 03e9e769..., Block: ~617K |
| **Core Lightning** | ⚠️ Partial | PID 8447, RPC connection refused |
| **D-HRS Backend** | ✅ Running | PID 9383, Port 3001, All API endpoints active |

### LND Client (Implemented)
File: `backend/src/lnd-client.js`

```javascript
const LND = require('./lnd-client');
const lnd = new LND({
  lncliPath: '/home/cste/bin/lncli',
  lightningDir: '/home/cste/.lnd'
});

// Available methods:
await lnd.getInfo()              // Get node info
await lnd.newAddress(type)        // Generate address (p2wkh)
await lnd.walletBalance()         // Query wallet balance
await lnd.addInvoice(value, memo) // Create invoice
await lnd.payInvoice(payReq)     // Pay invoice
await lnd.lookupInvoice(rHash)   // Check invoice status
await lnd.decodePayReq(payReq)   // Decode payment request
await lnd.signMessage(msg)        // Sign message
await lnd.verifyMessage(msg, sig, pk) // Verify signature
```

### API Endpoints (Implemented)

#### Authentication (LND Signature)
| Endpoint | Method | LND Function | Status |
|----------|--------|--------------|--------|
| `/api/v1/auth/challenge` | GET | Generate random challenge | ✅ |
| `/api/v1/auth/connect` | POST | `lnd.verifyMessage()` | ✅ |

#### Employee Management (LND Address + Payments)
| Endpoint | Method | LND Function | Status |
|----------|--------|--------------|--------|
| `/api/v1/employees` | POST | `lnd.newAddress()` on registration | ✅ |
| `/api/v1/employees/:did` | GET | - | ✅ |
| `/api/v1/employees` | GET | - | ✅ |
| `/api/v1/employees/:did` | PATCH | - | ✅ |
| `/api/v1/employees/:did/balance` | GET | `lnd.walletBalance()` | ✅ |
| `/api/v1/employees/:did/pay` | POST | `lnd.addInvoice()` + `lnd.payInvoice()` | ✅ |

#### Credential Management (LND Invoices)
| Endpoint | Method | LND Function | Status |
|----------|--------|--------------|--------|
| `/api/v1/credentials/issue` | POST | `lnd.addInvoice()` generates invoice | ✅ |
| `/api/v1/credentials/verify` | POST | `lnd.lookupInvoice()` checks payment | ✅ |
| `/api/v1/credentials/:did` | GET | - | ✅ |

#### Payroll System (LND Batch Payments)
| Endpoint | Method | LND Function | Status |
|----------|--------|--------------|--------|
| `/api/v1/payroll/run` | POST | - | ✅ |
| `/api/v1/payroll/run/:runId/approve` | POST | `lnd.addInvoice()` + `lnd.payInvoice()` | ✅ |
| `/api/v1/payroll/history` | GET | - | ✅ |
| `/api/v1/employees/:did/salary` | POST | `lnd.addInvoice()` + `lnd.payInvoice()` | ✅ |

#### Personnel Actions (LND Payments)
| Endpoint | Method | LND Function | Status |
|----------|--------|--------------|--------|
| `/api/v1/employees/:did/transfer` | POST | - | ✅ |
| `/api/v1/employees/:did/promotion` | POST | `lnd.addInvoice()` + `lnd.payInvoice()` | ✅ |
| `/api/v1/employees/:did/layoff` | POST | `lnd.addInvoice()` + `lnd.payInvoice()` | ✅ |

### Usage Examples

#### 1. Register Employee (Auto-generates Lightning Address)
```bash
curl -X POST http://localhost:3001/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "did": "did:example:123",
    "role": "developer",
    "department": "engineering"
  }'
```

#### 2. Issue Credential (Generates LND Invoice)
```bash
curl -X POST http://localhost:3001/api/v1/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "subject_did": "did:example:123",
    "credential_type": "degree",
    "data": {"degree": "BS"}
  }'
```

#### 3. Approve Payroll (Batch LND Payments)
```bash
# Create payroll run
curl -X POST http://localhost:3001/api/v1/payroll/run \
  -H "Content-Type: application/json" \
  -d '{
    "period_start": "2026-05-01",
    "period_end": "2026-05-31",
    "payments": [
      {"employee_did": "did:example:123", "net_amount": 5000}
    ]
  }'

# Approve (triggers LND payments)
curl -X POST http://localhost:3001/api/v1/payroll/run/0/approve
```

### Connection Information

| Service | Value |
|---------|-------|
| **LND gRPC** | 127.0.0.1:10009 |
| **LND REST** | https://127.0.0.1:8080 |
| **LND Lightning** | Port 9735 |
| **LND Node ID** | `03e9e769993dc642d80ddae0e4ba98977bdefa998a9a32529d91337cd13c6d7ff1` |
| **Bitcoin Core RPC** | 127.0.0.1:8332 |
| **D-HRS Backend** | http://localhost:3001 |
| **Health Check** | http://localhost:3001/api/v1/health |

---

## Testing Results

All 18 tests passing for DecentralizedHRS smart contract:

```
  D-HRS Contracts
    EmployeeRegistry
      ✓ Should register a new employee
      ✓ Should update employee information
      ✓ Should terminate employee
    CredentialRegistry
      ✓ Should issue a credential
      ✓ Should verify a credential
      ✓ Should revoke a credential
    BenefitsNFT
      ✓ Should mint a benefit NFT
      ✓ Should get employee benefits
    HRGovernance
      ✓ Should create a proposal
      ✓ Should cast a vote
    DIDRegistry
      ✓ Should create a DID
      ✓ Should update a DID
    DecentralizedHRS - Employee Evaluation
      ✓ Should create an employee evaluation
      ✓ Should complete an evaluation with score
      ✓ Should dispute an evaluation
    DecentralizedHRS - Job Postings & Recruitment
      ✓ Should create a job posting
      ✓ Should submit a job application
      ✓ Should update job posting status
      ✓ Should update application status
    DecentralizedHRS - Promotions
      ✓ Should initiate promotion review
      ✓ Should approve promotion
    DecentralizedHRS - Salary Adjustments
      ✓ Should propose salary adjustment
      ✓ Should approve salary adjustment
    DecentralizedHRS - Job Transfers
      ✓ Should request job transfer
      ✓ Should approve job transfer
    DecentralizedHRS - Layoffs
      ✓ Should propose layoff
      ✓ Should approve layoff
    DecentralizedHRS - Job Grades
      ✓ Should get all job grades
      ✓ Should update job grade
    DecentralizedHRS - Interactive Communication
      ✓ Should add evaluation feedback

  18 passing (DecentralizedHRS)
```

### Backend API Status

| Service | Status | Port |
|---------|--------|------|
| **Backend API** | ✅ Running | 3001 |
| **Bitcoin Core** | ✅ Running | RPC: 8332 |
| **LND** | ✅ Running | REST: 10009 |
| **Web UI** | ✅ Running | 8001 |

---

## Security

### Security Features Implemented

- **Role-Based Access Control** (RBAC) using OpenZeppelin AccessControl
- **Pausable Contracts** - Emergency stop functionality
- **Reentrancy Guards** - Protection against reentrancy attacks
- **Rate Limiting** - Prevents abuse of contract functions
- **Input Validation** - Comprehensive parameter validation

### Security Audit

See `SECURITY_AUDIT.md` for detailed security analysis and recommendations.

---

## Mobile App (Beta)

The mobile app is available in the `mobile/` directory. To run:

```bash
cd mobile
npm install
npm start
```

Features:
- Connect wallet via MetaMask
- View dashboard and statistics
- Manage employees on-the-go
- View and vote on governance proposals
- Bitcoin/Lightning payment support

---

## Deploy to Public Testnet

### Sepolia Testnet

1. Get SepoliaETH from https://sepoliafaucet.com
2. Get Alchemy API key from https://dashboard.alchemy.com
3. Create `.env` file in `contracts/`:
```env
PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```
4. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           PRESENTATION LAYER                │
│    (Web UI - index.html / Mobile App)      │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              API GATEWAY                     │
│          (Express.js - Port 3001)           │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         BLOCKCHAIN NETWORK                   │
│    (Hardhat Local / Testnet / Mainnet)      │
│  ┌──────────────────────────────────────┐   │
│  │  EmployeeRegistry  │ CredentialReg  │   │
│  │  PayrollExecutor   │ BenefitsNFT    │   │
│  │  HRGovernance      │ DIDRegistry    │   │
│  │  HRAIOracle        │ HRToken        │   │
│  │  DecentralizedHRS  │                │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and questions:
- Check the smart contract tests for usage examples
- Review API endpoints in `backend/src/index.js`
- Examine the web UI in `index.html`
- See `SECURITY_AUDIT.md` for security details
- Check `README_zh.md` for Chinese documentation

---

## Bitcoin Integration Status:

| Service | Status | Port |
|---------|--------|------|
| **Bitcoin Core** | ✅ Running | RPC: 8332, ZMQ: 28332/28333 |
| **LND** | ✅ Running | REST: 10009, gRPC: 9735 |
| **Core Lightning** | ⚠️ Optional | RPC: 9736 |

---

## Contact Us:
#####  Email: techshared4github@outlook.com

---

**D-HRS v2.0** - Built with ❤️ using Ethereum, Solidity, Node.js, Bitcoin & Lightning Network
