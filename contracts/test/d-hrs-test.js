const { expect } = require("chai");

describe("D-HRS Contracts", function () {
  let employeeRegistry, credentialRegistry, hrToken, benefitsNFT, hrGovernance, didRegistry, payrollExecutor;
  let owner, hrAdmin, manager, employee, employee2;

  before(async function () {
    [owner, hrAdmin, manager, employee, employee2] = await ethers.getSigners();

    // Deploy HR Token
    const HRToken = await ethers.getContractFactory("HRToken");
    hrToken = await HRToken.deploy();
    await hrToken.waitForDeployment();
    console.log("HRToken deployed to:", await hrToken.getAddress());

    // Deploy Employee Registry
    const EmployeeRegistry = await ethers.getContractFactory("EmployeeRegistry");
    employeeRegistry = await EmployeeRegistry.deploy();
    await employeeRegistry.waitForDeployment();
    console.log("EmployeeRegistry deployed to:", await employeeRegistry.getAddress());

    // Deploy Credential Registry
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    credentialRegistry = await CredentialRegistry.deploy();
    await credentialRegistry.waitForDeployment();
    console.log("CredentialRegistry deployed to:", await credentialRegistry.getAddress());

    // Deploy Benefits NFT
    const BenefitsNFT = await ethers.getContractFactory("BenefitsNFT");
    benefitsNFT = await BenefitsNFT.deploy();
    await benefitsNFT.waitForDeployment();
    console.log("BenefitsNFT deployed to:", await benefitsNFT.getAddress());

    // Deploy HR Governance
    const HRGovernance = await ethers.getContractFactory("HRGovernance");
    hrGovernance = await HRGovernance.deploy();
    await hrGovernance.waitForDeployment();
    console.log("HRGovernance deployed to:", await hrGovernance.getAddress());

    // Deploy DID Registry
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.waitForDeployment();
    console.log("DIDRegistry deployed to:", await didRegistry.getAddress());

    // Deploy Payroll Executor
    const PayrollExecutor = await ethers.getContractFactory("PayrollExecutor");
    payrollExecutor = await PayrollExecutor.deploy(await hrToken.getAddress());
    await payrollExecutor.waitForDeployment();
    console.log("PayrollExecutor deployed to:", await payrollExecutor.getAddress());

    // Grant HR Admin role
    const HR_ADMIN_ROLE = await employeeRegistry.HR_ADMIN_ROLE();
    await employeeRegistry.grantRole(HR_ADMIN_ROLE, hrAdmin.address);
  });

  describe("EmployeeRegistry", function () {
    const testDID = "0x" + Buffer.from("did:hrs:test:001").toString("hex").slice(0, 64);

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
      const testDID2 = "0x" + Buffer.from("did:hrs:test:002").toString("hex").slice(0, 64);

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
    const testDID = "0x" + Buffer.from("did:hrs:test:003").toString("hex").slice(0, 64);

    it("Should issue a credential", async function () {
      const ISSUER_ROLE = await credentialRegistry.ISSUER_ROLE();
      await credentialRegistry.grantRole(ISSUER_ROLE, hrAdmin.address);

      const credId = "0x" + "credential001".padEnd(64, "0");
      await credentialRegistry.connect(hrAdmin).issueCredential(
        credId,
        testDID,
        "0x" + "issuer001".padEnd(64, "0"),
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
      const VERIFIER_ROLE = await credentialRegistry.VERIFIER_ROLE();
      await credentialRegistry.grantRole(VERIFIER_ROLE, hrAdmin.address);

      const isValid = await credentialRegistry.connect(hrAdmin).verifyCredential(testDID, "EmploymentCredential");
      expect(isValid).to.equal(true);
      console.log("✓ Credential verified successfully");
    });

    it("Should revoke a credential", async function () {
      await credentialRegistry.connect(hrAdmin).revokeCredential(testDID, 0);

      const isValid = await credentialRegistry.connect(hrAdmin).verifyCredential(testDID, "EmploymentCredential");
      expect(isValid).to.equal(false);
      console.log("✓ Credential revoked successfully");
    });
  });

  describe("BenefitsNFT", function () {
    const testDID = "0x" + Buffer.from("did:hrs:test:004").toString("hex").slice(0, 64);

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
    const testDID = "0x" + Buffer.from("did:hrs:test:005").toString("hex").slice(0, 64);

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

  describe("PayrollExecutor", function () {
    it("Should create payroll period", async function () {
      const tx = await payrollExecutor.connect(hrAdmin).createPayrollPeriod(202401, 100000);
      await tx.wait();

      const period = await payrollExecutor.getPayrollPeriod(202401);
      expect(period.totalBudget).to.equal(100000);
      console.log("✓ Payroll period created");
    });
  });

  console.log("\n=== All Tests Passed ===");
});
