const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HR Contracts Library", function () {
  let accessControl, credentialNFT, hrDAO;
  let owner, hrAdmin, finance, employee1, employee2, departmentHead;

  beforeEach(async function () {
    [owner, hrAdmin, finance, employee1, employee2, departmentHead] = await ethers.getSigners();

    // Deploy HRSAccessControl
    const HRSAccessControl = await ethers.getContractFactory("HRSAccessControl");
    accessControl = await HRSAccessControl.deploy();
    await accessControl.waitForDeployment();

    // Deploy CredentialNFT
    const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
    credentialNFT = await CredentialNFT.deploy();
    await credentialNFT.waitForDeployment();

    // Deploy HRDAO
    const HRDAO = await ethers.getContractFactory("HRDAO");
    hrDAO = await HRDAO.deploy();
    await hrDAO.waitForDeployment();

    // Grant roles
    await accessControl.grantRole(await accessControl.HR_ADMIN_ROLE(), hrAdmin.address);
  });

  describe("HRSAccessControl", function () {
    it("Should create department", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      await accessControl.createDepartment(deptId, "Engineering", departmentHead.address);

      const dept = await accessControl.departments(deptId);
      expect(dept.name).to.equal("Engineering");
      expect(dept.head).to.equal(departmentHead.address);
      expect(dept.active).to.be.true;
    });

    it("Should add employee to department", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      await accessControl.createDepartment(deptId, "Engineering", departmentHead.address);

      await accessControl.connect(departmentHead).addEmployeeToDepartment(deptId, employee1.address);

      expect(await accessControl.isDepartmentMember(deptId, employee1.address)).to.be.true;
    });

    it("Should remove employee from department", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      await accessControl.createDepartment(deptId, "Engineering", departmentHead.address);

      await accessControl.connect(departmentHead).addEmployeeToDepartment(deptId, employee1.address);
      await accessControl.connect(departmentHead).removeEmployeeFromDepartment(deptId, employee1.address);

      expect(await accessControl.isDepartmentMember(deptId, employee1.address)).to.be.false;
    });
  });

  describe("CredentialNFT", function () {
    it("Should issue credential", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      const tx = await credentialNFT.issueCredential(
        employee1.address,
        "EmploymentCredential",
        '{"role":"Engineer","startDate":"2024-01-01"}',
        deptId,
        0
      );
      const receipt = await tx.wait();

      // Get tokenId from event
      const event = receipt.logs.find(log => {
        try {
          return credentialNFT.interface.parseLog(log).name === 'CredentialIssued';
        } catch {
          return false;
        }
      });
      const parsedEvent = credentialNFT.interface.parseLog(event);
      const tokenId = parsedEvent.args.tokenId;

      expect(await credentialNFT.ownerOf(tokenId)).to.equal(employee1.address);
    });

    it("Should revoke credential", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      const tx = await credentialNFT.issueCredential(
        employee1.address,
        "EmploymentCredential",
        '{"role":"Engineer"}',
        deptId,
        0
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return credentialNFT.interface.parseLog(log).name === 'CredentialIssued';
        } catch {
          return false;
        }
      });
      const parsedEvent = credentialNFT.interface.parseLog(event);
      const tokenId = parsedEvent.args.tokenId;

      await credentialNFT.revokeCredential(tokenId);
      expect(await credentialNFT.isCredentialValid(tokenId)).to.be.false;
    });
  });

  describe("HRDAO", function () {
    it("Should create proposal", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      const tx = await hrDAO.createProposal(
        "Remote Work Policy",
        "Allow 4 days remote per week",
        deptId,
        50
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return hrDAO.interface.parseLog(log).name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      const parsedEvent = hrDAO.interface.parseLog(event);
      const proposalId = parsedEvent.args.id;

      const proposal = await hrDAO.getProposal(proposalId);
      expect(proposal.title).to.equal("Remote Work Policy");
    });

    it("Should cast vote", async function () {
      const deptId = ethers.keccak256(ethers.toUtf8Bytes("engineering"));
      const tx = await hrDAO.createProposal(
        "Remote Work Policy",
        "Allow 4 days remote per week",
        deptId,
        1
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return hrDAO.interface.parseLog(log).name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      const parsedEvent = hrDAO.interface.parseLog(event);
      const proposalId = parsedEvent.args.id;

      await hrDAO.castVote(proposalId, 1); // VoteType.For

      const proposal = await hrDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(1);
    });
  });
});
