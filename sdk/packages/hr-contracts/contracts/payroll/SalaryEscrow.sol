// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SalaryEscrow
 * @dev Time-locked salary escrow for employment contracts
 */
contract SalaryEscrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant EMPLOYEE_ROLE = keccak256("EMPLOYEE_ROLE");

    struct Escrow {
        uint256 id;
        address employee;
        uint256 amount;
        uint256 releaseTime;
        uint256 vestingStart;
        uint256 vestingDuration;
        uint256 claimed;
        EscrowStatus status;
        bytes32 departmentId;
    }

    enum EscrowStatus {
        Active,
        Claimed,
        Revoked,
        Expired
    }

    IERC20 public escrowToken;
    uint256 public escrowCount;

    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public employeeEscrows;

    event EscrowCreated(
        uint256 indexed id,
        address indexed employee,
        uint256 amount,
        uint256 releaseTime
    );
    event EscrowClaimed(uint256 indexed id, address indexed employee, uint256 amount);
    event EscrowRevoked(uint256 indexed id, address indexed by);

    constructor(address _escrowToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        escrowToken = IERC20(_escrowToken);
    }

    /**
     * @dev Create salary escrow
     */
    function createEscrow(
        address _employee,
        uint256 _amount,
        uint256 _releaseTime,
        uint256 _vestingDuration,
        bytes32 _departmentId
    ) external onlyRole(HR_ADMIN_ROLE) returns (uint256) {
        require(_employee != address(0), "Invalid employee");
        require(_amount > 0, "Amount must be > 0");
        require(_releaseTime > block.timestamp, "Release time must be future");

        uint256 id = escrowCount++;

        escrows[id] = Escrow({
            id: id,
            employee: _employee,
            amount: _amount,
            releaseTime: _releaseTime,
            vestingStart: block.timestamp,
            vestingDuration: _vestingDuration,
            claimed: 0,
            status: EscrowStatus.Active,
            departmentId: _departmentId
        });

        employeeEscrows[_employee].push(id);

        escrowToken.safeTransferFrom(msg.sender, address(this), _amount);

        emit EscrowCreated(id, _employee, _amount, _releaseTime);
        return id;
    }

    /**
     * @dev Claim vested tokens
     */
    function claimEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Active, "Not active");
        require(msg.sender == escrow.employee, "Not employee");
        require(block.timestamp >= escrow.releaseTime, "Not yet released");

        uint256 vested = getVestedAmount(_escrowId);
        uint256 claimable = vested - escrow.claimed;

        require(claimable > 0, "Nothing to claim");

        escrow.claimed += claimable;

        if (escrow.claimed >= escrow.amount) {
            escrow.status = EscrowStatus.Claimed;
        }

        escrowToken.safeTransfer(msg.sender, claimable);

        emit EscrowClaimed(_escrowId, msg.sender, claimable);
    }

    /**
     * @dev Get vested amount
     */
    function getVestedAmount(uint256 _escrowId) public view returns (uint256) {
        Escrow storage escrow = escrows[_escrowId];

        if (block.timestamp < escrow.releaseTime) {
            return 0;
        }

        if (escrow.vestingDuration == 0) {
            return escrow.amount;
        }

        uint256 elapsed = block.timestamp - escrow.vestingStart;
        if (elapsed >= escrow.vestingDuration) {
            return escrow.amount;
        }

        return (escrow.amount * elapsed) / escrow.vestingDuration;
    }

    /**
     * @dev Revoke escrow (HR Admin only, before release)
     */
    function revokeEscrow(uint256 _escrowId) external onlyRole(HR_ADMIN_ROLE) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Active, "Not active");
        require(block.timestamp < escrow.releaseTime, "Already released");

        escrow.status = EscrowStatus.Revoked;
        escrowToken.safeTransfer(msg.sender, escrow.amount);

        emit EscrowRevoked(_escrowId, msg.sender);
    }

    /**
     * @dev Get employee escrows
     */
    function getEmployeeEscrows(address _employee) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return employeeEscrows[_employee];
    }
}
