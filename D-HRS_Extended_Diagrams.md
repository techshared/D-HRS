# D-HRS Extended Diagrams & Technical Details

> Additional diagrams for comprehensive of the visualization Decentralized HR System

---

## 1. Complete System Architecture with All Components

```mermaid
graph TB
    subgraph EXTERNAL["External Systems"]
        GOV[Government<br/>Registries]
        BANK[Bank &<br/>Payment Systems]
        EDU[Education<br/>Institutions]
        CERT[Certification<br/>Authorities]
    end
    
    subgraph CLIENT["Client Layer"]
        WEB[Web<br/>Application]
        MOB[Mobile<br/>Application]
        CLI[CLI<br/>Tool]
        API[API<br/>Consumers]
    end
    
    subgraph IDENTITY["Identity & Auth Layer"]
        DID[DID<br/>Registry]
        VC[Verifiable<br/>Credentials]
        CA[Certificate<br/>Authority]
        MFA[Multi-Factor<br/>Auth]
    end
    
    subgraph GATEWAY["API Gateway Layer"]
        KONG[Kong/NGINX]
        AUTH[mTLS<br/>Termination]
        RATE[Rate<br/>Limiter]
        WAF[WAF]
    end
    
    subgraph SERVICES["Microservices Layer"]
        EMP[Employee<br/>Service]
        REC[Recruitment<br/>Service]
        PAY[Payroll<br/>Service]
        BEN[Benefits<br/>Service]
        PERF[Performance<br/>Service]
        TIME[Time &<br/>Attendance]
        TRAIN[Training<br/>Service]
        COMPLIANCE[Compliance<br/>Service]
    end
    
    subgraph BLOCKCHAIN["Blockchain Network"]
        CONSENSUS[Consensus<br/>PoA+dPoS]
        TXMANAGER[Transaction<br/>Manager]
        CONTRACT[Smart<br/>Contract Engine]
        LEDGER[Distributed<br/>Ledger]
    end
    
    subgraph STORAGE["Storage Layer"]
        IPFS[IPFS<br/>Cluster]
        SQL[(PostgreSQL)]
        REDIS[(Redis Cache)]
        HSM[(HSM Keys)]
    end
    
    EXTERNAL --> IDENTITY
    CLIENT --> GATEWAY
    GATEWAY --> SERVICES
    SERVICES --> BLOCKCHAIN
    BLOCKCHAIN --> STORAGE
    
    IDENTITY --> GATEWAY
    EDU --> VC
    CERT --> VC
```

---

## 2. Employee Lifecycle on Blockchain

```mermaid
state    [*]Diagram-v2
 --> Candidate
    
    Candidate --> Applied: Submit Application
    Applied --> Screening: Pass Screening
    Screening --> Interview: Schedule Interview
    Interview --> Offer: Pass Interview
    Offer --> Onboarding: Accept Offer
    Onboarding --> Active: Complete Onboarding
    
    Active --> Promoted: Promotion
    Active --> Transfer: Internal Transfer
    Active --> Training: Skills Development
    Active --> Review: Performance Review
    Active --> Leave: Request Leave
    
    Promoted --> Active
    Transfer --> Active
    Training --> Active
    Review --> Active
    
    Leave --> Active: Return
    Leave --> Terminated: Resign/Fired
    
    Terminated --> [*]
    
    note right of Candidate: Stored as<br/>VC Credential
    note right of Active: Employment<br/>UTXO on Chain
    note right of Terminated: Final Settlement<br/>Smart Contract
```

---

## 3. Credential Verification Flow

```mermaid
sequenceDiagram
    participant Employee
    participant Wallet as Employee Wallet
    participant HR as HR System
    participant BC as Blockchain
    participant Issuer as Credential Issuer
    participant IPFS as IPFS Storage
    
    Employee->>Wallet: 1. Request Credential
    Wallet->>Issuer: 2. Verify Identity
    Issuer->>Wallet: 3. Issue Verifiable Credential
    Wallet->>IPFS: 4. Store Credential (Encrypted)
    IPFS-->>Wallet: 4a. Content Hash
    Wallet->>BC: 5. Register Credential Hash
    
    Employee->>HR: 6. Apply for Job
    HR->>Wallet: 7. Request Credentials
    Wallet->>Employee: 8. Show Credentials
    Employee->>Wallet: 9. Select & Share
    Wallet->>HR: 10. Present Verifiable Presentation
    
    HR->>BC: 11. Verify Credential
    BC-->>HR: 12. Valid (Hash Match)
    
    HR->>Issuer: 13. Revocation Check
    Issuer-->>HR: 14. Not Revoked
    
    HR->>Employee: 15. Application Accepted
```

