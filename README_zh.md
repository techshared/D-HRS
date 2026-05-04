# 链聘通 (ChainHire) v2.0 - 去中心化人力资源系统

新一代去中心化人力资源系统，融合Layer 2扩容、ERC-4337账户抽象、DID/VC身份认证、AI预言机与隐私保护技术。

![链聘通](https://img.shields.io/badge/version-2.0-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## 概述
链聘通 (ChainHire) 是基于区块链的HR管理平台，通过去中心化、透明化与加密安全技术，重构传统人力资源流程。

### 核心功能
- **员工管理** - 链上员工注册、信息更新与全周期追踪
- **可验证凭证** - 符合W3C标准的VC颁发与验证
- **福利NFT** - 基于ERC-721的福利管理
- **治理DAO** - 去中心化HR政策决策
- **DID身份** - 自主主权去中心化标识符
- **AI预言机** - 智能薪资基准与绩效评分
- **去中心化员工评估** - 多评估者绩效评审与争议解决
- **去中心化招聘** - 链上职位发布、申请与招聘流程
- **去中心化晋升/降职** - 透明化晋升评审（含同事与管理者评分）
- **去中心化薪资调整** - 透明化薪资增减提案
- **去中心化岗位调动** - 跨部门调动申请与审批流程
- **去中心化裁员管理** - 规范化裁员流程（含通知期与遣散费）

### 技术栈
| 层级 | 技术 |
|-------|------|
| 智能合约 | Solidity 0.8.19 |
| 区块链 | Ethereum / Hardhat |
| 后端 | Node.js + Express |
| 前端 | HTML/CSS/JavaScript (viem.js) |
| 移动端 | React Native / Expo |
| 测试 | Hardhat Tests |

---

## 为什么选择链聘通？

### 传统HR系统 vs 链聘通
| 维度 | 传统HR系统 | 链聘通 |
|------|------------|--------|
| **数据存储** | 中心化数据库（单点故障） | 分布式账本（无单点故障） |
| **验证方式** | 人工文档验证 | 加密证明与验证 |
| **透明度** | 决策不透明 | 透明可审计流程 |
| **数据控制** | 企业拥有所有员工数据 | 员工自主控制凭证 |
| **互操作性** | 孤岛系统，无数据共享 | 跨组织可移植凭证 |
| **自动化** | 人工流程，易出错 | 智能合约确保精准执行 |
| **成本** | 高管理成本，中间商 | 减少中介，更低费用 |
| **安全性** | 易受数据泄露 | 加密安全，不可篡改记录 |

### 核心优势
#### 1. 增强安全性与隐私
- **不可篡改记录**：所有员工数据经加密存储在区块链上
- **防篡改**：一旦记录，未经共识无法修改HR数据
- **加密验证**：无需信任中心机构即可数学验证凭证
- **选择性披露**：员工可证明特定属性而无需泄露不必要个人信息（零知识证明）

#### 2. 降低成本
- **消除中间商**：点对点凭证验证
- **自动化流程**：智能合约减少人工HR管理
- **减少欺诈**：加密验证防止假凭证与薪资篡改
- **更低交易成本**：Layer2方案支持低成本微交易

#### 3. 员工赋能
- **自主身份**：员工自主控制个人凭证与职业数据
- **可移植凭证**：工作凭证随员工跨企业流转
- **透明薪酬**：薪酬区间与薪资标准可链上验证

#### 4. 运营效率
- **即时验证**：凭证验证从数周缩短至数秒
- **自动化薪资**：智能合约按计划自动发放薪资
- **实时更新**：员工状态变更即时同步全系统
- **简化入职**：数字凭证消除纸质流程

#### 5. AI驱动洞察
- **薪资基准**：AI预言机提供市场竞品薪资建议
- **绩效评分**：数据驱动的员工绩效指标
- **市场趋势**：实时HR市场数据整合

#### 6. 信任与透明
- **可审计轨迹**：所有HR操作链上记录，可问责
- **公平决策**：治理DAO确保民主HR政策
- **平等访问**：所有利益相关者可验证系统状态
- **争议解决**：不可篡改记录提供确凿证据

### 使用场景
#### 企业用户
- **验证候选人**：即时验证教育与就业凭证
- **简化入职**：入职时间从数天缩短至数分钟
- **自动化薪资**：设置即忘薪资发放
- **AI洞察**：数据驱动薪酬决策

#### 员工用户
- **自主数据**：控制谁查看你的凭证
- **即时就业证明**：即时证明就业状态
- **可移植凭证**：携带已验证凭证到新工作

#### HR从业者
- **减少管理负担**：自动化重复性任务
- **更好决策**：即时访问已验证数据
- **聚焦员工**：减少文书工作，更多关注员工
- **合规简化**：内置审计轨迹满足监管要求

---

## 项目结构
```
链聘通/
├── contracts/                 # 智能合约
│   ├── src/
│   │   ├── EmployeeRegistry.sol
│   │   ├── CredentialRegistry.sol
│   │   ├── PayrollExecutor.sol
│   │   ├── BenefitsNFT.sol
│   │   ├── HRGovernance.sol
│   │   ├── DIDRegistry.sol
│   │   ├── HRToken.sol
│   │   ├── HRAIOracle.sol         # AI驱动的预言机
│   │   └── DecentralizedHRS.sol   # 新增：去中心化HR功能
│   ├── test/
│   │   └── d-hrs.test.js
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── generate-account.js
│   ├── hardhat.config.js
│   └── deployment-addresses.json
├── backend/                   # Express API服务器
│   ├── src/
│   │   └── index.js
│   └── package.json
├── mobile/                    # React Native应用（新增）
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── index.html                 # 独立Web UI（使用viem.js）
├── SECURITY_AUDIT.md          # 安全审计报告
├── test-runner.js            # 端到端测试运行器
├── README.md                 # 英文说明文档
└── README_zh.md              # 中文说明文档
```

---

## 快速开始

### 1. 克隆与安装依赖
```bash
# 安装智能合约依赖
cd contracts
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2. 启动本地Hardhat节点
```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```
启动本地以太坊节点，包含20个测试账户（每个账户10000 ETH）。

### 3. 部署智能合约
```bash
# 新终端
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### 4. 运行单元测试
```bash
cd contracts
npx hardhat test
```

### 5. 启动后端API
```bash
cd backend
npm start
```
后端运行在 `http://localhost:3001`

### 6. 启动Web UI
```bash
# 项目根目录
python3 -m http.server 8001
```

---

## 运行完整系统

### 终端1：Hardhat节点
```bash
cd contracts
npx hardhat node --hostname 127.0.0.1 --port 9555
```

### 终端2：部署合约
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localnode
```

### 终端3：后端API
```bash
cd backend
npm start
```

### 终端4：Web UI
```bash
python3 -m http.server 8001
```

### 访问入口
| 服务 | URL |
|------|-----|
| **Web UI** | http://localhost:8001/index.html |
| **后端API** | http://localhost:3001 |
| **API健康检查** | http://localhost:3001/api/v1/health |
| **Hardhat RPC** | http://127.0.0.1:9555 |

---

## 测试结果
```
  链聘通合约测试
    员工注册合约
      ✓ 应成功注册新员工
      ✓ 应成功更新员工信息
      ✓ 应成功终止员工
    凭证注册合约
      ✓ 应成功颁发凭证
      ✓ 应成功验证凭证
      ✓ 应成功撤销凭证
    福利NFT合约
      ✓ 应成功铸造福利NFT
      ✓ 应成功查询员工福利
    治理合约
      ✓ 应成功创建提案
      ✓ 应成功投票
    DID注册合约
      ✓ 应成功创建DID
      ✓ 应成功更新DID
    去中心化HR功能
      员工评估
        ✓ 应成功创建评估
        ✓ 应成功完成评估并评分
        ✓ 应成功争议评估
      招聘与职位发布
        ✓ 应成功创建职位
        ✓ 应成功提交申请
        ✓ 应成功更新职位状态
        ✓ 应成功更新申请状态
      晋升评审
        ✓ 应成功发起晋升评审
        ✓ 应成功批准晋升
      薪资调整
        ✓ 应成功提议薪资调整
        ✓ 应成功批准薪资调整
      岗位调动
        ✓ 应成功请求岗位调动
        ✓ 应成功批准岗位调动
      裁员管理
        ✓ 应成功提议裁员
        ✓ 应成功批准裁员
      岗位等级
        ✓ 应成功查询所有岗位等级
        ✓ 应成功更新岗位等级
      互动沟通
        ✓ 应成功添加评估反馈

  18项测试全部通过
```

---

## 安全

### 已实现的安全特性
- **基于角色的访问控制（RBAC）**：使用OpenZeppelin AccessControl
- **可暂停合约**：紧急停止功能
- **重入保护**：防止重入攻击
- **速率限制**：防止合约函数滥用
- **输入验证**：全面的参数验证

### 安全审计
详见 `SECURITY_AUDIT.md` 获取详细安全分析与建议。

---

## 移动端应用（Beta）
移动端应用位于 `mobile/` 目录，运行方式：
```bash
cd mobile
npm install
npm start
```
功能：
- 通过MetaMask连接钱包
- 查看仪表盘与统计信息
- 移动端管理员工
- 查看与投票治理提案

---

## 部署到公共测试网

### Sepolia测试网
1. 从 https://sepoliafaucet.com 获取SepoliaETH
2. 从 https://dashboard.alchemy.com 获取Alchemy API密钥
3. 在 `contracts/` 目录创建 `.env` 文件：
```env
PRIVATE_KEY=你的私钥（不含0x前缀）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/你的API密钥
ETHERSCAN_API_KEY=你的etherscan API密钥
```
4. 部署：
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 架构
```
┌─────────────────────────────────────────────┐
│           展示层                               │
│    （Web UI - index.html / 移动端应用）      │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│               API网关                        │
│          （Express.js - 端口3001）           │
└─────────────────┬───────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         区块链网络                            │
│    （Hardhat本地 / 测试网 / 主网）          │
│  ┌──────────────────────────────────────┐   │
│  │  员工注册合约  │ 凭证注册合约  │   │
│  │  薪资执行合约  │ 福利NFT合约    │   │
│  │  治理合约      │ DID注册合约    │   │
│  │  AI预言机      │ HR代币合约     │   │
│  │  去中心化HR合约 │                │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 许可证
MIT许可证 - 详见LICENSE文件

---

## 支持
问题与反馈：
- 查看智能合约测试获取使用示例
- 查看 `backend/src/index.js` 中的API端点
- 查看 `index.html` 中的Web UI实现
- 查看 `SECURITY_AUDIT.md` 获取安全细节

---

