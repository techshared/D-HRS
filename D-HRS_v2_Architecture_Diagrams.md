# D-HRS v2.0 Enhanced Architecture Diagrams

> Visual diagrams with Mermaid.js - Render in GitHub, VS Code, Notion, etc.

---

## 1. Complete System Architecture (Mermaid)

```mermaid
graph TB
    subgraph EXTERNAL["External Systems"]
        GOV[Government<br/>Registries]
        BANK[Bank &<br/>Payment Systems]
        EDU[Education<br/>Institutions]
        CERT[Certification<br/>Authorities]
    end
    
    subgraph CLIENT["Client Layer"]
        WEB[Web<br/>Next.js 14]
        MOB[Mobile<br/>React Native]
        CLI[CLI<br/>Tool]
        ADMIN[Admin<br/>Dashboard]
    end
    
    subgraph AUTH["Auth & Identity Layer"]
        WA[WebAuthn<br/>Passkeys]
        DID[DID v2.0<br/>Registry]
        VC[Verifiable<br/>Credentials]
        ZKP[ZK-Prover<br/>Circom]
    end
    
    subgraph AA["Account Abstraction (ERC-4337)"]
        ENTRY[EntryPoint<br/>Contract]
        FACTORY[Account<br/>Factory]
        PAY[Paymaster<br/>Gasless]
        BUNDLER[Bundler<br/>Service]
    end
    
    subgraph GATEWAY["API Gateway"]
        KONG[Kong<br/>Gateway]
        MTLS[mTLS<br/>1.3]
        RATE[Rate<br/>Limiter]
    end
    
    subgraph SERVICES["Business Services"]
        EMP[Employee<br/>Service]
        REC[Recruit<br/>Service]
        PAY[Payroll<br/>Service]
        BEN[Benefits<br/>Service]
        PERF[Performance<br/>Service]
        AI[AI Agent<br/>Service]
    end
    
    subgraph L2["Layer 2 (zkSync/StarkNet)"]
        ZKSYNC[zkSync Era]
        STARK[StarkNet]
        ARB[Arbitrum]
    end
    
    subgraph ORACLE["Oracle Layer"]
        CCIP[Chainlink<br/>CCIP]
        FUNC[Functions<br/>AI/ML]
        VRF[VRF<br/>Random]
    end
    
    subgraph CONTRACTS["Smart Contracts"]
        REG[Employee<br/>Registry]
        CRED[Credential<br/>VC]
        PAYCON[Payroll<br/>Executor]
        TBA[Token Bound<br/>Accounts]
        GOV[Governance<br/>DAO]
    end
    
    subgraph STORAGE["Storage & Privacy"]
        FILECOIN[Filecoin<br/>Storage]
        CERAMIC[Ceramic<br/>Streams]
        TABLELAND[Tableland<br/>SQL]
        TEE[TEE<br/>Secure]
    end
    
    EXTERNAL --> AUTH
    CLIENT --> GATEWAY
    WA --> AA
    DID --> AA
    VC --> AA
    ZKP --> AA
    
    AA --> GATEWAY
    GATEWAY --> SERVICES
    SERVICES --> L2
    L2 --> ORACLE
    L2 --> CONTRACTS
    CONTRACTS --> STORAGE
    EDU --> VC
    CERT --> VC
```

---

## 2. Account Abstraction Flow

```mermaid
sequenceDiagram
    participant User
    participant Wallet as Smart Wallet
    participant Bundler
    participant EntryPoint
    participant Paymaster
    participant Blockchain
    
    Note over User,Blockchain: ERC-4337 Account Abstraction
    
    User->>Wallet: 1. Create UserOperation
    Wallet->>Wallet: 2. Sign with Key
    
    Wallet->>Bundler: 3. Submit UserOperation
    Bundler->>EntryPoint: 4. validateUserOp()
    
    EntryPoint->>Paymaster: 5. validatePaymasterUserOp()
    Paymaster-->>EntryPoint: 6. Return context
    
    EntryPoint->>EntryPoint: 7. Verify signature
    EntryPoint-->>Bundler: 8. Validation success
    
    Bundler->>Blockchain: 9. Include in batch
    Blockchain->>Blockchain: 10. Generate proof
    Blockchain-->>Bundler: 11. Receipt
    
    Bundler->>Wallet: 12. UserOp confirmed
    Wallet->>User: 13. Success notification
    
    Note over Paymaster: Company sponsors gas<br/>for employee operations
```