---

## 4. Payroll Processing Flow

```mermaid
flowchart TD
    START[Payroll Cycle Start] --> SCHEDULE[Schedule<br/>Run]
    
    SCHEDULE --> FETCH[Fetch Time<br/>Records]
    FETCH --> BLOCKCHAIN{Verify from<br/>Blockchain?}
    
    BLOCKCHAIN -->|Yes| TIME[Time Records<br/>Valid]
    BLOCKCHAIN -->|No| ERROR[Error - Retry]
    
    TIME --> CALC[Calculate<br/>Gross Pay]
    CALC --> DEDUCT[Apply<br/>Deductions]
    DEDUCT --> NET[Calculate<br/>Net Pay]
    
    NET --> APPROVE{Approval<br/>Required?}
    
    APPROVE -->|Yes| MULTISIG[Multi-Sig<br/>Approval]
    APPROVE -->|No| AUTO[Auto-Approve]
    
    MULTISIG --> SIGN[Signatures<br/>Collected]
    SIGN --> PROCESS[Process<br/>Payment]
    AUTO --> PROCESS
    
    PROCESS --> CHANNEL{Payment<br/>Channel?}
    
    CHANNEL -->|Lightning| INSTANT[Instant<br/>Settlement]
    CHAIN -->|On-Chain| WAIT[Wait for<br/>Confirmation]
    TRADITIONAL -->|Bank Transfer| BATCH[Batch<br/>Processing]
    
    INSTANT --> RECORD[Record to<br/>Blockchain]
    WAIT --> RECORD
    BATCH --> RECORD
    
    RECORD --> LEDGER[(Immutable<br/>Ledger)]
    RECORD --> NOTIFY[Notify<br/>Employee]
    NOTIFY --> COMPLETE[Payroll<br/>Complete]
    
    ERROR --> RETRY[Retry]
    RETRY --> FETCH
```

---

## 5. Multi-Signature Approval Process

```mermaid
flowchart LR
    subgraph REQUEST["Approval Request"]
        ACTION[HR Action<br/>Hiring/Firing/<br/>Promotion]
        TYPE[Determine<br/>Required Signers]
    end
    
    subgraph SIGNERS["Signature Collection"]
        SIGNER1[Signer 1<br/>HR Manager]
        SIGNER2[Signer 2<br/>Department Head]
        SIGNER3[Signer 3<br/>Finance]
        SIGNER4[Signer 4<br/>Legal]
    end
    
    subgraph CONTRACT["Smart Contract"]
        THRESHOLD[N-of-M<br/>Threshold]
        TIMEOUT[Time<br/>Lock]
        EXECUTE[Execute<br/>Action]
    end
    
    REQUEST --> TYPE
    TYPE --> SIGNERS
    
    SIGNER1 -->|Sign| CONTRACT
    SIGNER2 -->|Sign| CONTRACT
    SIGNER3 -->|Sign| CONTRACT
    SIGNER4 -.->|Optional| CONTRACT
    
    CONTRACT --> THRESHOLD
    THRESHOLD -->|Signatures<br/>Met| TIMEOUT
    TIMEOUT -->|After<br/>Delay| EXECUTE
    
    THRESHOLD -.->|Not Met| REJECT[Auto-Reject<br/>After Timeout]
```

---

## 6. Smart Contract Architecture

```mermaid
graph TB
    subgraph ORCHESTRATOR["Orchestrator Contract"]
        ORCH[Main<br/>Orchestrator]
    end
    
    subgraph HR_CONTRACTS["HR Contracts"]
        EMP[Employee<br/>Registry]
        ROLE[Role<br/>Management]
        AUTH[Authorization<br/>Control]
    end
    
    subgraph PROCESS_CONTRACTS["Process Contracts"]
        RECRUIT[Recruitment<br/>Workflow]
        ONBOARD[Onboarding<br/>Automation]
        PAY[Payroll<br/>Executor]
        LEAVE[Leave<br/>Management]
    end
    
    subgraph UTILITY_CONTRACTS["Utility Contracts"]
        TOKEN[ERC-20<br/>Token]
        VAULT[Secure<br/>Vault]
        PROXY[Upgradeable<br/>Proxy]
    end
    
    ORCH --> EMP
    ORCH --> RECRUIT
    ORCH --> PAY
    
    EMP --> ROLE
    EMP --> AUTH
    
    RECRUIT --> ONBOARD
    PAY --> LEAVE
    
    ROLE --> TOKEN
    AUTH --> VAULT
    
    ORCH --> PROXY
```

