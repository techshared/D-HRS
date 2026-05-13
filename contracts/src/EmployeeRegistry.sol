// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IComplianceEngine {
    function guard(address _user, bytes32 _txId) external view;
    function getRealNameStatus(address _user) external view returns (
        RealNameLevel level,
        uint256 expiry,
        bool valid
    );
    function isSanctioned(address _addr) external view returns (bool);
}

// Re-declare enum for interface compatibility
enum RealNameLevel { NONE, BASIC, ENHANCED }

/**
 * @title EmployeeRegistry
 * @notice On-chain employee registry. Salary data is NOT stored on-chain
 *         (PIPL compliance — personal financial data must stay off-chain).
 *         Only DID, role, department, status, and credential root are stored.
 */
contract EmployeeRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    IComplianceEngine public complianceEngine;

    event ComplianceEngineSet(address indexed engine);

    mapping(address => uint256) public lastActionTime;
    uint256 public constant RATE_LIMIT = 1 minutes;
    mapping(address => uint256) public actionCount;
    uint256 public constant MAX_ACTIONS_PER_DAY = 100;
    mapping(address => uint256) public actionResetTime;

    struct Employee {
        bytes32 did;
        string personalInfoHash;  // hash of off-chain PII
        string role;
        string department;
        uint256 startDate;
        uint256 status;           // 0=None, 1=Active, 2=OnLeave, 3=Terminated
        string credentialsRoot;   // Merkle root of credentials
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(address => bytes32) public addressToDid;
    mapping(bytes32 => Employee) public didToEmployee;
    mapping(address => bool) public isEmployee;
    mapping(bytes32 => Employee[]) public employmentHistory;

    uint256 public employeeCount;
    address[] public employeeAddresses;

    event EmployeeRegistered(bytes32 indexed did, address indexed wallet, string role);
    event EmployeeUpdated(bytes32 indexed did, string department, string role);
    event EmployeeStatusChanged(bytes32 indexed did, uint256 status);
    event CredentialUpdated(bytes32 indexed did, string credentialsRoot);

    constructor(address _complianceEngine) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        if (_complianceEngine != address(0)) {
            complianceEngine = IComplianceEngine(_complianceEngine);
            emit ComplianceEngineSet(_complianceEngine);
        }
    }

    function setComplianceEngine(address _engine) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_engine != address(0), "Zero address");
        complianceEngine = IComplianceEngine(_engine);
        emit ComplianceEngineSet(_engine);
    }

    function registerEmployee(
        address _wallet,
        bytes32 _did,
        string calldata _personalInfoHash,
        string calldata _role,
        string calldata _department
    )
        external
        onlyRole(HR_ADMIN_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(_wallet != address(0), "Invalid wallet address");
        require(_did != bytes32(0), "Invalid DID");
        require(bytes(_role).length > 0, "Role required");
        require(bytes(_department).length > 0, "Department required");
        require(didToEmployee[_did].createdAt == 0, "Employee already exists");
        require(!isEmployee[_wallet], "Wallet already registered");

        _checkRateLimit(msg.sender);

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _did);
        }

        Employee storage employee = didToEmployee[_did];
        employee.did = _did;
        employee.personalInfoHash = _personalInfoHash;
        employee.role = _role;
        employee.department = _department;
        employee.startDate = block.timestamp;
        employee.status = 1;
        employee.createdAt = block.timestamp;
        employee.updatedAt = block.timestamp;

        addressToDid[_wallet] = _did;
        isEmployee[_wallet] = true;
        employeeAddresses.push(_wallet);
        employeeCount++;

        emit EmployeeRegistered(_did, _wallet, _role);
    }

    function updateEmployee(
        bytes32 _did,
        string calldata _role,
        string calldata _department
    )
        external
        onlyRole(HR_ADMIN_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(didToEmployee[_did].status == 1, "Employee not active");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _did);
        }

        Employee storage employee = didToEmployee[_did];
        employmentHistory[_did].push(employee);

        employee.role = _role;
        employee.department = _department;
        employee.updatedAt = block.timestamp;

        emit EmployeeUpdated(_did, _department, _role);
    }

    function updateEmployeeStatus(bytes32 _did, uint256 _status)
        external
        onlyRole(HR_ADMIN_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(_status <= 3, "Invalid status");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _did);
        }

        Employee storage employee = didToEmployee[_did];
        employee.status = _status;
        employee.updatedAt = block.timestamp;

        emit EmployeeStatusChanged(_did, _status);
    }

    function updateCredentials(bytes32 _did, string calldata _credentialsRoot)
        external
        onlyRole(HR_ADMIN_ROLE)
    {
        Employee storage employee = didToEmployee[_did];
        employee.credentialsRoot = _credentialsRoot;
        employee.updatedAt = block.timestamp;

        emit CredentialUpdated(_did, _credentialsRoot);
    }

    function getEmployee(bytes32 _did)
        external
        view
        returns (Employee memory)
    {
        return didToEmployee[_did];
    }

    function getEmployeeByAddress(address _wallet)
        external
        view
        returns (Employee memory)
    {
        bytes32 did = addressToDid[_wallet];
        return didToEmployee[did];
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeCount;
    }

    function pause() external onlyRole(HR_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(HR_ADMIN_ROLE) { _unpause(); }

    function _checkRateLimit(address _account) internal {
        if (block.timestamp - actionResetTime[_account] > 1 days) {
            actionCount[_account] = 0;
            actionResetTime[_account] = block.timestamp;
        }
        require(actionCount[_account] < MAX_ACTIONS_PER_DAY, "Rate limit exceeded");
        require(block.timestamp - lastActionTime[_account] >= RATE_LIMIT, "Rate limited");
        lastActionTime[_account] = block.timestamp;
        actionCount[_account]++;
    }
}