---

## 3. Identity & Credential Flow

```mermaid
flowchart TD
    subgraph ISSUANCE["Credential Issuance"]
        EMP[Employee] --> VERIFY[Identity Verify]
        VERIFY --> ISSUER[Issuer Authority]
        ISSUER --> VC[Create VC]
        VC --> STORE[Store on Ceramic/IPFS]
        STORE --> CHAIN[Register Hash on Chain]
    end
    
    subgraph VERIFICATION["Credential Verification"]
        REQUEST[Requester] --> PROVE[Generate Proof]
        PROVE --> ZK[ZK-SNARK Proof]
        ZK --> VERIFYVC[Verify VC]
        VERIFYVC --> CHECK[Check Revocation]
        CHECK --> RESULT[Allow/Deny]
    end
    
    subgraph COMPLIANCE["Privacy Features"]
        SELECT[Selective Disclosure]
        ZKPROOF[ZK Proof]
        RANGE[Range Proof]
    end
    
    ISSUANCE -.-> VERIFICATION
    SELECT --> ZKPROOF
    RANGE --> ZKPROOF
```

---

## 4. Multi-Chain Architecture

```mermaid
graph LR
    subgraph SOURCE["Source Chain"]
        ETH[ethereum]
    end
    
    subgraph DEST["Destination Chains"]
        POLY[Polygon]
        ARB[Arbitrum]
        OPT[Optimism]
        ZKS[zkSync]
    end
    
    subgraph OMNI["Omnichain Layer"]
        LZ[LayerZero]
        CCIP[Chainlink CCIP]
        AXEL[Axelar]
    end
    
    ETH --> LZ
    ETH --> CCIP
    ETH --> AXEL
    
    LZ --> POLY
    LZ --> ARB
    CCIP --> OPT
    CCIP --> ZKS
    AXEL --> POLY
    AXEL --> ARB
    
    subgraph DHRSCONTRACTS["D-HRS Contracts"]
        TOKEN[HR Token]
        NFT[Employee NFT]
        GOV[Governance]
    end
    
    LZ --> DHRSCONTRACTS
    CCIP --> DHRSCONTRACTS
    AXEL --> DHRSCONTRACTS
```

---

## 5. AI Integration Architecture

```mermaid
graph TB
    subgraph USER["User Request"]
        QUERY[Natural Language<br/>Query]
    end
    
    subgraph AI_ORACLE["AI Oracle Layer"]
        NLP[NLP Processor]
        MODEL[ML Models]
        ANALYZER[Analysis Engine]
    end
    
    subgraph CHAINLINK["Chainlink Network"]
        FUNC[Functions]
        VRF[VRF]
        KEEP[Keepers]
    end
    
    subgraph SMART_CONTRACT["Smart Contracts"]
        HR_CONTRACT[HR Contract]
        VERIFIER[Proof Verifier]
        EXECUTOR[Action Executor]
    end
    
    QUERY --> NLP
    NLP --> MODEL
    MODEL --> ANALYZER
    
    ANALYZER --> FUNC
    FUNC --> CHAINLINK
    CHAINLINK --> VERIFIER
    VERIFIER --> EXECUTOR
    EXECUTOR --> HR_CONTRACT
    
    VRF -.-> MODEL
    KEEP -.-> HR_CONTRACT
```

---

## 6. Privacy Architecture

```mermaid
graph LR
    subgraph INPUT["Sensitive Data"]
        PII[Personal Info]
        SAL[Salary Data]
        PERF[Performance]
    end
    
    subgraph ENCRYPTION["Protection Layer"]
        TEE[Intel SGX<br/>TEE]
        MPC[MPC<br/>Threshold]
        FHE[Fully Homomorphic<br/>Encryption]
    end
    
    subgraph PROOF["ZK Proofs"]
        SNARK[zkSNARK]
        STARK[zkSTARK]
        BB[Bulletproofs]
    end
    
    subgraph VERIFY["Verification"]
        VERIFYCON[Verify Contract]
        PROOFCON[Proof Contract]
    end
    
    PII --> TEE
    SAL --> MPC
    PERF --> FHE
    
    TEE --> SNARK
    MPC --> STARK
    FHE --> BB
    
    SNARK --> VERIFYCON
    STARK --> VERIFYCON
    BB --> PROOFCON
    
    VERIFYCON --> BLOCKCHAIN
    PROOFCON --> BLOCKCHAIN
```