---

## 7. Data Privacy & Encryption Architecture

```mermaid
flowchart TB
    subgraph USER["User Data Entry"]
        PII[Personal<br/>Information]
        SENSITIVE[Sensitive<br/>Data]
        DOCS[Documents]
    end
    
    subgraph ENCRYPTION["Encryption Layer"]
        SYMM[Symmetric Key<br/>AES-256]
        ASYMM[Asymmetric Key<br/>RSA/ECIES]
        FIELD[Field-Level<br/>Encryption]
    end
    
    subgraph STORAGE["Storage Decision"]
        CHAIN{Store on<br/>Blockchain?}
        ONCHAIN[On-Chain<br/>Hash Only]
        OFFCHAIN[Off-Chain<br/>Encrypted]
        IPFS[IPFS<br/>Encrypted]
    end
    
    subgraph ACCESS["Access Control"]
        ZKP[Zero-Knowledge<br/>Proof]
        PROOF[Proof of<br/>Eligibility]
        SELECTIVE[Selective<br/>Disclosure]
    end
    
    PII --> ENCRYPTION
    SENSITIVE --> ENCRYPTION
    DOCS --> ENCRYPTION
    
    ENCRYPTION --> SYMM
    ENCRYPTION --> ASYMM
    ENCRYPTION --> FIELD
    
    SYMM --> STORAGE
    ASYMM --> STORAGE
    FIELD --> STORAGE
    
    STORAGE --> ONCHAIN
    STORAGE --> OFFCHAIN
    STORAGE --> IPFS
    
    ONCHAIN --> ACCESS
    OFFCHAIN --> ACCESS
    IPFS --> ACCESS
    
    ACCESS --> ZKP
    ACCESS --> PROOF
    ACCESS --> SELECTIVE
```

---

## 8. Disaster Recovery & High Availability

```mermaid
graph TB
    subgraph REGION1["Primary Region"]
        LB1[Load Balancer]
        APP1[App Cluster 1]
        BC1[Blockchain Node 1]
        DB1[(Primary DB)]
    end
    
    subgraph REGION2["Secondary Region"]
        LB2[Load Balancer]
        APP2[App Cluster 2]
        BC2[Blockchain Node 2]
        DB2[(Replica DB)]
    end
    
    subgraph REGION3["Tertiary Region"]
        LB3[Load Balancer]
        APP3[App Cluster 3]
        BC3[Blockchain Node 3]
    end
    
    USER[Users] --> LB1
    USER --> LB2
    USER --> LB3
    
    LB1 --> APP1
    LB2 --> APP2
    LB3 --> APP3
    
    APP1 <-->|Sync| APP2
    APP2 <-->|Sync| APP3
    APP3 <-->|Sync| APP1
    
    BC1 <-->|P2P Sync| BC2
    BC2 <-->|P2P Sync| BC3
    
    DB1 -->|Replication| DB2
```

---

## 9. API Endpoints Structure

```mermaid
graph LR
    subgraph PUBLIC["Public API"]
        AUTH[/auth/**]
        PUBINFO[/public/**]
    end
    
    subgraph PRIVATE["Private API"]
        EMP[/api/employees/**]
        RECRUIT[/api/recruit/**]
        PAYROLL[/api/payroll/**]
        BENEFI[/api/benefits/**]
        PERF[/api/performance/**]
        TIME[/api/time/**]
    end
    
    subgraph ADMIN["Admin API"]
        SYS[/admin/**]
        CONFIG[/config/**]
        AUDIT[/audit/**]
    end
    
    subgraph BLOCKCHAIN["Blockchain API"]
        TX[/blockchain/tx/**]
        CONTRACT[/blockchain/contracts/**]
        CONTRACT --> TX
    end
    
    PUBLIC --> GATEWAY
    PRIVATE --> GATEWAY
    ADMIN --> GATEWAY
    BLOCKCHAIN --> GATEWAY
    
    GATEWAY --> RBAC{RBAC<br/>Check}
    RBAC -->|Allow| PROCESS
    RBAC -->|Deny| REJECT[401/403]
```

---

