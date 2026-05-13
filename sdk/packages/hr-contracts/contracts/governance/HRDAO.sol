// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title HRDAO
 * @dev Department-weighted governance for HR decisions
 */
contract HRDAO is AccessControl, Pausable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    enum VoteType { Against, For, Abstain }
    enum ProposalStatus { Active, Passed, Failed, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        bytes32 departmentId;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        uint256 quorum;
    }

    struct Voter {
        uint256 weight;
        bool voted;
        VoteType voteType;
    }

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant DEFAULT_QUORUM = 50;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Voter)) public voters;
    mapping(bytes32 => mapping(address => uint256)) public voterWeight;

    event ProposalCreated(
        uint256 indexed id,
        string title,
        address proposer,
        bytes32 departmentId
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
    }

    /**
     * @dev Create proposal
     */
    function createProposal(
        string calldata _title,
        string calldata _description,
        bytes32 _departmentId,
        uint256 _quorum
    ) external onlyRole(PROPOSER_ROLE) whenNotPaused returns (uint256) {
        uint256 id = proposalCount++;

        proposals[id] = Proposal({
            id: id,
            title: _title,
            description: _description,
            proposer: msg.sender,
            departmentId: _departmentId,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            status: ProposalStatus.Active,
            quorum: _quorum > 0 ? _quorum : DEFAULT_QUORUM
        });

        emit ProposalCreated(id, _title, msg.sender, _departmentId);
        return id;
    }

    /**
     * @dev Cast vote
     */
    function castVote(
        uint256 _proposalId,
        VoteType _voteType
    ) external onlyRole(VOTER_ROLE) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!voters[_proposalId][msg.sender].voted, "Already voted");

        uint256 weight = voterWeight[proposal.departmentId][msg.sender];
        if (weight == 0) weight = 1; // Default weight

        voters[_proposalId][msg.sender] = Voter({
            weight: weight,
            voted: true,
            voteType: _voteType
        });

        if (_voteType == VoteType.For) {
            proposal.forVotes += weight;
        } else if (_voteType == VoteType.Against) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(_proposalId, msg.sender, _voteType, weight);
    }

    /**
     * @dev Execute proposal
     */
    function executeProposal(uint256 _proposalId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");

        uint256 totalVotes = proposal.forVotes + 
                            proposal.againstVotes + 
                            proposal.abstainVotes;

        require(totalVotes >= proposal.quorum, "Quorum not reached");

        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Failed;
        }

        emit ProposalExecuted(_proposalId);
    }

    /**
     * @dev Set voter weight
     */
    function setVoterWeight(
        bytes32 _departmentId,
        address _voter,
        uint256 _weight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        voterWeight[_departmentId][_voter] = _weight;
    }

    /**
     * @dev Get proposal
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }
}