---

## 7. Token Bound Account Flow

```mermaid
sequenceDiagram
    participant Employee
    participant NFT as Employee NFT
    participant TBA as Token Bound Account
    participant HR as HR Contract
    participant Payment as Payroll Token
    
    Note over Employee,TBA: ERC-6551 Token Bound Account
    
    Employee->>HR: 1. Mint Employee NFT
    HR->>NFT: 2. Create NFT (Employee ID)
    NFT->>TBA: 3. Deploy TBA (Smart Wallet)
    TBA-->>Employee: 4. TBA Address
    
    Note over Payment,TBA: Payroll Processing
    
    HR->>Payment: 5. Initiate Payroll
    Payment->>TBA: 6. Transfer Salary Tokens
    TBA->>TBA: 7. Auto-distribute (contract rules)
    
    Note over TBA: Internal logic<br/>- Tax deduction<br/>- Benefits allocation<br/>- Savings split
    
    TBA->>Employee: 8. Net Salary Received
    
    Note over Employee,HR: Employment Change
    
    Employee->>HR: 9. Role Change / Promotion
    HR->>NFT: 10. Update Metadata
    HR->>TBA: 11. Update Access Rights
    
    Note over TBA: Termination
    
    HR->>HR: 12. Terminate Employment
    HR->>TBA: 13. Revoke Permissions
    HR->>NFT: 14. Burn / Transfer NFT
```

---

## 8. Governance Architecture

```mermaid
graph TB
    subgraph PROPOSAL["Proposal Creation"]
        PROP[HR Proposal]
        VOTE[Voting Parameters]
    end
    
    subgraph VOTING["Voting Mechanism"]
        QUORUM[Quorum Check]
        WEIGHT[Token Weighted]
        DELEGATE[Delegation]
    end
    
    subgraph EXECUTION["Execution"]
        TIMELOCK[Timelock Controller]
        EXEC[Execute]
    end
    
    subgraph CONTRACTS["Governance Contracts"]
        GOV[Governance Token]
        TREASURY[Treasury]
    end
    
    PROP --> VOTE
    VOTE --> QUORUM
    QUORUM --> WEIGHT
    WEIGHT --> DELEGATE
    DELEGATE --> TIMELOCK
    TIMELOCK --> EXEC
    EXEC --> GOV
    EXEC --> TREASURY
```

---

## 9. Deployment Architecture

```mermaid
graph TB
    subgraph CLOUD["Cloud Infrastructure (AWS/GCP)"]
        subgraph K8S["Kubernetes Cluster"]
            subgraph APPS["Application Layer"]
                API[API Servers]
                WORKER[Background Workers]
                AI[AI Inference]
            end
            
            subgraph BLOCKCHAIN["Blockchain Layer"]
                NODE[Full Node]
                RPC[RPC Endpoint]
                INDEXER[Indexer]
            end
            
            subgraph DATA["Data Layer"]
                REDIS[Redis Cache]
                QUEUE[Message Queue]
            end
            
            subgraph SECURITY["Security"]
                VAULT[HashiCorp Vault]
                HSM[Cloud HSM]
            end
        end
        
        MANAGED["Managed Services"]
        OBJ[(S3/Blob Storage)]
    end
    
    subgraph BLOCKCHAIN_NETWORKS["Blockchain Networks"]
        L2_1[zkSync Era]
        L2_2[StarkNet]
        L2_3[Arbitrum]
    end
    
    CLOUD --> L2_1
    CLOUD --> L2_2
    CLOUD --> L2_3
    
    K8S --> MANAGED
    K8S --> OBJ
    API --> NODE
    WORKER --> NODE
    INDEXER --> NODE
```

---

## 10. Security Architecture

