// D-HRS Smart Contracts
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================
// PART 1: EMPLOYEE REGISTRY CONTRACT
// ============================================

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title EmployeeRegistry
 * @dev Manages employee records on-chain with role-based access
 */
contract EmployeeRegistry is 
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Employee {
        bytes32 did;                    // Decentralized Identifier
        string personalInfoHash;        // Hash of encrypted personal info
        string role;
        string department;
        uint256 salary;
        uint256 startDate;
        uint256 status;                 // 0: None, 1: Active, 2: OnLeave, 3: Terminated
        string credentialsRoot;         // Merkle root of credentials
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(address => bytes32) public addressToDid;
    mapping(bytes32 => Employee) public didToEmployee;
    mapping(address => bool) public isEmployee;
    
    // Employment history for audit trail
    mapping(bytes32 => Employee[]) public employmentHistory;
    
    // Events
    event EmployeeRegistered(bytes32 indexed did, address indexed wallet, string role);
    event EmployeeUpdated(bytes32 indexed did, string department, string role);
    event EmployeeStatusChanged(bytes32 indexed did, uint256 status);
    event CredentialUpdated(bytes32 indexed did, string credentialsRoot);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}

    /**
     * @dev Register a new employee
     */
    function registerEmployee(
        address _wallet,
        bytes32 _did,
        string calldata _personalInfoHash,
        string calldata _role,
        string calldata _department,
        uint256 _salary
    ) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
        whenNotPaused 
    {
        require(didToEmployee[_did].status == 0, "Employee already exists");
        require(!isEmployee[_wallet], "Wallet already registered");

        Employee storage employee = didToEmployee[_did];
        employee.did = _did;
        employee.personalInfoHash = _personalInfoHash;
        employee.role = _role;
        employee.department = _department;
        employee.salary = _salary;
        employee.startDate = block.timestamp;
        employee.status = 1; // Active
        employee.createdAt = block.timestamp;
        employee.updatedAt = block.timestamp;

        addressToDid[_wallet] = _did;
        isEmployee[_wallet] = true;

        emit EmployeeRegistered(_did, _wallet, _role);
    }

    /**
     * @dev Update employee information
     */
    function updateEmployee(
        bytes32 _did,
        string calldata _role,
        string calldata _department,
        uint256 _salary
    ) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
        whenNotPaused 
    {
        require(didToEmployee[_did].status == 1, "Employee not active");
        
        Employee storage employee = didToEmployee[_did];
        
        // Store history before update
        employmentHistory[_did].push(employee);
        
        employee.role = _role;
        employee.department = _department;
        employee.salary = _salary;
        employee.updatedAt = block.timestamp;

        emit EmployeeUpdated(_did, _department, _role);
    }

    /**
     * @dev Update employee status (active, on leave, terminated)
     */
    function updateEmployeeStatus(bytes32 _did, uint256 _status) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
    {
        require(_status <= 3, "Invalid status");
        
        Employee storage employee = didToEmployee[_did];
        employee.status = _status;
        employee.updatedAt = block.timestamp;

        emit EmployeeStatusChanged(_did, _status);
    }

    /**
     * @dev Update credentials (merkle root)
     */
    function updateCredentials(bytes32 _did, string calldata _credentialsRoot) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
    {
        Employee storage employee = didToEmployee[_did];
        employee.credentialsRoot = _credentialsRoot;
        employee.updatedAt = block.timestamp;

        emit CredentialUpdated(_did, _credentialsRoot);
    }

    /**
     * @dev Get employee by DID
     */
    function getEmployee(bytes32 _did) 
        external 
        view 
        returns (Employee memory) 
    {
        return didToEmployee[_did];
    }

    /**
     * @dev Get employee by wallet address
     */
    function getEmployeeByAddress(address _wallet) 
        external 
        view 
        returns (Employee memory) 
    {
        bytes32 did = addressToDid[_wallet];
        return didToEmployee[did];
    }

    /**
     * @dev Pause all employee operations (emergency)
     */
    function pause() external onlyRole(HR_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause operations
     */
    function unpause() external onlyRole(HR_ADMIN_ROLE) {
        _unpause();
    }
}

// ============================================
// PART 2: CREDENTIAL REGISTRY (Verifiable Credentials)
// ============================================

/**
 * @title CredentialRegistry
 * @dev Manages verifiable credentials on-chain
 */
