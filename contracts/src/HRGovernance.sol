// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract HRGovernance is AccessControl, Pausable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    enum VoteType { Against, For, Abstain }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 status;
        uint256 quorum;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votes;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_PERCENTAGE = 50;

    event ProposalCreated(
        uint256 indexed id,
        string title,
        address proposer
    );
    event VoteCast(
        uint256 indexed proposalId,
        address voter,
        uint256 weight,
        VoteType voteType
    );
    event ProposalExecuted(uint256 indexed proposalId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
    }

    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _quorum
    ) external onlyRole(PROPOSER_ROLE) whenNotPaused {
        uint256 id = proposalCount++;
        
        Proposal storage proposal = proposals[id];
        proposal.id = id;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        proposal.status = 1;
        proposal.quorum = _quorum > 0 ? _quorum : QUORUM_PERCENTAGE;

        emit ProposalCreated(id, _title, msg.sender);
    }

    function castVote(
        uint256 _proposalId,
        VoteType _voteType
    ) external onlyRole(VOTER_ROLE) whenNotPaused {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == 1, "Proposal not active");
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        uint256 _weight = 1;
        
        hasVoted[_proposalId][msg.sender] = true;
        votes[_proposalId][msg.sender] = _weight;
        
        if (_voteType == VoteType.For) {
            proposal.forVotes += _weight;
        } else if (_voteType == VoteType.Against) {
            proposal.againstVotes += _weight;
        } else {
            proposal.abstainVotes += _weight;
        }

        emit VoteCast(_proposalId, msg.sender, _weight, _voteType);
    }

    function executeProposal(uint256 _proposalId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenNotPaused
    {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == 1, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        
        uint256 totalVotes = proposal.forVotes + 
                            proposal.againstVotes + 
                            proposal.abstainVotes;
        
        require(totalVotes >= proposal.quorum, "Quorum not reached");
        
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.status = 2;
        } else {
            proposal.status = 3;
        }

        emit ProposalExecuted(_proposalId);
    }

    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
