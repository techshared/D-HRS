// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialNFT
 * @dev Soulbound NFT for HR credentials (non-transferable)
 */
contract CredentialNFT is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");

    struct Credential {
        uint256 tokenId;
        address holder;
        string credentialType;
        string metadata;
        bytes32 departmentId;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }

    uint256 public tokenIdCounter;
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) public holderCredentials;
    mapping(bytes32 => uint256[]) public departmentCredentials;

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed holder,
        string credentialType,
        bytes32 departmentId
    );
    event CredentialRevoked(uint256 indexed tokenId, address indexed by);

    constructor() ERC721("D-HRS Credential", "DHRS-CRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(REVOKER_ROLE, msg.sender);
    }

    /**
     * @dev Issue credential (soulbound - non-transferable)
     */
    function issueCredential(
        address _holder,
        string calldata _credentialType,
        string calldata _metadata,
        bytes32 _departmentId,
        uint256 _expiresAt
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        require(_holder != address(0), "Invalid holder");

        uint256 tokenId = tokenIdCounter++;

        _safeMint(_holder, tokenId);

        credentials[tokenId] = Credential({
            tokenId: tokenId,
            holder: _holder,
            credentialType: _credentialType,
            metadata: _metadata,
            departmentId: _departmentId,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false
        });

        holderCredentials[_holder].push(tokenId);
        departmentCredentials[_departmentId].push(tokenId);

        emit CredentialIssued(tokenId, _holder, _credentialType, _departmentId);
        return tokenId;
    }

    /**
     * @dev Revoke credential
     */
    function revokeCredential(uint256 _tokenId) external onlyRole(REVOKER_ROLE) {
        require(ownerOf(_tokenId) != address(0), "Token not exists");
        require(!credentials[_tokenId].revoked, "Already revoked");

        credentials[_tokenId].revoked = true;

        emit CredentialRevoked(_tokenId, msg.sender);
    }

    /**
     * @dev Check if credential is valid
     */
    function isCredentialValid(uint256 _tokenId) external view returns (bool) {
        require(ownerOf(_tokenId) != address(0), "Token not exists");

        Credential storage cred = credentials[_tokenId];

        if (cred.revoked) return false;
        if (cred.expiresAt > 0 && block.timestamp > cred.expiresAt) return false;

        return true;
    }

    /**
     * @dev Get holder credentials
     */
    function getHolderCredentials(address _holder) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return holderCredentials[_holder];
    }

    /**
     * @dev Get department credentials
     */
    function getDepartmentCredentials(bytes32 _departmentId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return departmentCredentials[_departmentId];
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