## 10. Complete ASCII Architecture

```
+=================================================================================+
|                        D-HRS COMPLETE ARCHITECTURE                              |
+=================================================================================+
|                                                                                  |
|  +=======================+                                                       |
|  |    EXTERNAL SYSTEMS  |                                                       |
|  +=======================+                                                       |
|    |         |        |        |         |                                        |
|    v         v        v        v         v                                        |
| +-------+ +-------+ +-------+ +-------+ +-------+                               |
| |Government| | Bank | | Edu   | |Cert   | | Other |                               |
| |Registries| |Systems| | Inst. | |Authority| | APIs |                               |
| +-------+ +-------+ +-------+ +-------+ +-------+                               |
|                                                                                  |
+=================================================================================+
|                                                                                  |
|  +=======================+                                                       |
|  |    CLIENT LAYER       |                                                       |
|  +=======================+                                                       |
|    |         |        |        |                                                  |
|    v         v        v        v                                                  |
| +-------+ +-------+ +-------+ +-------+                                          |
| |  Web  | |Mobile | |  CLI  | |  API  |                                          |
| |  App  | |  App  | |  Tool  | |Consumers|                                         |
| +-------+ +-------+ +-------+ +-------+                                          |
|                                                                                  |
+=================================================================================+
|                                    |                                             |
|                         mTLS + JWT + OAuth                                       |
|                                    v                                             |
|  +=======================+                                                       |
|  |   IDENTITY & AUTH    |                                                       |
|  +=======================+                                                       |
|    +---------+  +---------+  +---------+  +---------+                            |
|    |   DID   |  |   VC    |  |   CA    |  |   MFA   |                            |
|    | Registry|  | Verifier|  |         |  |         |                            |
|    +---------+  +---------+  +---------+  +---------+                            |
|                                                                                  |
+=================================================================================+
|                                    |                                             |
|                                    v                                             |
|  +=======================+                                                       |
|  |    API GATEWAY       |                                                       |
|  +=======================+                                                       |
|    +---------+  +---------+  +---------+  +---------+                            |
|    |  Kong/  |  |   mTLS  |  |  Rate   |  |   WAF   |                            |
|    | NGINX   |  |Terminal |  | Limiter |  |         |                            |
|    +---------+  +---------+  +---------+  +---------+                            |
|                                                                                  |
+=================================================================================+
|                                    |                                             |
|                                    v                                             |
|  +=======================+                                                       |
|  |  MICROSERVICES       |                                                       |
|  +=======================+                                                       |
|    |    |    |    |    |    |    |    |    |                                     |
|    v    v    v    v    v    v    v    v    v                                     |
| +-----+-----+-----+-----+-----+-----+-----+-----+                               |
| | EMP | REC | PAY | BEN |PERF| TIME|TRAIN|COMP |                               |
| | Svc | Svc | Svc | Svc | Svc| Svc| Svc | Svc |                               |
| +-----+-----+-----+-----+-----+-----+-----+-----+                               |
|                                                                                  |
+=================================================================================+
|                                    |                                             |
|                                    v                                             |
|  +=======================+                                                       |
|  |  BLOCKCHAIN NETWORK   |                                                       |
|  +=======================+                                                       |
|    |                                                        |                   |
|    v                                                        v                   |
| +----------------------------------+    +----------------------------------+     |
| |      CONSENSUS LAYER             |    |     SMART CONTRACT LAYER         |     |
| | +--------+ +--------+ +--------+ |    | +--------+ +--------+ +--------+ |     |
| | |Validator| |Validator| |Validator| |    | |Employee| |Payroll| |Benefits| |     |
| | | Node 1 | | Node 2 | | Node N | |    | |Contract| |Contract| |Contract| |     |
| | +--------+ +--------+ +--------+ |    | +--------+ +--------+ +--------+ |     |
| +----------------------------------+    +----------------------------------+     |
|                                                                                  |
| +======================================================================+        |
| |                    DISTRIBUTED LEDGER                               |        |
| |  +-------------------------------------------------------------+   |        |
| |  |  Block N: Employee Records, Credentials, Payroll, TXs     |   |        |
| |  |  Block N-1: ...                                             |   |        |
| |  |  Block N-2: ...                                             |   |        |
| |  +-------------------------------------------------------------+   |        |
| +======================================================================+        |
|                                                                                  |
+=================================================================================+
|                                    |                                             |
|                                    v                                             |
|  +=======================+                                                       |
|  |    STORAGE LAYER     |                                                       |
|  +=======================+                                                       |
|    +---------+  +---------+  +---------+  +---------+                            |
|    |  IPFS   |  |PostgreSQL|  |  Redis  |  |   HSM   |                            |
|    |Cluster  |  |   DB    |  |  Cache  |  | (Keys)  |                            |
|    +---------+  +---------+  +---------+  +---------+                            |
|                                                                                  |
+=================================================================================+
```

