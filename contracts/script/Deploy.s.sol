// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EmployeeRegistry.sol";
import "../src/CredentialRegistry.sol";
import "../src/PayrollExecutor.sol";
import "../src/BenefitsNFT.sol";
import "../src/HRGovernance.sol";
import "../src/DIDRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        EmployeeRegistry employeeRegistry = new EmployeeRegistry();
        console.log("EmployeeRegistry deployed at:", address(employeeRegistry));

        CredentialRegistry credentialRegistry = new CredentialRegistry();
        console.log("CredentialRegistry deployed at:", address(credentialRegistry));

        PayrollExecutor payrollExecutor = new PayrollExecutor();
        console.log("PayrollExecutor deployed at:", address(payrollExecutor));

        BenefitsNFT benefitsNFT = new BenefitsNFT();
        console.log("BenefitsNFT deployed at:", address(benefitsNFT));

        HRGovernance hrGovernance = new HRGovernance();
        console.log("HRGovernance deployed at:", address(hrGovernance));

        DIDRegistry didRegistry = new DIDRegistry();
        console.log("DIDRegistry deployed at:", address(didRegistry));

        vm.stopBroadcast();
    }
}
