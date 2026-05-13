// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplianceEngine
 * @notice 链上合规引擎（中国版）。管理实名认证状态和制裁名单。
 *         所有 HR 写操作（注册/凭证/薪资审批/治理）通过 onlyCompliant
 *         修饰器进行合规检查。
 */
contract ComplianceEngine is AccessControl, Pausable {
    bytes32 public constant COMPLIANCE_ADMIN = keccak256("COMPLIANCE_ADMIN");

    // ── 实名认证等级 ──
    enum RealNameLevel { NONE, BASIC, ENHANCED }

    struct RealNameStatus {
        RealNameLevel level;
        uint256 expiry;
        string idNumberHash;
    }

    mapping(address => RealNameStatus) public realNameStatus;

    // ── 制裁名单 ──
    mapping(address => bool) public sanctioned;
    address[] public sanctionedList;
    uint256 public lastSanctionUpdate;

    // ── 事件 ──
    event RealNameUpdated(address indexed user, RealNameLevel level, uint256 expiry);
    event SanctionAdded(address indexed addr);
    event SanctionRemoved(address indexed addr);
    event ComplianceBlocked(address indexed user, string reason, bytes32 txId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ADMIN, msg.sender);
    }

    // ═══ 实名认证管理 ═══

    function updateRealName(
        address _user,
        RealNameLevel _level,
        uint256 _expiryDays,
        string calldata _idNumberHash
    ) external onlyRole(COMPLIANCE_ADMIN) {
        require(_user != address(0), "Zero address");
        realNameStatus[_user] = RealNameStatus({
            level: _level,
            expiry: block.timestamp + (_expiryDays * 1 days),
            idNumberHash: _idNumberHash
        });
        emit RealNameUpdated(_user, _level, realNameStatus[_user].expiry);
    }

    function getRealNameStatus(address _user)
        external
        view
        returns (RealNameLevel level, uint256 expiry, bool valid)
    {
        RealNameStatus storage s = realNameStatus[_user];
        return (s.level, s.expiry, s.level != RealNameLevel.NONE && s.expiry > block.timestamp);
    }

    // ═══ 制裁名单管理 ═══

    function addSanctioned(address _addr) external onlyRole(COMPLIANCE_ADMIN) {
        require(_addr != address(0), "Zero address");
        require(!sanctioned[_addr], "Already sanctioned");
        sanctioned[_addr] = true;
        sanctionedList.push(_addr);
        lastSanctionUpdate = block.timestamp;
        emit SanctionAdded(_addr);
    }

    function removeSanctioned(address _addr) external onlyRole(COMPLIANCE_ADMIN) {
        require(sanctioned[_addr], "Not sanctioned");
        sanctioned[_addr] = false;
        lastSanctionUpdate = block.timestamp;
        emit SanctionRemoved(_addr);
    }

    function batchAddSanctioned(address[] calldata _addrs) external onlyRole(COMPLIANCE_ADMIN) {
        for (uint i = 0; i < _addrs.length; i++) {
            if (!sanctioned[_addrs[i]]) {
                sanctioned[_addrs[i]] = true;
                sanctionedList.push(_addrs[i]);
            }
        }
        lastSanctionUpdate = block.timestamp;
    }

    function isSanctioned(address _addr) external view returns (bool) {
        return sanctioned[_addr];
    }

    function getSanctionedCount() external view returns (uint256) {
        return sanctionedList.length;
    }

    // ═══ 合规守卫 ═══

    /**
     * @notice 核心合规检查修饰器。所有业务合约的写操作应在最前面调用此函数。
     * @param _user  操作发起者地址
     * @param _txId  操作标识（用于日志关联）
     */
    function guard(address _user, bytes32 _txId) external view whenNotPaused {
        require(!sanctioned[_user], "Compliance: user sanctioned");

        RealNameStatus storage s = realNameStatus[_user];
        require(s.level != RealNameLevel.NONE, "Compliance: real name auth required");
        require(s.expiry > block.timestamp, "Compliance: real name auth expired");
    }

    function guardWithLevel(address _user, RealNameLevel _required, bytes32 _txId)
        external
        view
        whenNotPaused
    {
        require(!sanctioned[_user], "Compliance: user sanctioned");

        RealNameStatus storage s = realNameStatus[_user];
        require(s.level >= _required, "Compliance: auth level insufficient");
        require(s.expiry > block.timestamp, "Compliance: auth expired");
    }

    // ═══ 暂停 ═══

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