contract CredentialRegistry is AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Credential {
        bytes32 id;
        bytes32 subjectDid;           // Employee DID
        bytes32 issuerDid;
        string credentialType;        // Employment, Education, Certification
        string dataHash;              // Hash of off-chain credential data
        uint256 issueDate;
        uint256 expiryDate;
        uint256 status;               // 0: Valid, 1: Revoked, 2: Expired
        string metadataURI;           // IPFS URI for full credential
    }

    mapping(bytes32 => Credential[]) public credentials;
    mapping(bytes32 => mapping(string => bool)) public hasCredentialType;
    mapping(bytes32 => bool) public revokedCredentials;

    event CredentialIssued(
        bytes32 indexed credentialId,
        bytes32 indexed subjectDid,
        string credentialType
    );
    event CredentialRevoked(bytes32 indexed credentialId);
    event CredentialVerified(
        bytes32 indexed subjectDid,
        string credentialType,
        bool isValid
    );

    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Issue a new credential
     */
    function issueCredential(
        bytes32 _credentialId,
        bytes32 _subjectDid,
        bytes32 _issuerDid,
        string calldata _credentialType,
        string calldata _dataHash,
        uint256 _expiryDays,
        string calldata _metadataURI
    ) external onlyRole(ISSUER_ROLE) whenNotPaused {
        require(!revokedCredentials[_credentialId], "Credential already revoked");

        Credential memory credential = Credential({
            id: _credentialId,
            subjectDid: _subjectDid,
            issuerDid: _issuerDid,
            credentialType: _credentialType,
            dataHash: _dataHash,
            issueDate: block.timestamp,
            expiryDate: block.timestamp + (_expiryDays * 1 days),
            status: 0,
            metadataURI: _metadataURI
        });

        credentials[_subjectDid].push(credential);
        hasCredentialType[_subjectDid][_credentialType] = true;

        emit CredentialIssued(_credentialId, _subjectDid, _credentialType);
    }

    /**
     * @dev Revoke a credential
     */
    function revokeCredential(bytes32 _subjectDid, uint256 _index) 
        external 
        onlyRole(ISSUER_ROLE) 
    {
        require(_index < credentials[_subjectDid].length, "Invalid index");
        
        Credential storage credential = credentials[_subjectDid][_index];
        credential.status = 1; // Revoked
        revokedCredentials[credential.id] = true;

        emit CredentialRevoked(credential.id);
    }

    /**
     * @dev Verify credential existence and validity
     */
    function verifyCredential(
        bytes32 _subjectDid,
        string calldata _credentialType
    ) 
        external 
        onlyRole(VERIFIER_ROLE) 
        returns (bool) 
    {
        Credential[] storage creds = credentials[_subjectDid];
        
        for (uint256 i = creds.length; i > 0; i--) {
            Credential memory cred = creds[i - 1];
            
            if (keccak256(bytes(cred.credentialType)) == 
                keccak256(bytes(_credentialType))) {
                
                bool isValid = (cred.status == 0 && 
                               block.timestamp < cred.expiryDate);
                
                emit CredentialVerified(_subjectDid, _credentialType, isValid);
                return isValid;
            }
        }
        
        emit CredentialVerified(_subjectDid, _credentialType, false);
        return false;
    }

    /**
     * @dev Get all credentials for a subject
     */
    function getCredentials(bytes32 _subjectDid) 
        external 
        view 
        returns (Credential[] memory) 
    {
        return credentials[_subjectDid];
    }
}

// ============================================
// PART 3: PAYROLL EXECUTOR
// ============================================

/**
 * @title PayrollExecutor
 * @dev Approval-only payroll workflow. Records multi-sig approvals on-chain;
 *      actual salary disbursement is handled off-chain via banking channels.
 */
