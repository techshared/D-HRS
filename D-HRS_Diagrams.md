# D-HRS Architecture Diagrams

> These diagrams can be rendered in markdown viewers that support Mermaid.js (GitHub, VS Code, Notion, etc.)

---

## Diagram 1: High-Level Architecture

```mermaid
graph TB
    subgraph CLIENT["Presentation Layer"]
        WEB[Web App]
        MOBILE[Mobile App]
        ADMIN[Admin Portal]
    end
    
    subgraph GATEWAY["API Gateway"]
        AUTH[mTLS Gateway]
        RATE[Rate Limiter]
        WAF[WAF Security]
    end
    
    subgraph SERVICES["Business Services Layer"]
        HR[HR Services Node]
        EMP[Employee Self-Service]
        AUD[Audit & Compliance]
    end
    
    subgraph BLOCKCHAIN["Blockchain Network"]
        CONSENSUS[Consensus Layer<br/>PoA + dPoS]
        CONTRACTS[Smart Contracts]
        LEDGER[Distributed Ledger]
    end
    
    subgraph STORAGE["Storage Layer"]
        IPFS[IPFS Cluster]
        DB[(Off-Chain DB)]
    end
    
    CLIENT --> GATEWAY
    WEB --> AUTH
    MOBILE --> AUTH
    ADMIN --> AUTH
    
    GATEWAY --> SERVICES
    HR --> BLOCKCHAIN
    EMP --> BLOCKCHAIN
    AUD --> BLOCKCHAIN
    
    BLOCKCHAIN --> STORAGE
    IPFS <--> DB
```

---

## Diagram 2: Mutual Authentication Flow

```mermaid
sequenceDiagram
    participant Client as Employee/HR Client
    participant Gateway as API Gateway
    participant Blockchain as Blockchain Network
    participant DID as DID Registry
    
    Note over Client,Gateway: mTLS Handshake
    Client->>Gateway: 1. Client Hello (Certificate Request)
    Gateway->>Client: 2. Server Certificate + Challenge
    Client->>Gateway: 3. Client Certificate + Signed Challenge
    Gateway->>Blockchain: 4. Verify DID Binding
    Blockchain->>DID: 5. Resolve DID
    DID-->>Blockchain: 6. Identity Record
    Blockchain-->>Gateway: 7. Validation Result
    
    alt Authentication Success
        Gateway->>Client: 8. Session Token (JWT)
        Note over Client,Gateway: Secure Channel Established
        Client->>Gateway: 9. Authenticated API Request
        Gateway->>Client: 10. Process & Respond
    else Authentication Failed
        Gateway->>Client: Access Denied
    end
```

---

## Diagram 3: Node-to-Node Authentication

```mermaid
graph LR
    subgraph NETWORK["P2P Network"]
        A[HR Node] <-->|"Gossip Protocol"| B[Manager Node]
        B <-->|"Gossip Protocol"| C[Employee Node]
        C <-->|"Gossip Protocol"| A
    end
    
    subgraph AUTH["Authentication"]
        A -.->|"1. Discovery"| A
        B -.->|"2. Handshake"| B
        C -.->|"3. Session"| C
    end
    
    subgraph ONCHAIN["On-Chain Verification"]
        REG[DID Registry Contract]
        ROLE[Role-Based Permissions]
        STAK[Staking Requirements]
    end
    
    A --> REG
    B --> REG
    C --> REG
```

---

## Diagram 4: Security Layers

```mermaid
graph TB
    subgraph L1["Layer 1: Network"]
        VPC[VPC/Private Network]
        FW[Firewall]
        DDOS[DDoS Protection]
    end
    
    subgraph L2["Layer 2: Transport"]
        TLS[TLS 1.3]
        MTLS[mTLS]
        PIN[Certificate Pinning]
    end
    
    subgraph L3["Layer 3: Application"]
        VALID[Input Validation]
        INJECTION[SQL/XSS Protection]
        RATE[Rate Limiting]
    end
    
    subgraph L4["Layer 4: Identity"]
        RBAC[RBAC]
        MFA[MFA]
        DID[DID/VC]
    end
    
    subgraph L5["Layer 5: Data"]
        ENCREST[Encryption at Rest]
        ENCTRANS[Encryption in Transit]
        ZKP[Zero-Knowledge Proofs]
    end
    
    subgraph L6["Layer 6: Blockchain"]
        MULTISIG[Multi-Signature]
        TIMELOCK[Timelock Contracts]
        SLASH[Slashing Conditions]
    end
    
    subgraph L7["Layer 7: Audit"]
        MONITOR[Real-time Monitoring]
        LOGS[Immutable Audit Logs]
        SIEM[SIEM Integration]
    end
    
    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7
```

