# D-HRS v2.0 — HR 区块链合规存证引擎

**链聘通 (ChainHire)** —— 面向中国企业的人力资源合规存证系统。通过区块链不可篡改审计轨迹 + 等保三级合规体系 + 实名认证（KYC）实现 HR 流程的司法级证据链。不发币、不上链工资、不碰监管红线。

![D-HRS](https://img.shields.io/badge/version-2.0-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Compliance](https://img.shields.io/badge/等保三级-准备中-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 一句话定位

**把 HR 关键操作变成不可篡改的审计证据，合规成本降到十分之一。**

D-HRS 不是一个"去中心化HR系统"——它是一个 **HR 合规存证中间件**。每个员工入转调离、薪资审批、绩效评估都被哈希上链存证，形成完整审计链。不上链任何隐私数据（PIPL合规），不发币（924通知合规），不替代现有 HR 系统——而是给现有系统加上合规层。

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
- ❌ 不是开源玩具——是真的为了通过审计而设计

### 技术栈

| 层级 | 技术 |
|------|------|
| 智能合约 | Solidity 0.8.19 |
| 区块链 | Ethereum / Hardhat（联盟链友好） |
| 后端 | Node.js + Express |
| 前端 | HTML/CSS/JavaScript |
| 移动端 | React Native / Expo（Hermes 引擎） |
| 合规层 | ComplianceEngine.sol + 后端 KYC/制裁中间件 |
| 身份系统 | DID、VC、选择性披露 |
| AI 预言机 | ML 模型、链上验证 |
| 国际化 | i18next（EN/中文） |

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

## 合规架构

专为中国监管环境设计。合规层包括：

### ComplianceEngine.sol

链上合规引擎，强制执行：
- **实名认证（KYC）** — 用户在访问 HR 功能前必须完成身份验证
- **制裁名单筛查** — OFAC SDN + 中国外交部制裁名单检查
- **合规守卫** — `guard()` 和 `guardWithLevel()` 函数在任何 HR 操作前强制合规

### 后端合规中间件

- **JWT 认证** — 基于 Token 的会话管理
- **制裁名单筛查** — 实时地址检查
- **KYC 状态跟踪** — 用户认证等级管理

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/compliance/kyc/initiate` | POST | 发起实名认证 |
| `/api/v1/compliance/status/:address` | GET | 查询 KYC 状态 |
| `/api/v1/compliance/dashboard` | GET | 合规统计面板 |
| `/api/v1/compliance/sanctions` | GET | 查看制裁名单 |
| `/api/v1/compliance/sanctions/check` | POST | 检查地址是否在制裁名单 |
| `/api/v1/compliance/users` | GET | 列出所有已认证用户 |

### 法规合规

| 法规 | 状态 | 实现 |
|------|------|------|
| 924 通知（虚拟货币禁令） | ✅ 100% | 无代币/钱包/加密货币功能 |
| 区块链信息服务管理规定 | ✅ 85% | 实名认证+内容审核+用户协议+备案材料就绪，合约已集成合规守卫 |
| 个人信息保护法 | ✅ 95% | 用户同意+查阅/更正/删除权+敏感字段加密（AES-256） |
| 数据安全法 | ✅ 85% | 数据分级+本地化+风险评估+加密 |
| 网络安全法 + 等保 2.0 | ⚠️ 55% | 管理制度已建立，技术整改进行中 |
| 智能合约审计 | ✅ 70% | 自审计完成+35项合约测试通过，第三方审计待做 |

**总体合规度：85%**（免费可实现措施已全部完成）

---

## 智能合约

### 合约概览

| 合约 | 用途 | 关键特性 |
|------|------|---------|
| `ComplianceEngine.sol` | 合规引擎 | KYC 状态、制裁名单、合规守卫 |
| `EmployeeRegistry.sol` | 员工管理 | DID 注册、角色/部门、合规守卫（无链上薪资） |
| `CredentialRegistry.sol` | 可验证凭证 | W3C VC 颁发、验证、吊销 |
| `PayrollExecutor.sol` | 薪资审批工作流 | 多签审批、链上审计轨迹（无支付） |
| `BenefitsNFT.sol` | 员工福利 | Soulbound NFT（不可转让） |
| `HRGovernance.sol` | DAO 治理 | 提案、投票、执行 |
| `DIDRegistry.sol` | 去中心化标识符 | DID 创建、更新、认证 |
| `HRAIOracle.sol` | AI 预言机 | 薪资基准、绩效评分 |
| `DecentralizedHRS.sol` | HR 操作 | 招聘、评估、晋升、裁员 |

### 合约集成

所有合约均已接入 `ComplianceEngine.guard()` 进行链上合规检查。部署顺序：
1. `ComplianceEngine` → 独立部署
2. `EmployeeRegistry(complianceEngine)` → 接收合规引擎地址
3. `DecentralizedHRS.setComplianceEngine()` → 部署后关联

### 安全特性

- **OpenZeppelin AccessControl** — 基于角色的权限控制（HR_ADMIN、FINANCE、EXECUTOR 等）
- **Pausable** — 所有合约紧急停止
- **ReentrancyGuard** — 防重入攻击
- **速率限制** — 100 次/天，1 分钟冷却
- **输入验证** — 地址、DID、角色、部门验证
- **Soulbound NFT** — BenefitsNFT 阻止所有转让（仅允许 mint/burn）
- **合规守卫** — 所有写操作通过 ComplianceEngine 检查 KYC + 制裁名单

### 合约测试

```
33 passing (614ms)
0 failing
```

测试覆盖 7 个模块共 33 个测试用例：EmployeeRegistry、CredentialRegistry、BenefitsNFT、HRGovernance、DIDRegistry、DecentralizedHRS、ComplianceEngine。

---

## 移动端应用

基于 React Native + Expo，使用 Hermes 引擎。已测试设备：Meizu M2 Note（Android 5.1 / API 22）。

![移动端仪表盘](screen_app.png)

*仪表盘视图 — 显示员工数量、凭证统计和薪资汇总*

### 截图

| 仪表盘 | 薪资 |
|--------|------|
| ![仪表盘](screen_app.png) | ![薪资](screen_payroll.png) |

### 功能特性

- **实名认证** — 首屏 KYC 流程（AsyncStorage 持久化）
- **中英双语** — i18next 语言切换
- **仪表盘** — 系统概览（员工数、凭证、提案）
- **员工管理** — 通过 API 注册和管理员工
- **凭证管理** — 颁发和验证可验证凭证
- **薪资审批** — 创建和审批薪资结算（仅审批工作流）
- **治理** — 创建提案和投票
- **合规面板** — KYC 统计和制裁监控

### 构建与安装

```bash
cd mobile
npm install

cd android
./gradlew.bat assembleDebug
# 输出：app/build/outputs/apk/debug/app-debug.apk (~64 MB)
```

### Flyme PRD 固件安装

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

或使用一键启动脚本：`mobile/scripts/start-mobile.bat`

### ADB 反向代理

```bash
adb reverse tcp:3001 tcp:3001
```

---

## Web UI

独立的 HTML/CSS/JS 应用，支持原生 JavaScript i18n。

### 访问地址

```
http://localhost:8001/index.html
```

### 功能特性

- 系统概览仪表盘
- 员工管理
- 薪资状态概览
- 可验证凭证
- HR 治理提案
- **合规面板** — KYC 发起、制裁检查、合规统计

---

## 国际化（i18n）

移动端和 Web 均支持**中英文双语切换**。

| 平台 | 库 | 切换方式 |
|------|----|----------|
| 移动端 | `i18next` + `react-i18next` | 右上角 `EN`/`中文` 按钮 |
| Web UI | 原生 JavaScript | 右上角语言切换 |

### 翻译文件

| 文件 | 说明 |
|------|------|
| `mobile/src/i18n/locales/en.json` | 英文翻译（含 kyc、compliance 等） |
| `mobile/src/i18n/locales/zh.json` | 中文翻译 |
| `mobile/src/i18n/index.ts` | 内联翻译数据 |

---

## 后端 API

### 合约地址

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

### API 状态

| 服务 | 状态 | 端口 |
|------|------|------|
| **后端 API** | ✅ 运行中 | 3001 |
| **Web UI** | ✅ 运行中 | 8001 |

---

## 安全

### 已实现的安全特性

- **基于角色的访问控制（RBAC）** — OpenZeppelin AccessControl
- **可暂停合约** — 紧急停止功能
- **重入保护** — 防重入攻击
- **速率限制** — 100 次/天/账户
- **输入验证** — 地址、DID、角色验证
- **JWT 认证** — 基于 Token 的会话管理
- **合规中间件** — 所有敏感端点制裁筛查
- **Soulbound NFT** — 不可转让福利代币

### 安全审计

详见 `SECURITY_AUDIT.md` 获取详细安全分析与建议。

### 合规文档

- `docs/compliance/01-信息安全总体方针.md`
- `docs/compliance/02-网络安全管理制度.md`
- `docs/compliance/03-主机安全管理制度.md`
- `docs/compliance/04-应用安全管理制度.md`
- `docs/compliance/05-数据安全管理制度.md`
- `docs/compliance/06-安全组织机构管理制度.md`
- `docs/compliance/07-人员安全管理制度.md`
- `docs/compliance/08-安全建设管理制度.md`
- `docs/compliance/09-安全运维管理制度.md`
- `docs/compliance/10-安全应急响应预案.md`
- `docs/compliance/11-安全教育培训制度.md`
- `docs/compliance/12-备份与恢复管理制度.md`
- `docs/compliance/等保三级差距评估自查清单.md`
- `docs/compliance/等保三级测评详细步骤.md`
- `docs/compliance/智能合约安全审计准备.md`
- `docs/compliance/第三方合约审计详细步骤.md`
- `docs/compliance/数据安全风险评估报告.md`
- `docs/filing/区块链信息服务备案材料.md`
- `docs/filing/备案自行提交详细步骤.md`
- `docs/legal/用户协议.md`
- `docs/legal/隐私政策.md`

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    展示层                                     │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  移动端 App       │  │  Web UI (index.html)             │ │
│  │  (React Native)   │  │  HTML/CSS/JS + i18n              │ │
│  │  KYC → 仪表盘     │  │  仪表盘 + 合规面板               │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              API 网关 (Express.js - 端口 3001)                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ JWT 认证      │ │ 制裁名单     │ │ 合规路由             │ │
│  │ 中间件        │ │ 筛查         │ │ /compliance/kyc/...  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ /employees   │ │ /credentials │ │ /payroll /governance  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         智能合约 (Solidity 0.8.19)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ComplianceEngine  │  EmployeeRegistry  │  PayrollExec│   │
│  │  CredentialRegistry│  BenefitsNFT(soul) │  HRGovernance│  │
│  │  DIDRegistry       │  HRAIOracle        │  DecentralizedHRS││
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 许可证

MIT 许可证 — 详见 LICENSE 文件

---

## 支持

问题与反馈：
- 查看智能合约测试获取使用示例
- 查看 `backend/src/index.js` 中的 API 端点
- 查看 `index.html` 中的 Web UI 实现
- 查看 `SECURITY_AUDIT.md` 获取安全细节
- 查看 `docs/compliance/` 获取合规文档

---

## 链聘通 SDK

`sdk/` 目录包含 3 个独立组件：

```
sdk/
├── packages/
│   ├── hr-contracts/       # HR 智能合约库
│   ├── identity-system/    # DID + VC 身份系统
│   └── ai-oracle/          # AI 预测模型
├── API_DOCUMENTATION.md
├── PERFORMANCE_OPTIMIZATION.md
└── SECURITY_AUDIT.md
```

---

**链聘通 (ChainHire) v2.0** — 基于 Solidity、Node.js 和 React Native 构建，专为中国合规设计。
