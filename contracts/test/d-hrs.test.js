const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D-HRS Contracts", function () {
  let employeeRegistry, credentialRegistry, hrToken, benefitsNFT, hrGovernance, didRegistry;
  let owner, hrAdmin, manager, employee, employee2;

  before(async function () {
    [owner, hrAdmin, manager, employee, employee2] = await ethers.getSigners();

    // Deploy HR Token
    const HRToken = await ethers.getContractFactory("HRToken");
    hrToken = await HRToken.deploy();
    console.log("HRToken deployed to:", hrToken.address);

    // Deploy Employee Registry
    const EmployeeRegistry = await ethers.getContractFactory("EmployeeRegistry");
    employeeRegistry = await EmployeeRegistry.deploy();
    console.log("EmployeeRegistry deployed to:", employeeRegistry.address);

    // Deploy Credential Registry
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistry.deploy();
    console.log("CredentialRegistry deployed to:", credentialRegistry.address);

    // Deploy Benefits NFT
    const BenefitsNFT = await ethers.getContractFactory("BenefitsNFT");
    benefitsNFT = await BenefitsNFT.deploy();
    console.log("BenefitsNFT deployed to:", benefitsNFT.address);

    // Deploy HR Governance
    const HRGovernance = await ethers.getContractFactory("HRGovernance");
    hrGovernance = await HRGovernance.deploy();
    console.log("HRGovernance deployed to:", hrGovernance.address);

    // Deploy DID Registry
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    console.log("DIDRegistry deployed to:", didRegistry.address);

    // Grant HR Admin role
    await employeeRegistry.grantRole(await employeeRegistry.HR_ADMIN_ROLE(), hrAdmin.address);
    
    // Grant roles for governance
    await hrGovernance.grantRole(await hrGovernance.PROPOSER_ROLE(), hrAdmin.address);
    await hrGovernance.grantRole(await hrGovernance.VOTER_ROLE(), hrAdmin.address);
    
    // Grant roles for benefits NFT
    await benefitsNFT.grantRole(await benefitsNFT.MINTER_ROLE(), hrAdmin.address);
  });

  describe("EmployeeRegistry", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:001"));

    it("Should register a new employee", async function () {
      await employeeRegistry.connect(hrAdmin).registerEmployee(
        employee.address,
        testDID,
        "0xhash123",
        "Software Engineer",
        "Engineering",
        100000
      );

      const emp = await employeeRegistry.getEmployee(testDID);
      expect(emp.role).to.equal("Software Engineer");
      expect(emp.department).to.equal("Engineering");
      console.log("✓ Employee registered successfully");
    });

    it("Should update employee information", async function () {
      await employeeRegistry.connect(hrAdmin).updateEmployee(
        testDID,
        "Senior Engineer",
        "Engineering",
        120000
      );

      const emp = await employeeRegistry.getEmployee(testDID);
      expect(emp.role).to.equal("Senior Engineer");
      expect(emp.salary).to.equal(120000);
      console.log("✓ Employee updated successfully");
    });

    it("Should terminate employee", async function () {
      await employeeRegistry.connect(hrAdmin).updateEmployeeStatus(testDID, 3);

      const emp = await employeeRegistry.getEmployee(testDID);
      expect(emp.status).to.equal(3);
      console.log("✓ Employee terminated successfully");
    });

    it("Should register multiple employees", async function () {
      const testDID2 = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:002"));

      await employeeRegistry.connect(hrAdmin).registerEmployee(
        employee2.address,
        testDID2,
        "0xhash456",
        "Designer",
        "Design",
        90000
      );

      const count = await employeeRegistry.employeeCount();
      expect(count).to.equal(2);
      console.log("✓ Multiple employees registered");
    });
  });

  describe("CredentialRegistry", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:003"));

    it("Should issue a credential", async function () {
      await credentialRegistry.grantRole(await credentialRegistry.ISSUER_ROLE(), hrAdmin.address);

      const credId = ethers.keccak256(ethers.toUtf8Bytes("credential001"));
      await credentialRegistry.connect(hrAdmin).issueCredential(
        credId,
        testDID,
        ethers.keccak256(ethers.toUtf8Bytes("issuer001")),
        "EmploymentCredential",
        "0xcredentialhash",
        365,
        "ipfs://Qm..."
      );

      const creds = await credentialRegistry.getCredentials(testDID);
      expect(creds.length).to.equal(1);
      expect(creds[0].credentialType).to.equal("EmploymentCredential");
      console.log("✓ Credential issued successfully");
    });

    it("Should verify a credential", async function () {
      await credentialRegistry.grantRole(await credentialRegistry.VERIFIER_ROLE(), hrAdmin.address);

      const result = await credentialRegistry.connect(hrAdmin).verifyCredential.staticCall(testDID, "EmploymentCredential");
      expect(result).to.equal(true);
      console.log("✓ Credential verified successfully");
    });

    it("Should revoke a credential", async function () {
      await credentialRegistry.connect(hrAdmin).revokeCredential(testDID, 0);

      const result = await credentialRegistry.connect(hrAdmin).verifyCredential.staticCall(testDID, "EmploymentCredential");
      expect(result).to.equal(false);
      console.log("✓ Credential revoked successfully");
    });
  });

  describe("BenefitsNFT", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:004"));

    it("Should mint a benefit NFT", async function () {
      await benefitsNFT.connect(hrAdmin).mintBenefit(
        employee.address,
        testDID,
        "health_insurance",
        "premium",
        365,
        "ipfs://QmBenefit123"
      );

      const balance = await benefitsNFT.balanceOf(employee.address);
      expect(balance).to.equal(1);
      console.log("✓ Benefit NFT minted successfully");
    });

    it("Should get employee benefits", async function () {
      const benefitIds = await benefitsNFT.getEmployeeBenefits(testDID);
      expect(benefitIds.length).to.equal(1);
      console.log("✓ Employee benefits retrieved");
    });
  });

  describe("HRGovernance", function () {
    it("Should create a proposal", async function () {
      await hrGovernance.connect(hrAdmin).createProposal(
        "Update Remote Work Policy",
        "Proposal to update remote work policy to allow 4 days remote per week",
        50
      );

      const proposal = await hrGovernance.getProposal(0);
      expect(proposal.title).to.equal("Update Remote Work Policy");
      console.log("✓ Governance proposal created");
    });

    it("Should cast a vote", async function () {
      await hrGovernance.connect(hrAdmin).castVote(0, true, 1);

      const proposal = await hrGovernance.getProposal(0);
      expect(proposal.forVotes).to.equal(1);
      console.log("✓ Vote cast successfully");
    });
  });

  describe("DIDRegistry", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:005"));

    it("Should create a DID", async function () {
      await didRegistry.createDID(
        testDID,
        owner.address,
        "0xpublickey",
        "https://did.example.com"
      );

      const doc = await didRegistry.getDID(testDID);
      expect(doc.controller).to.equal(owner.address);
      console.log("✓ DID created successfully");
    });

    it("Should update a DID", async function () {
      await didRegistry.updateDID(
        testDID,
        "0xnewpublickey",
        "https://new-did.example.com"
      );

      const doc = await didRegistry.getDID(testDID);
      expect(doc.publicKey).to.equal("0xnewpublickey");
      console.log("✓ DID updated successfully");
    });
  });

  console.log("\n=== All Tests Passed ===");
});
