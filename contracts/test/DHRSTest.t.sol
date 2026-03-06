// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/EmployeeRegistry.sol";
import "../src/CredentialRegistry.sol";
import "../src/HRToken.sol";

contract DHRSTest is Test {
    EmployeeRegistry public employeeRegistry;
    CredentialRegistry public credentialRegistry;
    HRToken public hrToken;
    
    address public hrAdmin = address(0x1);
    address public manager = address(0x2);
    address public employee = address(0x3);
    address public employee2 = address(0x4);

    bytes32 public testDID = keccak256("did:hrs:test:001");
    bytes32 public testDID2 = keccak256("did:hrs:test:002");

    function setUp() public {
        vm.startPrank(hrAdmin);
        
        // Deploy contracts
        employeeRegistry = new EmployeeRegistry();
        employeeRegistry.initialize();
        
        credentialRegistry = new CredentialRegistry();
        credentialRegistry.initialize();
        
        hrToken = new HRToken();
        
        vm.stopPrank();
    }

    function testEmployeeRegistration() public {
        vm.startPrank(hrAdmin);
        
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Software Engineer",
            "Engineering",
            100000
        );
        
        vm.stopPrank();
        
        // Verify employee
        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);
        
        assertEq(emp.did, testDID);
        assertEq(emp.role, "Software Engineer");
        assertEq(emp.department, "Engineering");
        assertEq(emp.salary, 100000);
        assertEq(emp.status, 1);
        
        console.log("Employee registered successfully");
        console.log("DID:", uint256(emp.did));
        console.log("Role:", emp.role);
    }

    function testEmployeeUpdate() public {
        vm.startPrank(hrAdmin);
        
        // Register employee
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Junior Engineer",
            "Engineering",
            80000
        );
        
        // Update employee
        employeeRegistry.updateEmployee(
            testDID,
            "Senior Engineer",
            "Engineering",
            120000
        );
        
        vm.stopPrank();
        
        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);
        
        assertEq(emp.role, "Senior Engineer");
        assertEq(emp.salary, 120000);
        
        console.log("Employee updated - New Role:", emp.role);
    }

    function testEmployeeTermination() public {
        vm.startPrank(hrAdmin);
        
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Engineer",
            "Engineering",
            100000
        );
        
        employeeRegistry.updateEmployeeStatus(testDID, 3); // Terminated
        
        vm.stopPrank();
        
        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);
        
        assertEq(emp.status, 3);
        
        console.log("Employee terminated - Status:", emp.status);
    }

    function testCredentialIssuance() public {
        vm.startPrank(hrAdmin);
        
        // Grant issuer role to hrAdmin
        credentialRegistry.grantRole(credentialRegistry.ISSUER_ROLE(), hrAdmin);
        
        bytes32 credId = keccak256("credential:001");
        
        credentialRegistry.issueCredential(
            credId,
            testDID,
            keccak256("did:hrs:company:hr"),
            "EmploymentCredential",
            "0xcredentialhash",
            365,
            "ipfs://Qm..."
        );
        
        vm.stopPrank();
        
        CredentialRegistry.Credential[] memory creds = credentialRegistry.getCredentials(testDID);
        
        assertEq(creds.length, 1);
        assertEq(creds[0].credentialType, "EmploymentCredential");
        
        console.log("Credential issued - Type:", creds[0].credentialType);
    }

    function testCredentialVerification() public {
        vm.startPrank(hrAdmin);
        
        // Grant roles
        credentialRegistry.grantRole(credentialRegistry.ISSUER_ROLE(), hrAdmin);
        credentialRegistry.grantRole(credentialRegistry.VERIFIER_ROLE(), hrAdmin);
        
        // Issue credential
        bytes32 credId = keccak256("credential:001");
        credentialRegistry.issueCredential(
            credId,
            testDID,
            keccak256("did:hrs:company:hr"),
            "EmploymentCredential",
            "0xcredentialhash",
            365,
            "ipfs://Qm..."
        );
        
        vm.stopPrank();
        
        // Verify credential
        vm.startPrank(hrAdmin);
        bool isValid = credentialRegistry.verifyCredential(testDID, "EmploymentCredential");
        vm.stopPrank();
        
        assertTrue(isValid);
        
        console.log("Credential verified:", isValid);
    }

    function testMultipleEmployees() public {
        vm.startPrank(hrAdmin);
        
        // Register multiple employees
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash1",
            "Engineer",
            "Engineering",
            100000
        );
        
        employeeRegistry.registerEmployee(
            employee2,
            testDID2,
            "0xhash2",
            "Designer",
            "Design",
            90000
        );
        
        vm.stopPrank();
        
        assertEq(employeeRegistry.employeeCount(), 2);
        
        EmployeeRegistry.Employee[] memory allEmployees = employeeRegistry.getAllEmployees();
        
        assertEq(allEmployees.length, 2);
        
        console.log("Total employees:", allEmployees.length);
    }

    function testOnlyHRAdminCanRegister() public {
        vm.startPrank(employee);
        
        vm.expectRevert("Not HR Admin");
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Engineer",
            "Engineering",
            100000
        );
        
        vm.stopPrank();
        
        console.log("Access control working - Only HR Admin can register");
    }

    function testCredentialRevocation() public {
        vm.startPrank(hrAdmin);
        
        // Grant roles
        credentialRegistry.grantRole(credentialRegistry.ISSUER_ROLE(), hrAdmin);
        
        // Issue credential
        bytes32 credId = keccak256("credential:001");
        credentialRegistry.issueCredential(
            credId,
            testDID,
            keccak256("did:hrs:company:hr"),
            "EmploymentCredential",
            "0xcredentialhash",
            365,
            "ipfs://Qm..."
        );
        
        // Revoke credential
        credentialRegistry.revokeCredential(testDID, 0);
        
        vm.stopPrank();
        
        // Verify
        vm.startPrank(hrAdmin);
        credentialRegistry.grantRole(credentialRegistry.VERIFIER_ROLE(), hrAdmin);
        bool isValid = credentialRegistry.verifyCredential(testDID, "EmploymentCredential");
        vm.stopPrank();
        
        assertFalse(isValid);
        
        console.log("Credential revoked - Verification:", isValid);
    }
}
