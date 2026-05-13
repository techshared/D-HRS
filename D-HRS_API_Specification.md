# D-HRS API Specification

> RESTful API and Web3 Blockchain API specifications for D-HRS v2.0

---

## 1. Authentication API

### 1.1 Wallet Connection
```
POST /api/v1/auth/connect
Content-Type: application/json

Request:
{
  "wallet_address": "0x...",
  "signature": "0x...",
  "message": "Sign this message to authenticate with D-HRS",
  "nonce": "random-nonce"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "did": "did:hrs:0x1234...",
    "role": "employee",
    "permissions": ["read:profile", "write:profile", "read:payroll"]
  }
}
```

### 1.2 DID Authentication (ERC-4337)
```
POST /api/v1/auth/did/authenticate
Content-Type: application/json

Request:
{
  "user_operation": {
    "sender": "0x...",
    "nonce": "0x0000000000000000",
    "initCode": "0x...",
    "callData": "0x...",
    "signature": "0x..."
  },
  "entry_point": "0x5FF137D4b0FD9D6A..."
}

Response:
{
  "success": true,
  "data": {
    "session_token": "...",
    "account_address": "0x...",
    "chain_id": 324,  // zkSync Era
    "expires_at": "2024-01-15T12:00:00Z"
  }
}
```

### 1.3 Social Login (Passkeys)
```
POST /api/v1/auth/passkeys/register
Content-Type: application/json

Request:
{
  "credential": {
    "id": "...",
    "rawId": "...",
    "response": {
      "attestationObject": "...",
      "clientDataJSON": "..."
    },
    "type": "public-key"
  },
  "did": "did:hrs:0x1234..."
}

Response:
{
  "success": true,
  "data": {
    "passkey_id": "uuid",
    "registered": true
  }
}
```

---

## 2. Employee API

### 2.1 Get Employee Profile
```
GET /api/v1/employees/:did
Authorization: Bearer <access_token>
x-session-key: <optional_session_key>

Response:
{
  "success": true,
  "data": {
    "did": "did:hrs:0x1234...",
    "personal_info_hash": "0xabc123...",
    "role": "Senior Engineer",
    "department": "Engineering",
    "salary": "150000000000000000000",  // in wei
    "start_date": "2023-01-15T00:00:00Z",
    "status": "active",
    "credentials_root": "0xmerkleroot...",
    "created_at": "2023-01-15T00:00:00Z",
    "updated_at": "2024-01-10T00:00:00Z"
  }
}
```

### 2.2 Register Employee
```
POST /api/v1/employees
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "wallet_address": "0x...",
  "personal_info_hash": "0xencryptedhash...",
  "role": "Software Engineer",
  "department": "Engineering",
  "salary": "120000",
  "start_date": "2024-02-01",
  "initial_credentials": [
    {
      "type": "employment",
      "issuer": "did:hrs:company:hr",
      "metadata_uri": "ipfs://Qm..."
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "did": "did:hrs:0xnew123...",
    "transaction_hash": "0x...",
    "block_number": 12345678,
    "status": "confirmed"
  }
}
```

### 2.3 Update Employee
```
PATCH /api/v1/employees/:did
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "role": "Senior Software Engineer",
  "department": "Engineering",
  "salary": "150000",
  "effective_date": "2024-03-01"
}

Response:
{
  "success": true,
  "data": {
    "transaction_hash": "0x...",
    "updated_fields": ["role", "salary"],
    "previous_values": {
      "role": "Software Engineer",
      "salary": "120000"
    }
  }
}
```

### 2.4 Terminate Employee
```
POST /api/v1/employees/:did/terminate
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "termination_date": "2024-02-28",
  "reason": "resignation",
  "severance_amount": "5000",
  "revoke_access": true
}

Response:
{
  "success": true,
  "data": {
    "transaction_hash": "0x...",
    "status": "terminated",
    "final_settlement": {
      "pending_salary": "10000",
      "unused_pto": "5000",
      "severance": "5000"
    }
  }
}
```

---

## 3. Credentials API

### 3.1 Issue Credential
```
POST /api/v1/credentials/issue
Authorization: Bearer <access_token>
Required Role: issuer

Request:
{
  "subject_did": "did:hrs:0xemployee...",
  "credential_type": "EmploymentCredential",
  "data": {
    "job_title": "Software Engineer",
    "department": "Engineering",
    "employment_type": "full-time",
    "start_date": "2023-01-15"
  },
  "expiry_days": 365,
  "metadata_uri": "ipfs://Qm..."
}

Response:
{
  "success": true,
  "data": {
    "credential_id": "0xcredentialhash...",
    "transaction_hash": "0x...",
    "issued_at": "2024-01-15T10:00:00Z",
    "expires_at": "2025-01-15T10:00:00Z"
  }
}
```

