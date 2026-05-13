# D-HRS SDK

## 组件列表

| 组件 | 版本 | 测试 | 说明 |
|------|------|------|------|
| @d-hrs/lightning-sdk | 1.0.0 | 14/14 ✅ | 比特币闪电网络支付 |
| @d-hrs/hr-contracts | 1.0.0 | 7/7 ✅ | HR智能合约库 |
| @d-hrs/identity-system | 1.0.0 | 13/13 ✅ | DID+VC身份凭证 |
| @d-hrs/ai-oracle | 1.0.0 | 7/7 ✅ | AI预测预言机 |

## 安装

```bash
cd sdk
npm install
```

## 使用

### Lightning SDK
```typescript
import { DHRSLightning } from '@d-hrs/lightning-sdk';

const sdk = new DHRSLightning({ ... });
await sdk.connect();
await sdk.executePayroll([...]);
```

### HR智能合约
```solidity
import "@d-hrs/hr-contracts/contracts/core/HRSAccessControl.sol";
import "@d-hrs/hr-contracts/contracts/payroll/PayrollBatch.sol";
```

### 身份凭证
```typescript
import { DHRIdentity } from '@d-hrs/identity-system';

const identity = new DHRIdentity();
const did = await identity.createDID(...);
const vc = await identity.issueCredential(...);
```

### AI Oracle
```typescript
import { AIOracle } from '@d-hrs/ai-oracle';

const oracle = new AIOracle();
await oracle.trainModel('salary_predictor', data);
const prediction = await oracle.predict({...});
```

## 测试

```bash
npm test
```
