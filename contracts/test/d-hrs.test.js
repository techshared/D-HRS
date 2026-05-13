const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D-HRS Contracts", function () {
  let employeeRegistry, credentialRegistry, benefitsNFT, hrGovernance, didRegistry, decentralizedHRS, complianceEngine;
  let owner, hrAdmin, manager, employee, employee2;

  before(async function () {
    [owner, hrAdmin, manager, employee, employee2] = await ethers.getSigners();

    // Deploy Compliance Engine
    const ComplianceEngine = await ethers.getContractFactory("ComplianceEngine");
    complianceEngine = await ComplianceEngine.deploy();
    console.log("ComplianceEngine deployed to:", complianceEngine.address);

    // Deploy Employee Registry (with ComplianceEngine address)
    const EmployeeRegistry = await ethers.getContractFactory("EmployeeRegistry");
    employeeRegistry = await EmployeeRegistry.deploy(complianceEngine.target);
    console.log("EmployeeRegistry deployed to:", employeeRegistry.address);

    // Grant HR_ADMIN_ROLE on EmployeeRegistry
    await employeeRegistry.grantRole(await employeeRegistry.HR_ADMIN_ROLE(), hrAdmin.address);

    // Set ComplianceEngine in EmployeeRegistry
    await employeeRegistry.setComplianceEngine(complianceEngine.target);

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

    // Deploy DID Registry (upgradeable - needs initialize)
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.initialize();
    console.log("DIDRegistry deployed to:", didRegistry.address);

    // Grant DID_ADMIN_ROLE for DIDRegistry
    await didRegistry.grantRole(await didRegistry.DID_ADMIN_ROLE(), owner.address);

    // Deploy DecentralizedHRS
    const DecentralizedHRS = await ethers.getContractFactory("DecentralizedHRS");
    decentralizedHRS = await DecentralizedHRS.deploy();
    console.log("DecentralizedHRS deployed to:", decentralizedHRS.address);

    // Grant roles for DecentralizedHRS
    await decentralizedHRS.grantRole(await decentralizedHRS.HR_ADMIN_ROLE(), hrAdmin.address);
    await decentralizedHRS.grantRole(await decentralizedHRS.EVALUATOR_ROLE(), hrAdmin.address);
    await decentralizedHRS.grantRole(await decentralizedHRS.DEPARTMENT_HEAD_ROLE(), hrAdmin.address);

    // Grant roles for governance
    await hrGovernance.grantRole(await hrGovernance.PROPOSER_ROLE(), hrAdmin.address);
    await hrGovernance.grantRole(await hrGovernance.VOTER_ROLE(), hrAdmin.address);

    // Grant roles for benefits NFT
    await benefitsNFT.grantRole(await benefitsNFT.MINTER_ROLE(), hrAdmin.address);

    // Register hrAdmin in ComplianceEngine (ENHANCED level, valid for 365 days)
    const RealNameLevel = { NONE: 0, BASIC: 1, ENHANCED: 2 };
    await complianceEngine.updateRealName(hrAdmin.address, RealNameLevel.ENHANCED, 365, "0xhradmin_hash");
    console.log("hrAdmin registered in ComplianceEngine with ENHANCED level");
  });

  describe("EmployeeRegistry", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:001"));

    it("Should register a new employee", async function () {
      await employeeRegistry.connect(hrAdmin).registerEmployee(
        employee.address,
        testDID,
        "0xhash123",
        "Software Engineer",
        "Engineering"
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
        "Engineering"
      );

      const emp = await employeeRegistry.getEmployee(testDID);
      expect(emp.role).to.equal("Senior Engineer");
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

      // Advance time to avoid rate limit
      const block = await ethers.provider.getBlock("latest");
      await hre.network.provider.send("evm_setNextBlockTimestamp", [block.timestamp + 61]);
      await hre.network.provider.send("evm_mine", []);

      await employeeRegistry.connect(hrAdmin).registerEmployee(
        employee2.address,
        testDID2,
        "0xhash456",
        "Designer",
        "Design"
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
      await hrGovernance.connect(hrAdmin).castVote(0, 1); // VoteType.For = 1

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

  describe("DecentralizedHRS - Employee Evaluation", function () {
    const testDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:eval001"));
    const evaluatorDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:evaluator:001"));

    it("Should create an employee evaluation", async function () {
      await decentralizedHRS.grantRole(await decentralizedHRS.EVALUATOR_ROLE(), hrAdmin.address);

      const evalId = await decentralizedHRS.createEvaluation.staticCall(
        testDID,
        evaluatorDID,
        0 // Performance type
      );

      await decentralizedHRS.connect(hrAdmin).createEvaluation(
        testDID,
        evaluatorDID,
        0 // Performance type
      );

      const evals = await decentralizedHRS.getEmployeeEvaluations(testDID);
      expect(evals.length).to.equal(1);
      expect(evals[0].evalType).to.equal(0);
      console.log("✓ Evaluation created successfully");
    });

    it("Should complete an evaluation with score", async function () {
      await decentralizedHRS.connect(hrAdmin).completeEvaluation(
        testDID,
        0,
        85,
        "0xperformancehash",
        "Strong technical skills",
        "Communication needs improvement",
        "Take public speaking course"
      );

      const evals = await decentralizedHRS.getEmployeeEvaluations(testDID);
      expect(evals[0].score).to.equal(85);
      expect(evals[0].status).to.equal(2); // Completed
      console.log("✓ Evaluation completed successfully");
    });

    it("Should dispute an evaluation", async function () {
      await decentralizedHRS.connect(hrAdmin).disputeEvaluation(testDID, 0);

      const evals = await decentralizedHRS.getEmployeeEvaluations(testDID);
      expect(evals[0].status).to.equal(3); // Disputed
      console.log("✓ Evaluation disputed successfully");
    });
  });

  describe("DecentralizedHRS - Job Postings & Recruitment", function () {
    it("Should create a job posting", async function () {
      const postingId = await decentralizedHRS.createJobPosting.staticCall(
        "Senior Software Engineer",
        "We are looking for a senior software engineer",
        "5+ years experience, React, Node.js",
        "Engineering",
        3, // Senior grade
        90000,
        120000,
        30
      );

      await decentralizedHRS.connect(hrAdmin).createJobPosting(
        "Senior Software Engineer",
        "We are looking for a senior software engineer",
        "5+ years experience, React, Node.js",
        "Engineering",
        3, // Senior grade
        90000,
        120000,
        30
      );

      const posting = await decentralizedHRS.getJobPosting(0);
      expect(posting.title).to.equal("Senior Software Engineer");
      expect(posting.department).to.equal("Engineering");
      console.log("✓ Job posting created successfully");
    });

    it("Should submit a job application", async function () {
      const applicantDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:applicant:001"));

      const appId = await decentralizedHRS.submitApplication.staticCall(
        0,
        applicantDID,
        employee.address,
        "0xresumehash",
        "0xcoverletterhash",
        []
      );

      await decentralizedHRS.connect(employee).submitApplication(
        0,
        applicantDID,
        employee.address,
        "0xresumehash",
        "0xcoverletterhash",
        []
      );

      const posting = await decentralizedHRS.getJobPosting(0);
      expect(posting.applicantCount).to.equal(1);
      console.log("✓ Job application submitted successfully");
    });

    it("Should update job posting status", async function () {
      await decentralizedHRS.connect(hrAdmin).updateJobPostingStatus(0, 2); // Interviewing

      const posting = await decentralizedHRS.getJobPosting(0);
      expect(posting.status).to.equal(2);
      console.log("✓ Job posting status updated");
    });

    it("Should update application status", async function () {
      const applicantDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:applicant:001"));

      await decentralizedHRS.connect(hrAdmin).updateApplicationStatus(0, applicantDID, 3); // Interview

      const apps = await decentralizedHRS.getJobApplications(0);
      expect(apps[0].status).to.equal(3);
      console.log("✓ Application status updated");
    });
  });

  describe("DecentralizedHRS - Promotions", function () {
    const promoDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:promo001"));

    it("Should initiate promotion review", async function () {
      await decentralizedHRS.grantRole(await decentralizedHRS.DEPARTMENT_HEAD_ROLE(), hrAdmin.address);

      const reviewId = await decentralizedHRS.connect(hrAdmin).initiatePromotionReview.staticCall(
        promoDID,
        2, // Mid level
        3, // Senior level
        90,
        85,
        88
      );

      await decentralizedHRS.connect(hrAdmin).initiatePromotionReview(
        promoDID,
        2,
        3,
        90,
        85,
        88
      );

      const reviews = await decentralizedHRS.getPromotionReviews(promoDID);
      expect(reviews.length).to.equal(1);
      expect(reviews[0].targetGrade).to.equal(3);
      console.log("✓ Promotion review initiated");
    });

    it("Should approve promotion", async function () {
      await decentralizedHRS.connect(hrAdmin).approvePromotion(promoDID, 0);

      const reviews = await decentralizedHRS.getPromotionReviews(promoDID);
      expect(reviews[0].approved).to.equal(true);
      console.log("✓ Promotion approved");
    });
  });

  describe("DecentralizedHRS - Salary Adjustments", function () {
    const salaryDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:salary001"));

    it("Should propose salary adjustment", async function () {
      await decentralizedHRS.connect(hrAdmin).proposeSalaryAdjustment(
        salaryDID,
        10, // 10% increase
        "Annual performance review",
        Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      );

      const history = await decentralizedHRS.getSalaryHistory(salaryDID);
      expect(history.length).to.equal(1);
      expect(history[0].adjustmentPercent).to.equal(10);
      console.log("✓ Salary adjustment proposed");
    });

    it("Should approve salary adjustment", async function () {
      await decentralizedHRS.connect(hrAdmin).approveSalaryAdjustment(salaryDID, 0);

      const history = await decentralizedHRS.getSalaryHistory(salaryDID);
      expect(history[0].approver).to.equal(hrAdmin.address);
      console.log("✓ Salary adjustment approved");
    });
  });

  describe("DecentralizedHRS - Job Transfers", function () {
    const transferDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:transfer001"));

    it("Should request job transfer", async function () {
      await decentralizedHRS.connect(hrAdmin).requestJobTransfer(
        transferDID,
        "Engineering",
        "Product",
        "Career growth in product management"
      );

      const transfers = await decentralizedHRS.getTransferHistory(transferDID);
      expect(transfers.length).to.equal(1);
      expect(transfers[0].toDepartment).to.equal("Product");
      console.log("✓ Job transfer requested");
    });

    it("Should approve job transfer", async function () {
      await decentralizedHRS.connect(hrAdmin).approveJobTransfer(transferDID, 0);

      const transfers = await decentralizedHRS.getTransferHistory(transferDID);
      expect(transfers[0].approved).to.equal(true);
      console.log("✓ Job transfer approved");
    });
  });

  describe("DecentralizedHRS - Layoffs", function () {
    const layoffDID = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:layoff001"));
    const layoffDID2 = ethers.keccak256(ethers.toUtf8Bytes("did:hrs:test:layoff002"));

    it("Should propose layoff", async function () {
      await decentralizedHRS.connect(hrAdmin).proposeLayoff(
        layoffDID,
        "Company restructuring",
        30,
        Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        "QmHashOfSeverance" // severanceHash (not amount)
      );

      const layoffs = await decentralizedHRS.getLayoffHistory(layoffDID);
      expect(layoffs.length).to.equal(1);
      expect(layoffs[0].reason).to.equal("Company restructuring");
      expect(layoffs[0].severanceHash).to.equal("QmHashOfSeverance");
      console.log("✓ Layoff proposed");
    });

    it("Should approve layoff", async function () {
      await decentralizedHRS.connect(hrAdmin).approveLayoff(layoffDID, 0);

      const layoffs = await decentralizedHRS.getLayoffHistory(layoffDID);
      expect(layoffs[0].approved).to.equal(true);
      console.log("✓ Layoff approved");
    });

    it("Should deny layoff", async function () {
      // Create a new layoff for denial test
      await decentralizedHRS.connect(hrAdmin).proposeLayoff(
        layoffDID2,
        "Department closure",
        60,
        Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60),
        "QmHashDenied"
      );

      await decentralizedHRS.connect(hrAdmin).denyLayoff(layoffDID2, 0);

      const layoffs = await decentralizedHRS.getLayoffHistory(layoffDID2);
      expect(layoffs[0].denied).to.equal(true);
      console.log("✓ Layoff denied");
    });

    it("Should reject approval of denied layoff", async function () {
      await expect(
        decentralizedHRS.connect(hrAdmin).approveLayoff(layoffDID2, 0)
      ).to.be.revertedWith("Already denied");
      console.log("✓ Denied layoff cannot be approved");
    });
  });

  describe("DecentralizedHRS - Job Grades", function () {
    it("Should get all job grades", async function () {
      const grades = await decentralizedHRS.getAllJobGrades();
      expect(grades.length).to.equal(8);
      expect(grades[0].grade).to.equal(0); // Entry
      expect(grades[7].grade).to.equal(7); // VP
      console.log("✓ Job grades retrieved");
    });

    it("Should update job grade", async function () {
      await decentralizedHRS.connect(hrAdmin).updateJobGrade(
        0, // Entry
        35000,
        50000,
        "Updated entry level position"
      );

      const grade = await decentralizedHRS.getJobGrade(0);
      expect(grade.minSalary).to.equal(35000);
      console.log("✓ Job grade updated");
    });
  });

  describe("ComplianceEngine", function () {
    const testAddr = ethers.Wallet.createRandom().address;

    it("Should have no real-name auth initially", async function () {
      const status = await complianceEngine.getRealNameStatus(testAddr);
      expect(status.level).to.equal(0); // NONE
      expect(status.valid).to.equal(false);
      console.log("✓ Initial auth status is NONE");
    });

    it("Should update and verify real-name status", async function () {
      await complianceEngine.updateRealName(testAddr, 2, 365, "0xtesthash");
      const status = await complianceEngine.getRealNameStatus(testAddr);
      expect(status.level).to.equal(2); // ENHANCED
      expect(status.valid).to.equal(true);
      console.log("✓ Real-name auth updated successfully");
    });

    it("Should add and check sanctioned address", async function () {
      await complianceEngine.addSanctioned(testAddr);
      const isSanctioned = await complianceEngine.isSanctioned(testAddr);
      expect(isSanctioned).to.equal(true);
      console.log("✓ Sanctioned address added");
    });
  });
});