```mermaid
graph TB
    subgraph PERIMETER["Perimeter Security"]
        WAF[WAF]
        DDoS[DDoS Protection]
        VPN[VPN/Zero Trust]
    end
    
    subgraph TRANSPORT["Transport Security"]
        TLS[TLS 1.3]
        MTLS[Mutual TLS]
        CERT[Certificate Pinning]
    end
    
    subgraph APPLICATION["Application Security"]
        SAST[SAST/DAST]
        SCA[Dependency Scan]
        SECRETS[Secrets Rotation]
    end
    
    subgraph CONTRACT["Smart Contract Security"]
        AUDIT[Audit]
        FORMAL[Formal Verification]
        BUG[Immunefi Bug Bounty]
    end
    
    subgraph IDENTITY["Identity & Access"]
        RBAC[RBAC]
        MFA[MFA]
        ZKP[Zero Knowledge]
    end
    
    subgraph MONITORING["Monitoring & Response"]
        SIEM[SIEM]
        SOAR[SOAR]
        AUDIT[Immutable Audit]
    end
    
    PERIMETER --> TRANSPORT
    TRANSPORT --> APPLICATION
    APPLICATION --> CONTRACT
    CONTRACT --> IDENTITY
    IDENTITY --> MONITORING
```

---

## 11. Enhanced ASCII Architecture Diagram