### 3.2 Verify Credential
```
POST /api/v1/credentials/verify
Authorization: Bearer <access_token>

Request:
{
  "subject_did": "did:hrs:0xemployee...",
  "credential_type": "EmploymentCredential",
  "zk_proof": "0xzkproof..."  // Optional ZK proof for privacy
}

Response:
{
  "success": true,
  "data": {
    "is_valid": true,
    "credential": {
      "issuer": "did:hrs:company:hr",
      "issued_at": "2023-01-15",
      "expires_at": "2025-01-15"
    },
    "verification_method": "zk_snark"
  }
}
```

### 3.3 List Credentials
```
GET /api/v1/credentials/:did
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "credentials": [
      {
        "id": "0x...",
        "type": "EmploymentCredential",
        "issuer": "did:hrs:company:hr",
        "issued_at": "2023-01-15",
        "expiry_date": "2025-01-15",
        "status": "valid"
      },
      {
        "id": "0x...",
        "type": "CertificationCredential",
        "issuer": "did:hrs:company:training",
        "issued_at": "2023-06-01",
        "expiry_date": "2026-06-01",
        "status": "valid"
      }
    ]
  }
}
```

---

## 4. Payroll API

### 4.1 Create Payroll Run
```
POST /api/v1/payroll/run
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "payments": [
    {
      "did": "did:hrs:0xemp1...",
      "wallet": "0x...",
      "gross_amount": "1000000000000000000000",
      "deductions": {
        "tax": "250000000000000000000",
        "benefits": "100000000000000000000",
        "retirement": "50000000000000000000"
      },
      "net_amount": "600000000000000000000"
    }
  ],
  "execute_after_approval": false
}

Response:
{
  "success": true,
  "data": {
    "run_id": 1,
    "total_amount": "600000000000000000000",
    "status": "pending_approval",
    "required_approvals": 2,
    "current_approvals": 0
  }
}
```

### 4.2 Approve Payroll
```
POST /api/v1/payroll/run/:runId/approve
Authorization: Bearer <access_token>
Required Role: finance

Response:
{
  "success": true,
  "data": {
    "run_id": 1,
    "approved_by": "0xapprover...",
    "approval_count": 1,
    "required_approvals": 2,
    "status": "pending_approval"
  }
}
```

### 4.3 Execute Payroll
```
POST /api/v1/payroll/run/:runId/execute
Authorization: Bearer <access_token>
Required Role: executor

Response:
{
  "success": true,
  "data": {
    "run_id": 1,
    "transaction_hash": "0x...",
    "status": "executed",
    "payments": [
      {
        "recipient": "0x...",
        "amount": "600000000000000000000",
        "status": "completed"
      }
    ]
  }
}
```

### 4.4 Get Payroll History
```
GET /api/v1/payroll/history
Authorization: Bearer <access_token>
Query Parameters:
  - address: 0x... (optional, filter by employee)
  - start_date: 2024-01-01 (optional)
  - end_date: 2024-12-31 (optional)
  - status: executed (optional)
  - page: 1
  - limit: 20

Response:
{
  "success": true,
  "data": {
    "payroll_runs": [
      {
        "run_id": 1,
        "period": "January 2024",
        "total_amount": "600000000000000000000",
        "status": "executed",
        "executed_at": "2024-02-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12
    }
  }
}
```

---

## 5. Benefits API

### 5.1 Mint Benefit NFT
```
POST /api/v1/benefits/mint
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "recipient_did": "did:hrs:0xemp...",
  "benefit_type": "health_insurance",
  "coverage_level": "premium",
  "duration_days": 365,
  "metadata": {
    "provider": "BlueCross",
    "plan_number": "BC123456",
    "dependents": ["spouse", "child"]
  }
}

Response:
{
  "success": true,
  "data": {
    "token_id": 1,
    "transaction_hash": "0x...",
    "owner": "0xemployee...",
    "expires_at": "2025-01-15T00:00:00Z"
  }
}
```

### 5.2 Get Employee Benefits
```
GET /api/v1/benefits/employee/:did
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
    "benefits": [
      {
        "token_id": 1,
        "type": "health_insurance",
        "coverage_level": "premium",
        "status": "active",
        "start_date": "2024-01-15",
        "end_date": "2025-01-15",
        "provider": "BlueCross"
      }
    ]
  }
}
```

