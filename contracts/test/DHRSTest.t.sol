// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/EmployeeRegistry.sol";
import "../src/CredentialRegistry.sol";

contract DHRSTest is Test {
    EmployeeRegistry public employeeRegistry;
    CredentialRegistry public credentialRegistry;

    address public hrAdmin = address(0x1);
    address public employee = address(0x3);
    address public employee2 = address(0x4);

    bytes32 public testDID = keccak256("did:hrs:test:001");
    bytes32 public testDID2 = keccak256("did:hrs:test:002");

    function setUp() public {
        vm.startPrank(hrAdmin);

        employeeRegistry = new EmployeeRegistry();
        credentialRegistry = new CredentialRegistry();

        vm.stopPrank();
    }

    function testEmployeeRegistration() public {
        vm.startPrank(hrAdmin);

        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Software Engineer",
            "Engineering"
        );

        vm.stopPrank();

        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);

        assertEq(emp.did, testDID);
        assertEq(emp.role, "Software Engineer");
        assertEq(emp.department, "Engineering");
        assertEq(emp.status, 1);

        console.log("Employee registered successfully");
        console.log("DID:", uint256(emp.did));
        console.log("Role:", emp.role);
    }

    function testEmployeeUpdate() public {
        vm.startPrank(hrAdmin);

        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Junior Engineer",
            "Engineering"
        );

        employeeRegistry.updateEmployee(
            testDID,
            "Senior Engineer",
            "Engineering"
        );

        vm.stopPrank();

        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);

        assertEq(emp.role, "Senior Engineer");

        console.log("Employee updated - New Role:", emp.role);
    }

    function testEmployeeTermination() public {
        vm.startPrank(hrAdmin);

        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Engineer",
            "Engineering"
        );

        employeeRegistry.updateEmployeeStatus(testDID, 3);

        vm.stopPrank();

        EmployeeRegistry.Employee memory emp = employeeRegistry.getEmployee(testDID);
        assertEq(emp.status, 3);

        console.log("Employee terminated - Status:", emp.status);
    }

    function testCredentialIssuance() public {
        vm.startPrank(hrAdmin);

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

        credentialRegistry.grantRole(credentialRegistry.ISSUER_ROLE(), hrAdmin);
        credentialRegistry.grantRole(credentialRegistry.VERIFIER_ROLE(), hrAdmin);

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

        vm.startPrank(hrAdmin);
        bool isValid = credentialRegistry.verifyCredential(testDID, "EmploymentCredential");
        vm.stopPrank();

        assertTrue(isValid);

        console.log("Credential verified:", isValid);
    }

    function testMultipleEmployees() public {
        vm.startPrank(hrAdmin);

        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash1",
            "Engineer",
            "Engineering"
        );

        employeeRegistry.registerEmployee(
            employee2,
            testDID2,
            "0xhash2",
            "Designer",
            "Design"
        );

        vm.stopPrank();

        assertEq(employeeRegistry.employeeCount(), 2);

        console.log("Total employees:", employeeRegistry.employeeCount());
    }

    function testOnlyHRAdminCanRegister() public {
        vm.startPrank(employee);

        vm.expectRevert("Not HR Admin");
        employeeRegistry.registerEmployee(
            employee,
            testDID,
            "0xhash123",
            "Engineer",
            "Engineering"
        );

        vm.stopPrank();

        console.log("Access control working - Only HR Admin can register");
    }

    function testCredentialRevocation() public {
        vm.startPrank(hrAdmin);

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

        credentialRegistry.revokeCredential(testDID, 0);

        vm.stopPrank();

        vm.startPrank(hrAdmin);
        credentialRegistry.grantRole(credentialRegistry.VERIFIER_ROLE(), hrAdmin);
        bool isValid = credentialRegistry.verifyCredential(testDID, "EmploymentCredential");
        vm.stopPrank();

        assertFalse(isValid);

        console.log("Credential revoked - Verification:", isValid);
    }
}