```
+========================================================================================================+
|                                  D-HRS v2.0 SYSTEM ARCHITECTURE                                       |
+========================================================================================================+
|                                                                                                        |
|  +======================+     +======================+     +======================+                      |
|  |   CLIENT LAYER      |     |   EXTERNAL SYSTEMS  |     |   AI SYSTEMS        |                      |
|  +======================+     +======================+     +======================+                      |
|  |  +----+  +----+     |     |  +----+  +----+     |     |  +----+  +----+     |                      |
|  |  |Web |  |App |     |     |  |Gov |  |Bank|     |     |  |AI  |  |ML  |     |                      |
|  |  |Next|  |React      |     |  |    |  |    |     |     |  |Chat|  |Models    |                      |
|  |  +----+  +----+     |     |  +----+  +----+     |     |  +----+  +----+     |                      |
|  +==========+==========+     +==========+==========+     +==========+==========+                      |
|                 |                       |                       |                                        |
|                 +-----------------------+-----------------------+                                        |
|                                             |                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                                    AUTHENTICATION & IDENTITY                                          |   |
|  +====================================================================================================+   |
|  |                                                                                                        |   |
|  |  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    |   |
|  |  │                           ACCOUNT ABSTRACTION (ERC-4337)                                       │    |   |
|  |  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │    |   |
|  |  │   │EntryPoint│    │ Account  │    │ Paymaster│    │ Bundler │    │ Factory  │             │    |   │
|  |  │   │Contract  │    │          │    │(Gasless) │    │ Service │    │          │             │    |   |
|  |  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘             │    |   |
|  |  └──────────────────────────────────────────────────────────────────────────────────────────────┘    |   |
|  |                                                                                                        |   |
|  |  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    |   |
|  |  │                              IDENTITY STACK v2.0                                               │    |   |
|  |  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │    |   |
|  |  │   │WebAuthn │    │    DID   │    │    VC    │    │    ZKP   │    │ Social   │             │    |   |
|  |  │   │Passkeys │    │ Registry │    │ Verifier │    │  Prover  │    │ Recovery │             │    |   |
|  |  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘             │    |   |
|  |  └──────────────────────────────────────────────────────────────────────────────────────────────┘    |   |
|  +====================================================================================================+   |
|                                             │                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                                    API GATEWAY LAYER                                                  |   |
|  +====================================================================================================+   |
|  |   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                       |   |
|  |   │   Kong   │    │   mTLS   │    │  Rate    │    │   Auth   │    │   WAF    │                       |   |
|  |   │ Gateway  │    │   1.3    │    │ Limiter  │    │  (JWT)   │    │          │                       |   |
|  |   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘                       |   |
|  +====================================================================================================+   |
|                                             │                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                                 BUSINESS SERVICES LAYER                                               |   |
|  +====================================================================================================+   |
|  |    +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |   |
|  |    │Employee│ │Recruit │ │Payroll │ │Benefits│ │Performance│ │ Time  │ │  AI   │ │Notif  │         |   |
|  |    │Service │ │Service │ │Service │ │Service │ │ Service │ │Service │ │Service │ │Service │         |   |
|  |    +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+         |   |
|  +====================================================================================================+   |
|                                             │                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                              BLOCKCHAIN ORCHESTRATION                                                  |   |
|  +====================================================================================================+   |
|  |                                                                                                        |   |
|  |  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    |   |
|  |  │                                ORACLE LAYER                                                      │    |   |
|  |  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │    |   |
|  |  │   │  CCIP   │    │Functions │    │   VRF    │    │Automation│    │   DON   │             │    |   |
|  |  │   │(X-Chain)│    │  (AI/ML) │    │(Random)  │    │ (Cron)   │    │          │             │    |   |
|  |  │   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘             │    |   |
|  |  └──────────────────────────────────────────────────────────────────────────────────────────────┘    |   |
|  +====================================================================================================+   |
|                                             │                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                                   LAYER 2 BLOCKCHAIN                                                  |   |
|  +====================================================================================================+   |
|  |                                                                                                        |   |
|  |  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    |   |
|  |  │                               zkSync Era / StarkNet / Arbitrum                                │    |   |
|  |  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │    │   |
|  |  │  │                                   CONSENSUS                                             │    │    │   |
|  |  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │    │    │   |
|  |  │  │  │Validator│  │Proposer │  │Sequencer│  │Prover   │  │Batcher  │  │ Indexer │      │    │    │   |
|  |  │  │  │  (PoS)  │  │         │  │         │  │ (zkSNARK)│  │         │  │         │      │    │    │   |
|  |  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │    │    │   |
|  |  │  └──────────────────────────────────────────────────────────────────────────────────────┘    │    │   |
|  |  │                                                                                                    |    │   |
|  |  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │    │   |
|  |  │  │                                SMART CONTRACTS                                           │    │    │   |
|  |  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │    │    │   │
|  |  │  │  │Employee│ │Credential│ │Payroll │ │Benefits│ │  TBA   │ │Govern  │ │  DID   │      │    │    │   │
|  |  │  │  │Registry│ │ Registry │ │Executor│ │  NFT   │ │Registry│ │  DAO   │ │Registry│      │    │    │   │
|  |  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │    │    │   |
|  |  │  └──────────────────────────────────────────────────────────────────────────────────────┘    │    │   |
|  |  └──────────────────────────────────────────────────────────────────────────────────────────────┘    |   |
|  |                                                                                                        |   |
|  |  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    |   |
|  |  │                              DISTRIBUTED LEDGER                                               │    |   |
|  |  │  ┌────────────────────────────────────────────────────────────────────────────────────┐     │    │   |
|  |  │  │  Block N: Employee Records, Credentials, Payroll TXs, Governance Votes             │     │    │   |
|  |  │  │  Block N-1: ...                                                                │     │    │   |
|  |  │  │  Block N-2: ...                                                                │     │    │   |
|  |  │  │                                    Merkle Root: 0xABC... (ZK Verified)             │     │    │   |
|  |  │  └────────────────────────────────────────────────────────────────────────────────────┘     │    │   |
|  |  └──────────────────────────────────────────────────────────────────────────────────────────────┘    |   |
|  +====================================================================================================+   |
|                                             │                                                                |
|                                             ▼                                                                |
|  +====================================================================================================+   |
|  |                                STORAGE & PRIVACY LAYER                                               |   |
|  +====================================================================================================+   |
|  |   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                       |   |
|  |   │ Filecoin │    │ Ceramic  │    │Tableland │    │   TEE    │    │   MPC    │                       |   |
|  |   │(Storage) │    │(Streams) │    │   (SQL)   │    │(Secure)  │    │(Threshold)│                      |   |
|  |   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘                       |   |
|  +====================================================================================================+   |
|                                                                                                        |
+========================================================================================================+
```

---

This completes the enhanced architecture diagrams with the latest Web3 technologies including:
- ERC-4337 Account Abstraction
- Layer 2 scaling (zkSync, StarkNet, Arbitrum)
- Chainlink CCIP and Functions
- Token Bound Accounts (ERC-6551)
- Zero-Knowledge Proofs
- AI Oracle integration
- Multi-chain interoperability