contract PayrollExecutor is AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct PayrollRun {
        uint256 id;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 totalAmount;
        uint256 status;           // 0: Pending, 1: Approved, 2: Executed, 3: Failed
        uint256 approvalCount;
        address[] approvers;
        mapping(address => bool) approved;
        uint256 createdAt;
    }

    struct EmployeePayment {
        bytes32 did;
        address wallet;
        uint256 grossAmount;
        uint256 deductions;
        uint256 netAmount;
        uint256 status;           // 0: Pending, 1: Processed, 2: Failed
    }

    mapping(uint256 => PayrollRun) public payrollRuns;
    mapping(uint256 => EmployeePayment[]) public payrollPayments;
    uint256 public payrollCount;
    
    // Salary token
    address public paymentToken;
    
    // Required approvals for payroll execution
    uint256 public constant REQUIRED_APPROVALS = 2;

    event PayrollRunCreated(
        uint256 indexed runId,
        uint256 periodStart,
        uint256 periodEnd
    );
    event PayrollApproved(
        uint256 indexed runId,
        address approver
    );
    event PayrollExecuted(uint256 indexed runId);
    event PaymentProcessed(
        uint256 indexed runId,
        address indexed recipient,
        uint256 amount
    );

    function initialize(address _paymentToken) public initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        paymentToken = _paymentToken;
    }

    /**
     * @dev Create a new payroll run
     */
    function createPayrollRun(
        uint256 _periodStart,
        uint256 _periodEnd,
        EmployeePayment[] calldata _payments
    ) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
        whenNotPaused 
    {
        uint256 runId = payrollCount++;
        
        PayrollRun storage run = payrollRuns[runId];
        run.id = runId;
        run.periodStart = _periodStart;
        run.periodEnd = _periodEnd;
        run.status = 0;
        run.approvalCount = 0;
        run.createdAt = block.timestamp;
        
        // Calculate total
        uint256 total;
        for (uint256 i = 0; i < _payments.length; i++) {
            total += _payments[i].netAmount;
            payrollPayments[runId].push(_payments[i]);
        }
        run.totalAmount = total;

        emit PayrollRunCreated(runId, _periodStart, _periodEnd);
    }

    /**
     * @dev Approve payroll run (multi-sig)
     */
    function approvePayroll(uint256 _runId) 
        external 
        onlyRole(FINANCE_ROLE) 
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == 0, "Payroll not pending");
        require(!run.approved[msg.sender], "Already approved");
        
        run.approved[msg.sender] = true;
        run.approvers.push(msg.sender);
        run.approvalCount++;

        emit PayrollApproved(_runId, msg.sender);

        // Auto-execute if enough approvals
        if (run.approvalCount >= REQUIRED_APPROVALS) {
            run.status = 1; // Approved
        }
    }

    /**
     * @dev Execute approved payroll
     */
    function executePayroll(uint256 _runId) 
        external 
        onlyRole(EXECUTOR_ROLE) 
        nonReentrant 
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == 1, "Payroll not approved");
        
        run.status = 2; // Executing
        
        EmployeePayment[] storage payments = payrollPayments[_runId];
        
        for (uint256 i = 0; i < payments.length; i++) {
            EmployeePayment storage payment = payments[i];
            
            // Transfer tokens (simplified - would use IERC20 in production)
            // IERC20(paymentToken).transfer(payment.wallet, payment.netAmount);
            
            payment.status = 1; // Processed
            
            emit PaymentProcessed(_runId, payment.wallet, payment.netAmount);
        }
        
        run.status = 2; // Executed
        emit PayrollExecuted(_runId);
    }

    /**
     * @dev Get payments for a payroll run
     */
    function getPayments(uint256 _runId) 
        external 
        view 
        returns (EmployeePayment[] memory) 
    {
        return payrollPayments[_runId];
    }
}

// ============================================
// PART 4: BENEFITS NFT (ERC-721)
// ============================================

/**
 * @title BenefitsNFT
 * @dev NFT representing employee benefits (ERC-721)
 */
contract BenefitsNFT is ERC721URIStorage, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    struct Benefit {
        bytes32 employeeDid;
        string benefitType;       // Health, Dental, Vision, etc.
        string coverageLevel;     // Basic, Premium, etc.
        uint256 startDate;
        uint256 endDate;
        bool active;
    }

    mapping(uint256 => Benefit) public benefitDetails;
    mapping(bytes32 => uint256[]) public employeeBenefits;

    event BenefitMinted(
        uint256 indexed tokenId,
        bytes32 indexed employeeDid,
        string benefitType
    );
    event BenefitRevoked(uint256 indexed tokenId);

    function initialize() public initializer {
        __ERC721_init("D-HRS Benefits", "DBNFT");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __Pausable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a benefit NFT to an employee
     */
    function mintBenefit(
        address _to,
        uint256 _tokenId,
        bytes32 _employeeDid,
        string calldata _benefitType,
        string calldata _coverageLevel,
        uint256 _durationDays,
        string calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);

        Benefit storage benefit = benefitDetails[_tokenId];
        benefit.employeeDid = _employeeDid;
        benefit.benefitType = _benefitType;
        benefit.coverageLevel = _coverageLevel;
        benefit.startDate = block.timestamp;
        benefit.endDate = block.timestamp + (_durationDays * 1 days);
        benefit.active = true;

        employeeBenefits[_employeeDid].push(_tokenId);

        emit BenefitMinted(_tokenId, _employeeDid, _benefitType);
    }

    /**
     * @dev Revoke a benefit (burn NFT)
     */
    function revokeBenefit(uint256 _tokenId) 
        external 
        onlyRole(BURNER_ROLE) 
    {
        require(_ownerOf(_tokenId) != address(0), "Token not exists");
        
        benefitDetails[_tokenId].active = false;
        _burn(_tokenId);
        
        emit BenefitRevoked(_tokenId);
    }

    /**
     * @dev Get all benefit tokens for an employee
     */
    function getEmployeeBenefits(bytes32 _employeeDid) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return employeeBenefits[_employeeDid];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

