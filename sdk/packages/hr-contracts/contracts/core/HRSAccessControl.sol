// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HRSAccessControl
 * @dev HR-specific access control with department-scoped roles
 */
contract HRSAccessControl is AccessControl {
    // Department roles
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant DEPARTMENT_HEAD_ROLE = keccak256("DEPARTMENT_HEAD_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant EMPLOYEE_ROLE = keccak256("EMPLOYEE_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Department structure
    struct Department {
        bytes32 id;
        string name;
        address head;
        bool active;
    }

    // Mappings
    mapping(bytes32 => Department) public departments;
    mapping(bytes32 => mapping(address => bytes32)) public employeeDepartment;
    mapping(bytes32 => mapping(address => bool)) public departmentMembers;

    // Events
    event DepartmentCreated(bytes32 indexed id, string name, address head);
    event EmployeeAssigned(bytes32 indexed departmentId, address indexed employee);
    event EmployeeRemoved(bytes32 indexed departmentId, address indexed employee);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new department
     */
    function createDepartment(
        bytes32 _id,
        string calldata _name,
        address _head
    ) external onlyRole(HR_ADMIN_ROLE) {
        require(departments[_id].active == false, "Department exists");
        require(_head != address(0), "Invalid head address");

        departments[_id] = Department({
            id: _id,
            name: _name,
            head: _head,
            active: true
        });

        _grantRole(DEPARTMENT_HEAD_ROLE, _head);
        departmentMembers[_id][_head] = true;

        emit DepartmentCreated(_id, _name, _head);
    }

    /**
     * @dev Add employee to department
     */
    function addEmployeeToDepartment(
        bytes32 _departmentId,
        address _employee
    ) external onlyRole(DEPARTMENT_HEAD_ROLE) {
        require(departments[_departmentId].active, "Department not active");
        require(_employee != address(0), "Invalid employee address");

        departmentMembers[_departmentId][_employee] = true;
        employeeDepartment[_departmentId][_employee] = EMPLOYEE_ROLE;

        _grantRole(EMPLOYEE_ROLE, _employee);

        emit EmployeeAssigned(_departmentId, _employee);
    }

    /**
     * @dev Remove employee from department
     */
    function removeEmployeeFromDepartment(
        bytes32 _departmentId,
        address _employee
    ) external onlyRole(DEPARTMENT_HEAD_ROLE) {
        require(departmentMembers[_departmentId][_employee], "Not a member");

        departmentMembers[_departmentId][_employee] = false;
        delete employeeDepartment[_departmentId][_employee];

        emit EmployeeRemoved(_departmentId, _employee);
    }

    /**
     * @dev Check if address is department member
     */
    function isDepartmentMember(
        bytes32 _departmentId,
        address _address
    ) public view returns (bool) {
        return departmentMembers[_departmentId][_address];
    }

    /**
     * @dev Modifier for department-scoped access
     */
    modifier onlyDepartmentMember(bytes32 _departmentId) {
        require(
            isDepartmentMember(_departmentId, msg.sender) ||
            hasRole(HR_ADMIN_ROLE, msg.sender),
            "Not department member"
        );
        _;
    }
}
