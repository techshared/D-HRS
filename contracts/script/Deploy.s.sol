// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EmployeeRegistry.sol";
import "../src/CredentialRegistry.sol";
import "../src/PayrollExecutor.sol";
import "../src/BenefitsNFT.sol";
import "../src/HRGovernance.sol";
import "../src/DIDRegistry.sol";
import "../src/HRToken.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy HR Token
        HRToken hrToken = new HRToken();
        console.log("HRToken deployed at:", address(hrToken));

        // Deploy Employee Registry
        EmployeeRegistry employeeRegistry = new EmployeeRegistry();
        employeeRegistry.initialize();
        console.log("EmployeeRegistry deployed at:", address(employeeRegistry));

        // Deploy Credential Registry
        CredentialRegistry credentialRegistry = new CredentialRegistry();
        credentialRegistry.initialize();
        console.log("CredentialRegistry deployed at:", address(credentialRegistry));

        // Deploy Payroll Executor
        PayrollExecutor payrollExecutor = new PayrollExecutor(address(hrToken));
        payrollExecutor.initialize(address(hrToken));
        console.log("PayrollExecutor deployed at:", address(payrollExecutor));

        // Deploy Benefits NFT
        BenefitsNFT benefitsNFT = new BenefitsNFT();
        benefitsNFT.initialize();
        console.log("BenefitsNFT deployed at:", address(benefitsNFT));

        // Deploy HR Governance
        HRGovernance hrGovernance = new HRGovernance();
        hrGovernance.initialize();
        console.log("HRGovernance deployed at:", address(hrGovernance));

        // Deploy DID Registry
        DIDRegistry didRegistry = new DIDRegistry();
        didRegistry.initialize();
        console.log("DIDRegistry deployed at:", address(didRegistry));

        vm.stopBroadcast();
    }
}