// ============================================
// PART 5: GOVERNANCE (DAO)
// ============================================

/**
 * @title HRGovernance
 * @dev DAO for HR policy decisions
 */
contract HRGovernance is AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 status;     // 0: Pending, 1: Active, 2: Passed, 3: Rejected, 4: Executed
        uint256 quorum;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votes; // proposalId => voter => weight
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_PERCENTAGE = 50; // 50% required

    event ProposalCreated(
        uint256 indexed id,
        string title,
        address proposer
    );
    event VoteCast(
        uint256 indexed proposalId,
        address voter,
        uint256 weight,
        bool support
    );
    event ProposalExecuted(uint256 indexed proposalId);

    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new governance proposal
     */
    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _quorum
    ) external onlyRole(PROPOSER_ROLE) whenNotPaused {
        uint256 id = proposalCount++;
        
        Proposal storage proposal = proposals[id];
        proposal.id = id;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        proposal.status = 1; // Active
        proposal.quorum = _quorum > 0 ? _quorum : QUORUM_PERCENTAGE;

        emit ProposalCreated(id, _title, msg.sender);
    }

    /**
     * @dev Cast a vote on a proposal
     */
    function castVote(
        uint256 _proposalId,
        bool _support,
        uint256 _weight
    ) external onlyRole(VOTER_ROLE) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == 1, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        
        hasVoted[_proposalId][msg.sender] = true;
        votes[_proposalId][msg.sender] = _weight;
        
        if (_support) {
            proposal.forVotes += _weight;
        } else if (_support == false) {
            proposal.againstVotes += _weight;
        } else {
            proposal.abstainVotes += _weight;
        }

        emit VoteCast(_proposalId, msg.sender, _weight, _support);
    }

    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(uint256 _proposalId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == 1, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        
        uint256 totalVotes = proposal.forVotes + 
                            proposal.againstVotes + 
                            proposal.abstainVotes;
        
        // Check quorum
        require(totalVotes >= proposal.quorum, "Quorum not reached");
        
        // Check if passed
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = 2; // Passed
        } else {
            proposal.status = 3; // Rejected
        }

        emit ProposalExecuted(_proposalId);
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }
}

// ============================================
// PART 6: DID REGISTRY
// ============================================

/**
 * @title DIDRegistry
 * @dev Decentralized Identifier Registry
 */
contract DIDRegistry is AccessControlUpgradeable {
    struct DIDDocument {
        bytes32 did;
        string controller;
        string serviceEndpoint;
        string publicKey;
        uint256 created;
        uint256 updated;
    }

    mapping(bytes32 => DIDDocument) public documents;
    mapping(bytes32 => mapping(bytes32 => bool)) public authentications;

    event DIDCreated(bytes32 indexed did, string controller);
    event DIDUpdated(bytes32 indexed did);
    event DIDDeleted(bytes32 indexed did);

    function createDID(
        bytes32 _did,
        string calldata _controller,
        string calldata _publicKey,
        string calldata _serviceEndpoint
    ) external {
        require(documents[_did].created == 0, "DID exists");
        
        documents[_did] = DIDDocument({
            did: _did,
            controller: _controller,
            publicKey: _publicKey,
            serviceEndpoint: _serviceEndpoint,
            created: block.timestamp,
            updated: block.timestamp
        });
        
        emit DIDCreated(_did, _controller);
    }

    function updateDID(
        bytes32 _did,
        string calldata _publicKey,
        string calldata _serviceEndpoint
    ) external {
        require(documents[_did].created > 0, "DID not found");
        
        documents[_did].publicKey = _publicKey;
        documents[_did].serviceEndpoint = _serviceEndpoint;
        documents[_did].updated = block.timestamp;
        
        emit DIDUpdated(_did);
    }

    function getDID(bytes32 _did) 
        external 
        view 
        returns (DIDDocument memory) 
    {
        return documents[_did];
    }
}