### 5.3 Revoke Benefit
```
POST /api/v1/benefits/:tokenId/revoke
Authorization: Bearer <access_token>
Required Role: hr_admin

Request:
{
  "reason": "employment_terminated",
  "effective_date": "2024-02-28"
}

Response:
{
  "success": true,
  "data": {
    "token_id": 1,
    "status": "revoked",
    "transaction_hash": "0x..."
  }
}
```

---

## 6. Governance API

### 6.1 Create Proposal
```
POST /api/v1/governance/proposals
Authorization: Bearer <access_token>
Required Role: proposer

Request:
{
  "title": "Update Remote Work Policy",
  "description": "Proposal to update the remote work policy to allow 4 days remote per week",
  "category": "policy",
  "quorum_percentage": 50,
  "actions": [
    {
      "target": "0xpolicycontract...",
      "function": "updatePolicy(string)",
      "params": ["remote_work_4_days"]
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "proposal_id": 1,
    "transaction_hash": "0x...",
    "start_time": "2024-01-20T00:00:00Z",
    "end_time": "2024-01-27T00:00:00Z",
    "status": "active"
  }
}
```

### 6.2 Cast Vote
```
POST /api/v1/governance/proposals/:proposalId/vote
Authorization: Bearer <access_token>
Required Role: voter

Request:
{
  "support": true,  // true = for, false = against
  "weight": 1,       // voting power
  "reason": "This policy improves work-life balance"
}

Response:
{
  "success": true,
  "data": {
    "proposal_id": 1,
    "voter": "0x...",
    "vote": "for",
    "weight": 1,
    "for_votes": 45,
    "against_votes": 12,
    "abstain_votes": 3
  }
}
```

### 6.3 Get Proposals
```
GET /api/v1/governance/proposals
Query Parameters:
  - status: active (pending, active, passed, rejected, executed)
  - category: policy (optional)
  - page: 1
  - limit: 20

Response:
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": 1,
        "title": "Update Remote Work Policy",
        "description": "...",
        "proposer": "0x...",
        "status": "active",
        "for_votes": 45,
        "against_votes": 12,
        "abstain_votes": 3,
        "quorum_required": 50,
        "quorum_reached": true,
        "end_time": "2024-01-27T00:00:00Z"
      }
    ]
  }
}
```

---

## 7. Blockchain API

### 7.1 Submit Transaction
```
POST /api/v1/blockchain/transactions
Authorization: Bearer <access_token>

Request:
{
  "to": "0xemployeeregistry...",
  "data": "0xabc123...",
  "value": "0",
  "gas_limit": 200000,
  "user_operation_hash": "0x..."  // For ERC-4337
}

Response:
{
  "success": true,
  "data": {
    "transaction_hash": "0x...",
    "user_operation_hash": "0x...",
    "status": "pending",
    "estimated_confirm_time": "5s"
  }
}
```

### 7.2 Get Transaction Status
```
GET /api/v1/blockchain/transactions/:txHash

Response:
{
  "success": true,
  "data": {
    "hash": "0x...",
    "block_number": 12345678,
    "status": "confirmed",
    "confirmations": 12,
    "gas_used": 150000,
    "effective_gas_price": "10000000000",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 7.3 Verify Merkle Proof
```
POST /api/v1/blockchain/verify-proof
Authorization: Bearer <access_token>

Request:
{
  "leaf": "0x...",
  "proof": ["0x...", "0x..."],
  "root": "0xmerkleroot...",
  "address": "0xemployeeregistry..."
}

Response:
{
  "success": true,
  "data": {
    "is_valid": true,
    "verified_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## 8. Web3 Events / WebSocket

### 8.1 Subscribe to Events
```
WS /api/v1/ws
Subscribe message:
{
  "type": "subscribe",
  "channel": "employee_events",
  "filters": {
    "did": "did:hrs:0x..."
  }
}

Event types:
- employee.registered
- employee.updated
- employee.terminated
- credential.issued
- credential.revoked
- payroll.approved
- payroll.executed
- benefit.minted
- benefit.revoked
- proposal.created
- proposal.voted
- proposal.executed
```

---

## 9. Error Responses

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {
      "required_role": "hr_admin",
      "current_role": "employee"
    }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request body |
| BLOCKCHAIN_ERROR | 500 | Blockchain transaction failed |
| RATE_LIMITED | 429 | Too many requests |

---

## 10. Rate Limits

| Endpoint | Limit |
|----------|-------|
| /api/v1/auth/* | 10 req/min |
| /api/v1/employees/* | 100 req/min |
| /api/v1/payroll/* | 20 req/min |
| /api/v1/governance/* | 30 req/min |
| /api/v1/blockchain/* | 50 req/min |
