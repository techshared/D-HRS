// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EmployeeRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    uint256 public constant MAX_SALARY = 1000000000 ether;
    uint256 public constant MIN_SALARY = 1;

    mapping(address => uint256) public lastActionTime;
    uint256 public constant RATE_LIMIT = 1 minutes;

    mapping(address => uint256) public actionCount;
    uint256 public constant MAX_ACTIONS_PER_DAY = 100;
    mapping(address => uint256) public actionResetTime;

    struct Employee {
        bytes32 did;
        string personalInfoHash;
        string role;
        string department;
        uint256 salary;
        uint256 startDate;
        uint256 status;
        string credentialsRoot;
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

    modifier onlyHRAdmin() {
        require(hasRole(HR_ADMIN_ROLE, msg.sender), "Not HR Admin");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
    }

    function registerEmployee(
        address _wallet,
        bytes32 _did,
        string calldata _personalInfoHash,
        string calldata _role,
        string calldata _department,
        uint256 _salary
    ) 
        external 
        onlyHRAdmin 
        whenNotPaused 
        nonReentrant
    {
        require(_wallet != address(0), "Invalid wallet address");
        require(_did != bytes32(0), "Invalid DID");
        require(bytes(_role).length > 0, "Role required");
        require(bytes(_department).length > 0, "Department required");
        require(_salary >= MIN_SALARY && _salary <= MAX_SALARY, "Invalid salary");
        require(didToEmployee[_did].createdAt == 0, "Employee already exists");
        require(!isEmployee[_wallet], "Wallet already registered");

        _checkRateLimit(msg.sender);

        Employee storage employee = didToEmployee[_did];
        employee.did = _did;
        employee.personalInfoHash = _personalInfoHash;
        employee.role = _role;
        employee.department = _department;
        employee.salary = _salary;
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
        string calldata _department,
        uint256 _salary
    ) 
        external 
        onlyHRAdmin 
        whenNotPaused 
    {
        require(didToEmployee[_did].status == 1, "Employee not active");
        
        Employee storage employee = didToEmployee[_did];
        employmentHistory[_did].push(employee);
        
        employee.role = _role;
        employee.department = _department;
        employee.salary = _salary;
        employee.updatedAt = block.timestamp;

        emit EmployeeUpdated(_did, _department, _role);
    }

    function updateEmployeeStatus(bytes32 _did, uint256 _status) 
        external 
        onlyHRAdmin 
    {
        require(_status <= 3, "Invalid status");
        
        Employee storage employee = didToEmployee[_did];
        employee.status = _status;
        employee.updatedAt = block.timestamp;

        emit EmployeeStatusChanged(_did, _status);
    }

    function updateCredentials(bytes32 _did, string calldata _credentialsRoot) 
        external 
        onlyHRAdmin 
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

    function getAllEmployees() 
        external 
        view 
        returns (Employee[] memory) 
    {
        Employee[] memory employees = new Employee[](employeeCount);
        for (uint256 i = 0; i < employeeCount; i++) {
            employees[i] = didToEmployee[addressToDid[employeeAddresses[i]]];
        }
        return employees;
    }

    function pause() external onlyHRAdmin {
        _pause();
    }

    function unpause() external onlyHRAdmin {
        _unpause();
    }

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

    function getEmployeeCount() external view returns (uint256) {
        return employeeCount;
    }
}
