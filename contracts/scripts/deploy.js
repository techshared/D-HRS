const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);

  const getAddress = async (contract) => {
    await contract.waitForDeployment();
    return await contract.getAddress();
  };

  // Deploy HR Token
  const HRToken = await hre.ethers.getContractFactory("HRToken");
  const hrToken = await HRToken.deploy();
  const hrTokenAddress = await getAddress(hrToken);
  console.log("HRToken deployed to:", hrTokenAddress);

  // Deploy Employee Registry
  const EmployeeRegistry = await hre.ethers.getContractFactory("EmployeeRegistry");
  const employeeRegistry = await EmployeeRegistry.deploy();
  const employeeRegistryAddress = await getAddress(employeeRegistry);
  console.log("EmployeeRegistry deployed to:", employeeRegistryAddress);

  // Deploy Credential Registry
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  const credentialRegistryAddress = await getAddress(credentialRegistry);
  console.log("CredentialRegistry deployed to:", credentialRegistryAddress);

  // Deploy Payroll Executor
  const PayrollExecutor = await hre.ethers.getContractFactory("PayrollExecutor");
  const payrollExecutor = await PayrollExecutor.deploy(hrTokenAddress);
  const payrollExecutorAddress = await getAddress(payrollExecutor);
  console.log("PayrollExecutor deployed to:", payrollExecutorAddress);

  // Deploy Benefits NFT
  const BenefitsNFT = await hre.ethers.getContractFactory("BenefitsNFT");
  const benefitsNFT = await BenefitsNFT.deploy();
  const benefitsNFTAddress = await getAddress(benefitsNFT);
  console.log("BenefitsNFT deployed to:", benefitsNFTAddress);

  // Deploy HR Governance
  const HRGovernance = await hre.ethers.getContractFactory("HRGovernance");
  const hrGovernance = await HRGovernance.deploy();
  const hrGovernanceAddress = await getAddress(hrGovernance);
  console.log("HRGovernance deployed to:", hrGovernanceAddress);

  // Deploy DID Registry
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  const didRegistryAddress = await getAddress(didRegistry);
  console.log("DIDRegistry deployed to:", didRegistryAddress);

  // Deploy DecentralizedHRS
  const DecentralizedHRS = await hre.ethers.getContractFactory("DecentralizedHRS");
  const decentralizedHRS = await DecentralizedHRS.deploy();
  const decentralizedHRSAddress = await getAddress(decentralizedHRS);
  console.log("DecentralizedHRS deployed to:", decentralizedHRSAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("HRToken:", hrTokenAddress);
  console.log("EmployeeRegistry:", employeeRegistryAddress);
  console.log("CredentialRegistry:", credentialRegistryAddress);
  console.log("PayrollExecutor:", payrollExecutorAddress);
  console.log("BenefitsNFT:", benefitsNFTAddress);
  console.log("HRGovernance:", hrGovernanceAddress);
  console.log("DIDRegistry:", didRegistryAddress);
  console.log("DecentralizedHRS:", decentralizedHRSAddress);

  const fs = require("fs");
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId || 31337;
  
  const deploymentAddresses = {
    HRToken: hrTokenAddress,
    EmployeeRegistry: employeeRegistryAddress,
    CredentialRegistry: credentialRegistryAddress,
    PayrollExecutor: payrollExecutorAddress,
    BenefitsNFT: benefitsNFTAddress,
    HRGovernance: hrGovernanceAddress,
    DIDRegistry: didRegistryAddress,
    DecentralizedHRS: decentralizedHRSAddress,
    chainId: chainId,
    network: networkName,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(deploymentAddresses, null, 2)
  );
  console.log("\nDeployment addresses saved to deployment-addresses.json");
  console.log(`Network: ${networkName}, Chain ID: ${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
