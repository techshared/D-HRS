# D-HRS v2.0 — HR 区块链合规存证引擎

**链聘通 (ChainHire)** —— 面向中国企业的人力资源合规存证系统。通过区块链不可篡改审计轨迹 + 等保三级合规体系 + 实名认证（KYC）实现 HR 流程的司法级证据链。不发币、不上链工资、不碰监管红线。

![D-HRS](https://img.shields.io/badge/version-2.0-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Compliance](https://img.shields.io/badge/等保三级-准备中-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 一句话定位

**把 HR 关键操作变成不可篡改的审计证据，合规成本降到十分之一。**

D-HRS 不是一个"去中心化HR系统"——它是一个**HR合规存证中间件**。每个员工入转调离、薪资审批、绩效评估都被哈希上链存证，形成完整审计链。不上链任何隐私数据（PIPL合规），不发币（924通知合规），不替代现有HR系统——而是给现有系统加上合规层。

### 核心功能

| 模块 | 说明 | 合规价值 |
|------|------|---------|
| 合规引擎 | 链上KYC + 制裁名单筛查 + 操作守卫 | 满足区块链信息服务管理规定 |
| 员工存证 | DID身份 + 入转调离全生命周期链上记录 | HR操作不可篡改 |
| 可验证凭证 | W3C VC 标准，支持选择性披露 | 员工自助证明资质 |
| 薪资审批流 | 多签审批链上存证（不上链金额） | 审计追溯 |
| 福利通证 | Soulbound NFT 记录员工福利（不可转让） | 非金融属性，合规 |
| DAO治理 | HR政策提案投票 | 透明决策 |
| AI预言机 | 薪资基准 + 绩效评分（结果存证） | 数据驱动决策 |

### 合规对标

| 法规 | 完成度 | 实现方式 |
|------|--------|---------|
| 924通知（虚拟货币禁令） | ✅ 100% | 无代币、无钱包、无支付、无加密货币 |
| 区块链信息服务管理规定 | ✅ 85% | 实名认证 + 内容审核 + 用户协议 + 备案材料就绪 |
| 个人信息保护法（PIPL） | ✅ 95% | 用户同意 + 敏感字段AES-256加密 + 查阅/更正/删除权 |
| 数据安全法 | ✅ 85% | 数据分级 + 本地化部署 + 风险评估 |
| 网络安全法 + 等保2.0 | ⚠️ 55% | 管理制度已建立，技术整改进行中 |
| 智能合约审计 | ✅ 70% | 自审计 + 35项测试通过，待第三方审计 |

### 什么场景用 D-HRS？

- 📋 **你需要等保三级评审** —— 制度+技术文档已经为你准备好了
- 🔐 **你要对审计说清楚每一次HR操作** —— 链上证据链，无需信任人工记录
- 🏢 **你们有跨境人员/外籍员工** —— 制裁名单筛查 + KYC 一体化
- 🔄 **你要给现有HR系统加上合规层** —— 无需替换北森/Moka/钉钉

### D-HRS 不是什么

- ❌ 不是"去中心化HR系统"——企业不关心这个
- ❌ 不是Moka/北森的替代品——它们是HR系统，D-HRS是合规层
- ❌ 不是发币项目——全链路无加密货币
- ❌ 不是开源CRM/GitHub玩具——是真的为了通过审计而设计

### 技术栈

| 层 | 技术 |
|----|------|
| 智能合约 | Solidity 0.8.19 + Foundry |
| 区块链 | Ethereum / Hardhat（联盟链友好） |
| 后端 | Node.js + Express + JWT |
| Web | HTML/CSS/JS 单页应用 |
| 移动端 | React Native / Expo (Hermes) |
| 合规 | ComplianceEngine.sol + KYC/制裁中间件 |
| 身份 | DID + W3C VC + 选择性披露 |
| 国际化 | i18next (EN/中文) |

---

## 为什么企业需要 D-HRS？

### 现状痛点

| 企业HR痛点 | 后果 | D-HRS方案 |
|-----------|------|----------|
| HR操作没有不可篡改的审计记录 | 审计时靠截图/邮件，没有司法效力 | 每次HR关键操作哈希上链存证 |
| 员工资质文件容易被伪造 | 假学历/假履历，背调成本高 | W3C可验证凭证 + 链上验证 |
| 多部门薪资审批流程不透明 | 审批延迟，责任推诿 | 多签审批上链，时间戳不可篡改 |
| 等保三级评审材料缺失 | 过不了等保评审 | 12份管理制度 + 自查清单全开源 |
| 数据跨境/外籍人员管理 | 制裁名单筛查缺失 | 内置OFAC+中国外交部制裁库 |

### 价值对比

| 维度 | 传统方式 | D-HRS方式 |
|------|---------|-----------|
| 审计证据 | Excel/截图/邮件，可篡改 | 链上哈希存证，不可篡改 |
| 资质验证 | 人工背调，3-5天，¥500/人 | 链上秒验，¥0 |
| 等保准备 | ¥5-15万请咨询公司 | 开源文档自评，¥0 |
| 合规成本 | 法务+审计+合规专员，¥30万+/年 | 系统自动化，降低80% |
| 数据控制 | 企业完全控制，员工无知情权 | DID自主权+选择性披露 |

---

## Compliance Architecture

D-HRS is designed for the Chinese regulatory environment. The compliance layer includes:

### ComplianceEngine.sol

On-chain compliance engine that enforces:
- **Real-Name Authentication (KYC)** — Users must complete ID verification before accessing HR functions
- **Sanctions Screening** — OFAC SDN + China MOFA sanctions list checking
- **Compliance Guard** — `guard()` and `guardWithLevel()` functions enforce compliance before any HR operation

### Backend Compliance Middleware

- **JWT Authentication** — Token-based session management
- **Sanctions Screening** — Real-time address checking against sanctions database
- **KYC Status Tracking** — User authentication level management

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/compliance/kyc/initiate` | POST | Start real-name verification |
| `/api/v1/compliance/status/:address` | GET | Check KYC status |
| `/api/v1/compliance/dashboard` | GET | Compliance statistics |
| `/api/v1/compliance/sanctions` | GET | View sanctions list |
| `/api/v1/compliance/sanctions/check` | POST | Check address against sanctions |
| `/api/v1/compliance/users` | GET | List all authenticated users |

### Regulatory Compliance

| Regulation | Status | Implementation |
|-----------|--------|----------------|
| 924 通知（虚拟货币禁令） | ✅ 100% | 无代币/钱包/加密货币功能 |
| 区块链信息服务管理规定 | ✅ 85% | 实名认证+内容审核+用户协议+备案材料就绪，合约已集成合规守卫 |
| 个人信息保护法 | ✅ 95% | 用户同意+查阅/更正/删除权+敏感字段加密（AES-256） |
| 数据安全法 | ✅ 85% | 数据分级+本地化+风险评估+加密 |
| 网络安全法 + 等保 2.0 | ⚠️ 55% | 管理制度已建立，技术整改进行中 |
| 智能合约审计 | ✅ 70% | 自审计完成+33项合约测试通过，第三方审计待做 |

**总体合规度：85%**（免费可实现措施已全部完成）

---

## Smart Contracts

## Smart Contracts

### Contract Overview

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| `ComplianceEngine.sol` | Compliance engine | KYC status, sanctions list, compliance guard (`guard()` / `guardWithLevel()`) |
| `EmployeeRegistry.sol` | Employee management | DID-based registration, role/department, compliance guard (no salary on-chain) |
| `CredentialRegistry.sol` | Verifiable credentials | W3C VC issuance, verification, revocation |
| `PayrollExecutor.sol` | Payroll approval workflow | Multi-signature approval, on-chain audit trail (no payments) |
| `BenefitsNFT.sol` | Employee benefits | Soulbound NFTs (non-transferable) |
| `HRGovernance.sol` | DAO governance | Proposals, role-based voting (1 vote per VOTER_ROLE), execution |
| `DIDRegistry.sol` | Decentralized identifiers | DID creation, update, authentication |
| `HRAIOracle.sol` | AI oracle | Salary benchmarks, performance scoring (AccessControl-gated, authorization enforced) |
| `DecentralizedHRS.sol` | HR operations | Recruitment, evaluations, promotions, layoffs |

### Contract Integration

All contracts are wired to `ComplianceEngine.guard()` for on-chain compliance checks. Deployment order:
1. `ComplianceEngine` → standalone deployment
2. `EmployeeRegistry(complianceEngine)` → receives compliance engine address
3. `DecentralizedHRS.setComplianceEngine()` → linked post-deployment

### Security Features

- **OpenZeppelin AccessControl** — Role-based permissions (HR_ADMIN, FINANCE, EXECUTOR, etc.)
- **Pausable** — Emergency stop on all contracts
- **ReentrancyGuard** — Protection against reentrancy attacks
- **Rate Limiting** — 100 actions/day, 1 minute cooldown per action
- **Input Validation** — Address, DID, role, department validation
- **Soulbound NFTs** — BenefitsNFT blocks all transfers except mint/burn
- **Compliance Guard** — All write operations checked against KYC + sanctions via ComplianceEngine

### Contract Tests

```
35 passing (624ms)
0 failing
```

Tests cover EmployeeRegistry, CredentialRegistry, BenefitsNFT, HRGovernance, DIDRegistry, DecentralizedHRS (7 modules, 35 test cases including deny layoff + severance hash validation), and ComplianceEngine (3 test cases).

---

## Mobile App

Built with React Native + Expo, running on Hermes engine. Tested on Meizu M2 Note (Android 5.1 / API 22).

![Mobile App - Dashboard](screen_app.png)

*Dashboard view — showing Employee count, Credential stats, and Payroll summary*

### Screenshots

| Dashboard | Payroll |
|-----------|---------|
| ![Dashboard](screen_app.png) | ![Payroll](screen_payroll.png) |

### Features

- **Real-Name Authentication** — First-screen KYC flow (persisted via AsyncStorage)
- **Bilingual** — EN/中文 toggle via i18next
- **Dashboard** — System overview (employee count, credentials, proposals)
- **Employees** — Register and manage employees via API
- **Credentials** — Issue and verify Verifiable Credentials
- **Payroll** — Create and approve payroll runs (approval workflow only)
- **Governance** — Create proposals and vote
- **Compliance Dashboard** — KYC statistics and sanctions monitoring

### Setup & Build

```bash
cd mobile
npm install

cd android
./gradlew.bat assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk (~64 MB)
```

### Install on Device (Flyme PRD firmware)

```bash
ADB=/path/to/adb
APK=mobile/android/app/build/outputs/apk/debug/app-debug.apk
SIZE=$(stat -c%s "$APK")
$ADB push "$APK" /data/local/tmp/app.apk
SID=$($ADB shell pm install-create -r -t -S $SIZE | grep -oP '\[\K\d+')
$ADB shell pm install-write -S $SIZE $SID base.apk /data/local/tmp/app.apk
$ADB shell pm install-commit $SID
$ADB shell am start -n com.dhrs.mobile/.MainActivity
```

Or use the one-click script: `mobile/scripts/start-mobile.bat`

### ADB Reverse (for API connectivity)

```bash
adb reverse tcp:3001 tcp:3001
```

---

## Web UI

A standalone HTML/CSS/JS application with vanilla JavaScript i18n.

### Access Points

```
http://localhost:8001/index.html
```

### Features

- Dashboard with system statistics
- Employee management
- Payroll status overview
- Verifiable credentials section
- HR Governance proposals
- **Compliance Dashboard** — KYC initiation, sanctions checking, compliance statistics

---

## Internationalization (i18n)

Both mobile and web support **English/Chinese bilingual switching**.

| Platform | Library | Switching |
|----------|---------|-----------|
| Mobile App | `i18next` + `react-i18next` | Top-right `EN`/`中文` button |
| Web UI | Vanilla JavaScript | Top-right language toggle |

### Translation Files

| File | Description |
|------|-------------|
| `mobile/src/i18n/locales/en.json` | English translations (kyc, compliance, dashboard, etc.) |
| `mobile/src/i18n/locales/zh.json` | Chinese translations |
| `mobile/src/i18n/index.ts` | Inline translation data |

---

## Backend API

### Contract Addresses

```javascript
const CONTRACT_ADDRESSES = {
  employeeRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  credentialRegistry: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  payrollExecutor: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  benefitsNFT: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  hrGovernance: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  didRegistry: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
};
```

### API Status

| Service | Status | Port |
|---------|--------|------|
| **Backend API** | ✅ Running | 3001 |
| **Web UI** | ✅ Running | 8001 |

---

## Security

### Security Features Implemented

- **Role-Based Access Control** (RBAC) using OpenZeppelin AccessControl
- **Pausable Contracts** — Emergency stop functionality
- **Reentrancy Guards** — Protection against reentrancy attacks
- **Rate Limiting** — 100 actions/day per account
- **Input Validation** — Address, DID, role validation
- **JWT Authentication** — Token-based session management
- **Compliance Middleware** — Sanctions screening on all sensitive endpoints
- **Soulbound NFTs** — Non-transferable benefit tokens

### Security Audit

See `SECURITY_AUDIT.md` for detailed security analysis and recommendations.

### Compliance Documentation

- `docs/compliance/01-信息安全总体方针.md` — Information security policy
- `docs/compliance/02-网络安全管理制度.md` — Network security management
- `docs/compliance/03-主机安全管理制度.md` — Host security management
- `docs/compliance/04-应用安全管理制度.md` — Application security management
- `docs/compliance/05-数据安全管理制度.md` — Data security management
- `docs/compliance/06-安全组织机构管理制度.md` — Security organization management
- `docs/compliance/07-人员安全管理制度.md` — Personnel security management
- `docs/compliance/08-安全建设管理制度.md` — Security construction management
- `docs/compliance/09-安全运维管理制度.md` — Security operations management
- `docs/compliance/10-安全应急响应预案.md` — Emergency response plan
- `docs/compliance/11-安全教育培训制度.md` — Security training and education
- `docs/compliance/12-备份与恢复管理制度.md` — Backup and recovery management
- `docs/compliance/等保三级差距评估自查清单.md` — Gap assessment checklist
- `docs/compliance/等保三级测评详细步骤.md` — Level 3 assessment guide
- `docs/compliance/智能合约安全审计准备.md` — Smart contract audit preparation
- `docs/compliance/第三方合约审计详细步骤.md` — Third-party audit guide
- `docs/compliance/数据安全风险评估报告.md` — Data security risk assessment
- `docs/filing/区块链信息服务备案材料.md` — Blockchain filing materials
- `docs/filing/备案自行提交详细步骤.md` — Self-filing guide
- `docs/legal/用户协议.md` — User agreement
- `docs/legal/隐私政策.md` — Privacy policy

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  Mobile App       │  │  Web UI (index.html)             │ │
│  │  (React Native)   │  │  HTML/CSS/JS + i18n              │ │
│  │  KYC → Dashboard  │  │  Dashboard + Compliance          │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              API GATEWAY (Express.js - Port 3001)            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ JWT Auth      │ │ Sanctions    │ │ Compliance Routes    │ │
│  │ Middleware    │ │ Screening    │ │ /compliance/kyc/...  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ /employees   │ │ /credentials │ │ /payroll  /governance │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         SMART CONTRACTS (Solidity 0.8.19)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ComplianceEngine  │  EmployeeRegistry  │  PayrollExec│   │
│  │  CredentialRegistry│  BenefitsNFT(soul) │  HRGovernance│  │
│  │  DIDRegistry       │  HRAIOracle        │  DecentralizedHRS││
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
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
- See `docs/compliance/` for compliance documentation
- Check `README_zh.md` for Chinese documentation

---

## D-HRS SDK

The `sdk/` directory contains 3 independent components:

```
sdk/
├── packages/
│   ├── hr-contracts/       # HR smart contract library
│   ├── identity-system/    # DID + VC identity system
│   └── ai-oracle/          # AI prediction models
├── API_DOCUMENTATION.md
├── PERFORMANCE_OPTIMIZATION.md
└── SECURITY_AUDIT.md
```

---

**链聘通 (ChainHire) v2.0** — Built with Solidity, Node.js, and React Native. Designed for China compliance.
