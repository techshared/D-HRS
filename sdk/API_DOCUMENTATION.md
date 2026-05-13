# D-HRS SDK API Documentation

## 1. Lightning SDK

### DHRSLightning

#### Constructor
```typescript
new DHRSLightning(config: LightningConfig)
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| connect() | - | Promise<void> | Connect to Lightning node |
| disconnect() | - | Promise<void> | Disconnect |
| createInvoice() | amount, memo, expiry? | Promise<Invoice> | Create invoice |
| payInvoice() | paymentRequest, amount? | Promise<Payment> | Pay invoice |
| listChannels() | - | Promise<Channel[]> | List channels |
| getNodeInfo() | - | Promise<NodeInfo> | Get node info |
| executePayroll() | payments[] | Promise<PayrollResult> | Execute batch payroll |
| createEscrow() | receiver, amount, timelock, conditions | Promise<HTLCEscrow> | Create escrow |

---

## 2. HR智能合约库

### HRSAccessControl

#### Functions

| Function | Parameters | Access | Description |
|----------|-----------|--------|-------------|
| createDepartment() | id, name, head | HR_ADMIN | Create department |
| addEmployeeToDepartment() | departmentId, employee | DEPARTMENT_HEAD | Add employee |
| removeEmployeeFromDepartment() | departmentId, employee | DEPARTMENT_HEAD | Remove employee |

### PayrollBatch

| Function | Parameters | Access | Description |
|----------|-----------|--------|-------------|
| createPayroll() | periodStart, periodEnd, employees[], amounts[], departmentIds[] | HR_ADMIN | Create payroll |
| approvePayroll() | runId | FINANCE | Approve payroll |
| executePayroll() | runId | EXECUTOR | Execute payroll |

### CredentialNFT

| Function | Parameters | Access | Description |
|----------|-----------|--------|-------------|
| issueCredential() | holder, type, metadata, departmentId, expiresAt | ISSUER | Issue credential |
| revokeCredential() | tokenId | REVOKER | Revoke credential |
| isCredentialValid() | tokenId | view | Check validity |

---

## 3. 身份凭证系统

### DHRIdentity

#### Constructor
```typescript
new DHRIdentity(issuerDID?: string, privateKey?: string)
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| createDID() | controller, publicKey, endpoint | Promise<DIDDocument> | Create DID |
| resolveDID() | did | Promise<DIDResolutionResult> | Resolve DID |
| issueCredential() | subjectDID, type, claims, expiry? | Promise<VC> | Issue credential |
| verifyCredential() | credential | Promise<boolean> | Verify credential |
| createDisclosure() | credential, fields[] | Promise<DisclosureProof> | Selective disclosure |
| createRangeProof() | credential, field, minValue | Promise<DisclosureProof> | Range proof |

---

## 4. AI Oracle

### AIOracle

#### Constructor
```typescript
new AIOracle()
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| trainModel() | modelType, data | Promise<ModelMetrics> | Train model |
| predict() | request | Promise<OracleResponse> | Make prediction |
| verifyProof() | prediction, features | Promise<boolean> | Verify proof |
| getModelInfo() | modelType | object | Get model info |
| listModels() | - | ModelType[] | List models |

---

## Types

### LightningConfig
```typescript
interface LightningConfig {
  lnd?: { host: string; port: number; macaroon: string };
  cln?: { host: string; port: number; rune?: string };
  network: 'mainnet' | 'testnet' | 'regtest';
}
```

### PredictionRequest
```typescript
interface PredictionRequest {
  features: Record<string, number>;
  modelType: 'salary_predictor' | 'performance_analyzer' | 'attrition_predictor';
}
```

### VerifiableCredential
```typescript
interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
}
```