---

## Diagram 5: Data Flow

```mermaid
flowchart LR
    subgraph INPUT["User Input"]
        E[Employee]
        M[Manager]
        H[HR Admin]
    end
    
    subgraph AUTH["Authentication"]
        CERT[Certificate]
        JWT[JWT Token]
        DID[DID Auth]
    end
    
    subgraph PROCESS["Processing"]
        QUEUE[Message Queue]
        SERVICE[Business Services]
        CONTRACT[Smart Contract]
    end
    
    subgraph STORAGE["Storage"]
        BC[Blockchain]
        IPFS[IPFS]
        DB[(Off-Chain DB)]
    end
    
    E --> AUTH
    M --> AUTH
    H --> AUTH
    
    AUTH --> QUEUE
    QUEUE --> SERVICE
    SERVICE --> CONTRACT
    
    CONTRACT --> BC
    CONTRACT --> IPFS
    SERVICE --> DB
```

---

## Diagram 6: HR Module Integration

```mermaid
graph TB
    subgraph CORE["Core HR Modules"]
        REC[Recruitment]
        ONB[Onboarding]
        EMP[Employee Management]
        PAY[Payroll]
        BEN[Benefits]
        PERF[Performance]
        TIME[Time & Attendance]
        TRAIN[Training]
    end
    
    subgraph BLOCKCHAIN["Blockchain Layer"]
        ID[DID Identity]
        CRED[Credentials VC]
        CONTRACT[Employment Contracts]
        LEDGER[Immutable Ledger]
    end
    
    REC --> ID
    ONB --> ID
    EMP --> ID
    PAY --> CONTRACT
    BEN --> CONTRACT
    PERF --> CRED
    TIME --> LEDGER
    TRAIN --> CRED
    
    ID --> LEDGER
    CRED --> LEDGER
    CONTRACT --> LEDGER
```

---

## Diagram 7: Consensus Mechanism

```mermaid
graph TB
    subgraph TRANSACTION["Transaction Flow"]
        TX[New Transaction] --> VAL[Validator Nodes]
    end
    
    subgraph CONSENSUS["Proof of Authority + dPoS"]
        VAL -->|"Sign & Propose"| PROP[Proposer Node]
        PROP -->|"Broadcast Block"| VOTE[Validator Voting]
        VOTE -->|"2/3+ Agreement"| COMMIT[Block Committed]
    end
    
    subgraph ROLES["Validator Roles"]
        PROPOSER[Proposer<br/>Block Creator]
        VALIDATOR[Validator<br/>Vote Taker]
        DELEGATOR[Delegator<br/>Stake Holder]
    end
    
    PROP -.-> ROLES
    VOTE -.-> ROLES
```

---

## ASCII Diagram 1: System Overview

```
+-----------------------------------------------------------------------------+
|                              D-HRS ECOSYSTEM                                 |
+-----------------------------------------------------------------------------+
|                                                                              |
|    +---------+     +---------+     +---------+     +---------+               |
|    |   Web   |     | Mobile  |     |  Admin  |     |   API   |               |
|    |   App   |     |  App    |     |   UI    |     | Portal  |               |
|    +----+----+     +----+----+     +----+----+     +----+----+               |
|         |               |               |               |                   |
|         +---------------+---------------+---------------+                   |
|                                 |                                             |
|                          +------+------+                                      |
|                          |  API GW +   |                                      |
|                          |    mTLS     |                                      |
|                          +------+------+                                      |
|                                 |                                             |
|         +-----------------------+-----------------------+                    |
|         |                       |                       |                    |
|  +------+------+       +-------+-------+      +--------+-----+              |
|  | HR Services |       | Employee Self |      |    Audit     |              |
|  |    Node     |       |    Service    |      |  Compliance  |              |
|  +------+------+       +-------+-------+      +------+------+              |
|         |                      |                      |                      |
+---------+----------------------+----------------------+----------------------+
|         |                      |                      |                      |
|         v                      v                      v                      |
|  +---------------------------------------------------------------------+    |
|  |                    BLOCKCHAIN NETWORK                               |    |
| -+   |  +------------ +-------------+   +-------------+               |    |
|  |  |  Consensus  |<->|   Smart     |<->| Distributed |               |    |
|  |  |   Layer     |   |  Contracts  |   |   Ledger    |               |    |
|  |  |  PoA+dPoS   |   |             |   |             |               |    |
|  |  +-------------+   +-------------+   +-------------+               |    |
|  +---------------------------------------------------------------------+    |
|                                 |                                             |
|                                 v                                             |
|  +---------------------------------------------------------------------+    |
|  |                       STORAGE LAYER                                 |    |
|  |              +-------------+    +-------------+                    |    |
|  |              |   IPFS      |<-->|  Off-Chain  |                    |    |
|  |              |  Cluster    |    |     DB      |                    |    |
|  |              +-------------+    +-------------+                    |    |
|  +---------------------------------------------------------------------+    |
|                                                                              |
+-----------------------------------------------------------------------------+
```

