// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "./HRSAccessControl.sol";

/**
 * @title HRSPausable
 * @dev Department-level pausable functionality
 */
contract HRSPausable is Pausable, HRSAccessControl {
    // Department pause state
    mapping(bytes32 => bool) public departmentPaused;

    // Events
    event DepartmentPaused(bytes32 indexed departmentId, address indexed by);
    event DepartmentUnpaused(bytes32 indexed departmentId, address indexed by);

    /**
     * @dev Pause specific department
     */
    function pauseDepartment(bytes32 _departmentId) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
    {
        require(departments[_departmentId].active, "Department not active");
        departmentPaused[_departmentId] = true;
        emit DepartmentPaused(_departmentId, msg.sender);
    }

    /**
     * @dev Unpause specific department
     */
    function unpauseDepartment(bytes32 _departmentId) 
        external 
        onlyRole(HR_ADMIN_ROLE) 
    {
        require(departmentPaused[_departmentId], "Department not paused");
        departmentPaused[_departmentId] = false;
        emit DepartmentUnpaused(_departmentId, msg.sender);
    }

    /**
     * @dev Check if department is paused
     */
    function isDepartmentPaused(bytes32 _departmentId) 
        public 
        view 
        returns (bool) 
    {
        return paused() || departmentPaused[_departmentId];
    }

    /**
     * @dev Modifier for department-level pause
     */
    modifier whenDepartmentNotPaused(bytes32 _departmentId) {
        require(
            !isDepartmentPaused(_departmentId),
            "Department is paused"
        );
        _;
    }
}
