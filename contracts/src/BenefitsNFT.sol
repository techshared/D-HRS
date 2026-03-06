// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract BenefitsNFT is ERC721, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    struct Benefit {
        bytes32 employeeDid;
        string benefitType;
        string coverageLevel;
        uint256 startDate;
        uint256 endDate;
        bool active;
        string tokenURI_;
    }

    mapping(uint256 => Benefit) public benefitDetails;
    mapping(bytes32 => uint256[]) public employeeBenefits;
    uint256 public nextTokenId;

    event BenefitMinted(
        uint256 indexed tokenId,
        bytes32 indexed employeeDid,
        string benefitType
    );
    event BenefitRevoked(uint256 indexed tokenId);

    constructor() ERC721("D-HRS Benefits", "DBNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function mintBenefit(
        address _to,
        bytes32 _employeeDid,
        string calldata _benefitType,
        string calldata _coverageLevel,
        uint256 _durationDays,
        string calldata _tokenURI_
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        uint256 tokenId = nextTokenId++;
        _safeMint(_to, tokenId);

        Benefit storage benefit = benefitDetails[tokenId];
        benefit.employeeDid = _employeeDid;
        benefit.benefitType = _benefitType;
        benefit.coverageLevel = _coverageLevel;
        benefit.startDate = block.timestamp;
        benefit.endDate = block.timestamp + (_durationDays * 1 days);
        benefit.active = true;
        benefit.tokenURI_ = _tokenURI_;

        employeeBenefits[_employeeDid].push(tokenId);

        emit BenefitMinted(tokenId, _employeeDid, _benefitType);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return benefitDetails[tokenId].tokenURI_;
    }

    function revokeBenefit(uint256 _tokenId) 
        external 
        onlyRole(BURNER_ROLE) 
    {
        require(_ownerOf(_tokenId) != address(0), "Token not exists");
        
        benefitDetails[_tokenId].active = false;
        _burn(_tokenId);
        
        emit BenefitRevoked(_tokenId);
    }

    function getEmployeeBenefits(bytes32 _employeeDid) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return employeeBenefits[_employeeDid];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