---

## ASCII Diagram 2: Mutual Authentication

```
+-----------------------------------------------------------------------------+
|                        MUTUAL AUTHENTICATION (mTLS)                         |
+-----------------------------------------------------------------------------+
|                                                                              |
|   CLIENT                                                          SERVER      |
|  +--------------+                                              +----------+   |
|  |  Employee/  |                                              |  API     |   |
|  |  HR Wallet  |                                              | Gateway  |   |
|  +------+-------+                                              +----+-----+   |
|         |                                                       |               |
|         |  1. Client Hello (Supported Ciphers)                  |               |
|         +----------------------------------------------------->|               |
|         |                                                       |               |
|         |  2. Server Hello + Certificate + Challenge           |               |
|         |<------------------------------------------------------|               |
|         |                                                       |               |
|         |  3. Client Certificate + Signed Challenge            |               |
|         +----------------------------------------------------->|               |
|         |                                                       |               |
|         |                         +-------------------------+   |               |
|         |                         |  Verify:                |   |               |
|         |                         |  - CA Signature        |   |               |
|         |                         |  - Not Expired         |   |               |
|         |                         |  - DID Binding         |-->|               |
|         |                         |  - Employment Status   |   |               |
|         |                         +-------------------------+   |               |
|         |                                                       |               |
|         |  4. Session Keys + Finished (Encrypted)              |               |
|         |<------------------------------------------------------|               |
|         |                                                       |               |
|         ==========================mTLS ESTABLISHED=====================       |
|         |                                                       |               |
|         |  5. Authenticated Request (JWT + mTLS)                |               |
|         +----------------------------------------------------->|               |
|         |                                                       |               |
|         |  6. Verify & Process                                  |               |
|         |                                    +-------------+   |               |
|         |                                    |  Blockchain |-->|               |
|         |                                    |   Query     |   |               |
|         |                                    +-------------+   |               |
|         |                                                       |               |
|         |  7. Response                                          |               |
|         |<------------------------------------------------------+               |
|                                                                              |
+-----------------------------------------------------------------------------+
```

---

## ASCII Diagram 3: Security Architecture