---

## 11. Security Event Timeline

```mermaid
sequenceDiagram
    participant User
    participant Gateway
    participant Services
    participant Blockchain
    participant Monitor
    participant Admin
    
    User->>Gateway: Normal Request
    Gateway->>Services: Forward
    Services->>Blockchain: Transaction
    Blockchain-->>Services: Confirm
    Services-->>Gateway: Response
    Gateway-->>User: Success
    
    Note over Monitor: Continuous Monitoring
    
    alt Suspicious Activity Detected
        Monitor->>Monitor: Anomaly Detection
        Monitor->>Gateway: Block Request
        Gateway-->>User: 403 Forbidden
        Monitor->>Admin: Alert
        Admin->>Blockchain: Freeze Account
    end
    
    alt Brute Force Attempt
        Monitor->>Gateway: Rate Limit
        Gateway-->>User: 429 Too Many Requests
        Monitor->>Admin: Security Alert
    end
    
    alt Credential Compromise
        User->>Gateway: Login Attempt
        Gateway->>Blockchain: Verify DID Status
        Blockchain-->>Gateway: Revoked
        Gateway-->>User: Account Locked
        Monitor->>Admin: Critical Alert
    end
```

---

## 12. Deployment Architecture

```mermaid
graph TB
    subgraph CLOUD["Cloud Provider (AWS/Azure/GCP)"]
        subgraph K8S["Kubernetes Cluster"]
            ING[Ingress<br/>Controller]
            
            subgraph APPS["Application Pods"]
                API[API<br/>Pods]
                WORKER[Worker<br/>Pods]
                JOBS[Job<br/>Pods]
            end
            
            subgraph BLOCKCHAIN["Blockchain Pods"]
                VAL[Validator<br/>Pods]
                RPC[RPC<br/>Pods]
            end
            
            subgraph DATA["Data Layer"]
                CACHE[Redis<br/>Cluster]
                QUEUE[Message<br/>Queue]
            end
        end
        
        MANAGED[Managed Services]
        OBJ[(Object<br/>Storage)]
    end
    
    CLOUD --> K8S
    K8S --> MANAGED
    K8S --> OBJ
    
    ING --> API
    API --> WORKER
    API --> JOBS
    
    WORKER --> VAL
    VAL --> RPC
    
    API --> CACHE
    API --> QUEUE
```

---

## 13. Technology Stack Summary Diagram

```mermaid
graph LR
    subgraph FRONTEND["Frontend"]
        REACT[React.js]
        VUE[Vue.js]
        RN[React Native]
    end
    
    subgraph BACKEND["Backend"]
        NODE[Node.js]
        GO[Go]
        JAVA[Java]
        RUST[Rust]
    end
    
    subgraph BLOCKCHAIN["Blockchain"]
        BESU[Hyperledger Besu]
        QUORUM[Quorum]
        CUSTOM[Custom Chain]
    end
    
    subgraph IDENTITY["Identity"]
        DID[DID/SSI]
        VC[W3C VC]
        OAUTH[OAuth2/OIDC]
    end
    
    subgraph STORAGE["Storage"]
        IPFS[IPFS]
        S3[S3/Object]
        PG[(PostgreSQL)]
    end
    
    subgraph INFRA["Infrastructure"]
        K8S[Kubernetes]
        DOCKER[Docker]
        TERRA[Terraform]
        VAULT[Vault]
    end
    
    FRONTEND --> BACKEND
    BACKEND --> BLOCKCHAIN
    BACKEND --> IDENTITY
    BACKEND --> STORAGE
    BACKEND --> INFRA
```

---

This completes the comprehensive D-HRS architecture with visual diagrams covering:
1. Complete system architecture
2. Employee lifecycle state machine
3. Credential verification flow
4. Payroll processing
5. Multi-signature approvals
6. Smart contract structure
7. Data privacy architecture
8. High availability design
9. API structure
10. Complete ASCII overview
11. Security event handling
12. Deployment architecture
13. Technology stack
