# D-HRS v2.0 - Decentralized Human Resources System

A next-generation decentralized principles HR system, featuring Layer 2 scaling, ERC-4337 Account Abstraction, DID/VC identity, AI oracles, and privacy-preserving technologies.

![D-HRS](https://img.shields.io/badge/version-2.0-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

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

### Technology Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.19 |
| Blockchain | Ethereum / Hardhat |
| Backend | Node.js + Express |
| Frontend | HTML/CSS/JavaScript (viem.js) |
| Mobile | React Native / Expo |
| Testing | Hardhat Tests |

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

### Use Cases

#### For Employers
- **Verify Candidates**: Instantly verify education and employment credentials
- **Streamline Onboarding**: Reduce onboarding time from days to minutes
- **Automated Payroll**: Set-and-forget salary payments
- **AI Insights**: Data-driven compensation decisions

#### For Employees  
- **Own Your Data**: Control who sees your credentials
- **Instant Employment Proof**: Prove your employment instantly
- **Portable Credentials**: Take your verified credentials to new jobs
- **Direct Deposit**: Receive salary via crypto or traditional methods

#### For HR Professionals
- **Reduce Administrative Burden**: Automate repetitive tasks
- **Better Decision-Making**: Access verified data instantly
- **Focus on People**: Spend less time on paperwork, more on employees
- **Compliance Made Easy**: Built-in audit trails satisfy regulators

---

## Project Structure

```
D-HRS/
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
│   │   └── DecentralizedHRS.sol   # NEW: Decentralized HR functions
│   ├── test/
│   │   └── d-hrs.test.js
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── generate-account.js
│   ├── hardhat.config.js
│   └── deployment-addresses.json
├── backend/                   # Express API server
│   ├── src/
│   │   └── index.js
│   └── package.json
├── mobile/                    # React Native app (NEW)
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── index.html                 # Standalone web UI with viem.js
├── SECURITY_AUDIT.md          # Security audit report
├── test-runner.js            # E2E test runner
└── README.md
```

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
# Install smart contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start Local Hardhat Node

```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```

This starts a local Ethereum node with 20 test accounts (each with 10000 ETH).

### 3. Deploy Smart Contracts

```bash
# In a new terminal
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### 4. Run Unit Tests

```bash
cd contracts
npx hardhat test
```

### 5. Start Backend API

```bash
cd backend
npm start
```

Backend runs on `http://localhost:3001`

### 6. Start Web UI

```bash
# From project root
python3 -m http.server 8001
```

---

## Running the Complete System

### Terminal 1: Hardhat Node
```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```

### Terminal 2: Deploy Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### Terminal 3: Backend API
```bash
cd backend
npm start
```

### Terminal 4: Web UI
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

---

## Deployed Contract Addresses

### Local Network (Chain ID: 31337)

| Contract | Address |
|----------|---------|
| HRToken | 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 |
| EmployeeRegistry | 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 |
| CredentialRegistry | 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 |
| PayrollExecutor | 0x0165878A594ca255338adfa4d48449f69242Eb8F |
| BenefitsNFT | 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853 |
| HRGovernance | 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6 |
| DIDRegistry | 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 |

---

## API Endpoints

### Health Check
```bash
GET /api/v1/health
```

### Contracts
```bash
GET /api/v1/contracts
```

### Employees
```bash
# Get all employees
GET /api/v1/employees

# Register employee
POST /api/v1/employees
{
  "wallet_address": "0x...",
  "did": "did:hrs:...",
  "role": "Software Engineer",
  "department": "Engineering",
  "salary": 100000
}
```

### Credentials
```bash
# Issue credential
POST /api/v1/credentials/issue
{
  "subject_did": "did:hrs:...",
  "credential_type": "EmploymentCredential",
  "expiry_days": 365
}

# Verify credential
POST /api/v1/credentials/verify
{
  "subject_did": "did:hrs:...",
  "credential_type": "EmploymentCredential"
}
```

### Payroll
```bash
# Create payroll run
POST /api/v1/payroll/run
{
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "payments": [
    {"did": "0x111", "wallet": "0x...", "gross_amount": 10000, "deductions": 3000, "net_amount": 7000}
  ]
}
```

### Governance
```bash
# Create proposal
POST /api/v1/governance/proposals
{
  "title": "Update Remote Work Policy",
  "description": "Allow 4 days remote work per week",
  "category": "policy"
}
```

### Decentralized HR Functions (NEW)
```bash
# Employee Evaluation
POST /api/v1/decentralized/evaluation
{
  "employee_did": "did:hrs:...",
  "evaluator_did": "did:hrs:...",
  "evaluation_type": 0,
  "score": 85,
  "strengths": "Technical skills",
  "weaknesses": "Communication",
  "recommendations": "Training courses"
}

# Job Postings
POST /api/v1/decentralized/job-posting
{
  "title": "Senior Developer",
  "description": "Job description",
  "requirements": "5+ years experience",
  "department": "Engineering",
  "grade": 3,
  "min_salary": 90000,
  "max_salary": 120000
}

# Submit Application
POST /api/v1/decentralized/application
{
  "posting_id": 0,
  "applicant_did": "did:hrs:...",
  "resume_hash": "0x..."
}

# Promotion Review
POST /api/v1/decentralized/promotion-review
{
  "employee_did": "did:hrs:...",
  "current_grade": 2,
  "target_grade": 3,
  "performance_score": 90,
  "peer_review_score": 85,
  "manager_review_score": 88
}

# Salary Adjustment
POST /api/v1/decentralized/salary-adjustment
{
  "employee_did": "did:hrs:...",
  "adjustment_percent": 10,
  "reason": "Annual review",
  "effective_date": 1699999999
}

# Job Transfer
POST /api/v1/decentralized/transfer
{
  "employee_did": "did:hrs:...",
  "from_department": "Engineering",
  "to_department": "Product",
  "reason": "Career growth"
}

# Layoff
POST /api/v1/decentralized/layoff
{
  "employee_did": "did:hrs:...",
  "reason": "Company restructuring",
  "notice_period_days": 30,
  "severance_amount": 5000
}
```

---

## Web UI Features

1. **Dashboard** - System overview, statistics, activity log
2. **Employees** - View and register employees on-chain
3. **Credentials** - Manage verifiable credentials
4. **Payroll** - Create and track payroll runs
5. **Governance** - Create and vote on proposals
6. **Contracts** - View deployed contract addresses

### Connecting Wallet

1. Open http://localhost:8001/index.html
2. Click "Connect Wallet" 
3. If using MetaMask, add custom network:
   - Network Name: Localhost 9555
   - RPC URL: http://127.0.0.1:9555
   - Chain ID: 31337

---

## Testing Results

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

MIT License - See LICENSE file for details

---

## Support

For issues and questions:
- Check the smart contract tests for usage examples
- Review API endpoints in `backend/src/index.js`
- Examine the web UI in `index.html`
- See `SECURITY_AUDIT.md` for security details

---

## Contact Us
#####  Email: techshared4github@outlook.com

---

**D-HRS v2.0** - Built with ❤️ using Ethereum, Solidity, Node.js, and React Native
