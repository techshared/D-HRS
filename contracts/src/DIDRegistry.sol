// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract DIDRegistry is AccessControlUpgradeable {
    struct DIDDocument {
        bytes32 did;
        string controller;
        string serviceEndpoint;
        string publicKey;
        uint256 created;
        uint256 updated;
    }

    mapping(bytes32 => DIDDocument) public documents;
    mapping(bytes32 => mapping(bytes32 => bool)) public authentications;

    event DIDCreated(bytes32 indexed did, string controller);
    event DIDUpdated(bytes32 indexed did);
    event DIDDeleted(bytes32 indexed did);

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createDID(
        bytes32 _did,
        string calldata _controller,
        string calldata _publicKey,
        string calldata _serviceEndpoint
    ) external {
        require(documents[_did].created == 0, "DID exists");
        
        documents[_did] = DIDDocument({
            did: _did,
            controller: _controller,
            publicKey: _publicKey,
            serviceEndpoint: _serviceEndpoint,
            created: block.timestamp,
            updated: block.timestamp
        });
        
        emit DIDCreated(_did, _controller);
    }

    function updateDID(
        bytes32 _did,
        string calldata _publicKey,
        string calldata _serviceEndpoint
    ) external {
        require(documents[_did].created > 0, "DID not found");
        
        documents[_did].publicKey = _publicKey;
        documents[_did].serviceEndpoint = _serviceEndpoint;
        documents[_did].updated = block.timestamp;
        
        emit DIDUpdated(_did);
    }

    function deleteDID(bytes32 _did) external {
        require(documents[_did].created > 0, "DID not found");
        delete documents[_did];
        emit DIDDeleted(_did);
    }

    function getDID(bytes32 _did) 
        external 
        view 
        returns (DIDDocument memory) 
    {
        return documents[_did];
    }

    function addAuthentication(
        bytes32 _did,
        bytes32 _authenticationId
    ) external {
        require(documents[_did].created > 0, "DID not found");
        authentications[_did][_authenticationId] = true;
    }

    function verifyAuthentication(
        bytes32 _did,
        bytes32 _authenticationId
    ) external view returns (bool) {
        return authentications[_did][_authenticationId];
    }
}
