const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const getAddress = async (contract) => {
    await contract.waitForDeployment();
    return await contract.getAddress();
  };

  // Deploy Compliance Engine
  const ComplianceEngine = await hre.ethers.getContractFactory("ComplianceEngine");
  const complianceEngine = await ComplianceEngine.deploy();
  const complianceEngineAddress = await getAddress(complianceEngine);
  console.log("ComplianceEngine deployed to:", complianceEngineAddress);

  // Deploy Employee Registry (with ComplianceEngine address)
  const EmployeeRegistry = await hre.ethers.getContractFactory("EmployeeRegistry");
  const employeeRegistry = await EmployeeRegistry.deploy(complianceEngineAddress);
  const employeeRegistryAddress = await getAddress(employeeRegistry);
  console.log("EmployeeRegistry deployed to:", employeeRegistryAddress);

  // Set ComplianceEngine in EmployeeRegistry
  await employeeRegistry.setComplianceEngine(complianceEngineAddress);
  console.log("ComplianceEngine linked to EmployeeRegistry");

  // Deploy Credential Registry
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  const credentialRegistryAddress = await getAddress(credentialRegistry);
  console.log("CredentialRegistry deployed to:", credentialRegistryAddress);

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

  // Deploy DID Registry (upgradeable - needs initialize)
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
  console.log("ComplianceEngine:", complianceEngineAddress);
  console.log("EmployeeRegistry:", employeeRegistryAddress);
  console.log("CredentialRegistry:", credentialRegistryAddress);
  console.log("BenefitsNFT:", benefitsNFTAddress);
  console.log("HRGovernance:", hrGovernanceAddress);
  console.log("DIDRegistry:", didRegistryAddress);
  console.log("DecentralizedHRS:", decentralizedHRSAddress);

  const fs = require("fs");
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId || 31337;

  const deploymentAddresses = {
    ComplianceEngine: complianceEngineAddress,
    EmployeeRegistry: employeeRegistryAddress,
    CredentialRegistry: credentialRegistryAddress,
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