```
+-----------------------------------------------------------------------------+
|                      DEFENSE IN DEPTH - 7 LAYERS                            |
+-----------------------------------------------------------------------------+
|                                                                              |
|  Layer 7: MONITORING & AUDIT                                                 |
|  +-------------------------------------------------------------------------+ |
|  |  [Real-time Anomaly Detection]  [Immutable Audit Logs]                 | |
|  |  [SIEM Integration]  [Automated Alerting]  [Compliance Reports]          | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 6: BLOCKCHAIN SECURITY   |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [Multi-Signature]  [Timelock Contracts]  [Slashing]                    | |
|  |  [Hash Locking]  [On-Chain Governance]                                  | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 5: DATA SECURITY         |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [AES-256 at Rest]  [Field-Level Encryption]                           | |
|  |  [Zero-Knowledge Proofs]  [Data Segmentation]                          | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 4: IDENTITY & ACCESS     |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [RBAC]  [ABAC]  [MFA]  [Self-Sovereign Identity]                      | |
|  |  [DID/VC]  [Proof of Authority]                                       | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 3: APPLICATION SECURITY   |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [Input Validation]  [SQL Injection Prevention]                         | |
|  |  [XSS/CSRF Protection]  [Rate Limiting]  [API Key Rotation]           | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 2: TRANSPORT SECURITY    |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [TLS 1.3]  [Mutual TLS (mTLS)]  [Certificate Pinning]                  | |
|  |  [HSTS]                                                            | |
|  +-------------------------------------------------------------------------+ |
|                                    ^                                         |
|  Layer 1: NETWORK SECURITY       |                                          |
|  +-------------------------------------------------------------------------+ |
|  |  [VPC/Private Network]  [Firewall]  [DDoS Protection]                  | |
|  |  [Network Segmentation]                                       | |
|  +-------------------------------------------------------------------------+ |
|                                                                              |
|  +-------------------------------------------------------------------------+ |
|  |                    SECURITY INFRASTRUCTURE                               | |
|  |   +--------------+    +--------------+    +--------------+             | |
|  |   |  HSM Cluster |    | Secret Mgr   |    | Audit Chain  |             | |
|  |   | (Key Storage)|    |   (Vault)    |    |(Immutable)   |             | |
|  |   +--------------+    +--------------+    +--------------+             | |
|  +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## ASCII Diagram 4: Data Flow

```
+-----------------------------------------------------------------------------+
|                           DATA FLOW ARCHITECTURE                             |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +---------+    +---------+    +---------+    +---------+                      |
|  |Employee |    |Manager  |    |   HR    |    |External |                      |
|  | Client  |    | Client  |    |  Admin  |    |Systems  |                      |
|  +----+----+    +----+----+    +----+----+    +----+----+                      |
|       |              |              |              |                            |
|       |   +----------+----------+----------+----------+                 |
|       |   |          |              |              |          |                 |
|       v   v          v              v              v          v                 |
|  +---------------------------------------------------------------------+    |
|  |                   AUTHENTICATION GATEWAY                             |    |
|  |   +---------+  +---------+  +---------+  +---------+          |            |
|  |   |   mTLS  |  |   JWT   |  |   DID   |  |  OAuth  |          |            |
|  |   | Handler |  |Validator|  |Resolver |  |Provider |          |            |
|  |   +----+----+  +----+----+  +----+----+  +----+----+          |            |
|  +---------+-------------+-------------+-------------+---------------+        |
|           |             |             |             |                            |
|           v             v             v             v                            |
|  +---------------------------------------------------------------------+    |
|  |                    BUSINESS SERVICES                                 |    |
|  |   +-----------------------------------------------------------+   |            |
|  |   |  +--------+  +--------+  +--------+  +--------+        |   |            |
|  |   |  |Employee|  |Recruit |  |Payroll |  |Benefits|        |   |            |
|  |   |  |Service |  |Service |  |Service |  |Service |        |   |            |
|  |   |  +----+---+  +----+---+  +----+---+  +----+---+        |   |            |
|  |   +-------+----------+----------+----------+--------+----------+   |            |
|  |           |          |          |          |                  |            |
|  |           v          v          v          v                  |            |
|  |   +-----------------------------------------------------------+ |            |
|  |   |              BLOCKCHAIN INTERFACE                        | |            |
|  |   |   +--------+  +--------+  +--------+  +--------+        | |            |
|  |   |   |   Tx   |  |Contract|  | Merkle |  |  DID   |        | |            |
|  |   |   |Builder |  | Caller |  |Verifier|  |Resolver|        | |            |
|  |   |   +----+---+  +----+---+  +----+---+  +----+---+        | |            |
|  |   +--------+-----------+-----------+-----------+------------+ |            |
|  |            |           |           |           |               |            |
|  |            v           v           v           v               |            |
|  |   +-----------------------------------------------------------+ |            |
|  |   |                    BLOCKCHAIN NETWORK                    | |            |
|  |   |    +--------+    +--------+    +--------+    +-------+  | |            |
|  |   |    | Node 1 |<->| Node 2 |<->| Node 3 |<->|Node N |  | |            |
|  |   |    |(Valid) |    |(Valid) |    |(Valid) |    |(Valid)|  | |            |
|  |   |    +---+----+    +---+----+    +---+----+    +---+----+  | |            |
|  |   |        |            |            |            |        | |            |
|  |   |        +------------+------------+------------+        | |            |
|  |   |                         |                               | |            |
|  |   |                    Consensus                            | |            |
|  |   |                         |                               | |            |
|  |   |                         v                               | |            |
|  |   |   +-----------------------------------------------+     | |            |
|  |   |   |         DISTRIBUTED LEDGER                    |     | |            |
|  |   |   |   +----------------------------------------+  |     | |            |
|  |   |   |   | Block N: Employee Records, Credentials |  |     | |            |
|  |   |   |   | Block N-1: ...                         |  |     | |            |
|  |   |   |   | Block N-2: ...                         |  |     | |            |
|  |   |   |   +----------------------------------------+  |     | |            |
|  |   |   +-----------------------------------------------+     | |            |
|  |   +-----------------------------------------------------------+ |            |
|  +---------------------------------------------------------------------+    |
|                                    |                                             |
|                                    v                                             |
|  +---------------------------------------------------------------------+    |
|  |                         STORAGE LAYER                                 |    |
|  |              +-------------+           +-------------+                    |    |
|  |              |    IPFS    |<---------->|  PostgreSQL |                    |    |
|  |              |  (Files)   |           |  (Data)     |                    |    |
|  |              +-------------+           +-------------+                    |    |
|  +---------------------------------------------------------------------+    |
|                                                                              |
+-----------------------------------------------------------------------------+
```

---

These diagrams provide visual representation of the D-HRS architecture and can be rendered in markdown viewers that support Mermaid.js (GitHub, VS Code, Notion, Obsidian, GitLab, etc.)
