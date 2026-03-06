// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CredentialRegistry is AccessControl, Pausable {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Credential {
        bytes32 id;
        bytes32 subjectDid;
        bytes32 issuerDid;
        string credentialType;
        string dataHash;
        uint256 issueDate;
        uint256 expiryDate;
        uint256 status;
        string metadataURI;
    }

    mapping(bytes32 => Credential[]) public credentials;
    mapping(bytes32 => bool) public revokedCredentials;

    event CredentialIssued(
        bytes32 indexed credentialId,
        bytes32 indexed subjectDid,
        string credentialType
    );
    event CredentialRevoked(bytes32 indexed credentialId);
    event CredentialVerified(
        bytes32 indexed subjectDid,
        string credentialType,
        bool isValid
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function issueCredential(
        bytes32 _credentialId,
        bytes32 _subjectDid,
        bytes32 _issuerDid,
        string calldata _credentialType,
        string calldata _dataHash,
        uint256 _expiryDays,
        string calldata _metadataURI
    ) external onlyRole(ISSUER_ROLE) whenNotPaused {
        require(!revokedCredentials[_credentialId], "Credential already revoked");

        Credential memory credential = Credential({
            id: _credentialId,
            subjectDid: _subjectDid,
            issuerDid: _issuerDid,
            credentialType: _credentialType,
            dataHash: _dataHash,
            issueDate: block.timestamp,
            expiryDate: block.timestamp + (_expiryDays * 1 days),
            status: 0,
            metadataURI: _metadataURI
        });

        credentials[_subjectDid].push(credential);

        emit CredentialIssued(_credentialId, _subjectDid, _credentialType);
    }

    function revokeCredential(bytes32 _subjectDid, uint256 _index) 
        external 
        onlyRole(ISSUER_ROLE) 
    {
        require(_index < credentials[_subjectDid].length, "Invalid index");
        
        Credential storage credential = credentials[_subjectDid][_index];
        credential.status = 1;
        revokedCredentials[credential.id] = true;

        emit CredentialRevoked(credential.id);
    }

    function verifyCredential(
        bytes32 _subjectDid,
        string calldata _credentialType
    ) 
        external 
        onlyRole(VERIFIER_ROLE) 
        returns (bool) 
    {
        Credential[] storage creds = credentials[_subjectDid];
        
        for (uint256 i = creds.length; i > 0; i--) {
            Credential memory cred = creds[i - 1];
            
            if (keccak256(bytes(cred.credentialType)) == 
                keccak256(bytes(_credentialType))) {
                
                bool isValid = (cred.status == 0 && 
                               block.timestamp < cred.expiryDate);
                
                emit CredentialVerified(_subjectDid, _credentialType, isValid);
                return isValid;
            }
        }
        
        emit CredentialVerified(_subjectDid, _credentialType, false);
        return false;
    }

    function getCredentials(bytes32 _subjectDid) 
        external 
        view 
        returns (Credential[] memory) 
    {
        return credentials[_subjectDid];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
