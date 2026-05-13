// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PayrollExecutor
 * @notice Approval-only payroll workflow. Records approvals on-chain;
 *         actual salary disbursement is handled by the employer
 *         via traditional banking channels (no on-chain payments).
 *         No ERC-20 transfers. No crypto. Pure approval + event recording.
 */
contract PayrollExecutor is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct PayrollRun {
        uint256 id;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 totalAmount;
        uint256 status;       // 0=Pending, 1=Approved, 2=Recorded
        uint256 approvalCount;
        address[] approvers;
        mapping(address => bool) approved;
        uint256 createdAt;
    }

    struct EmployeePayment {
        bytes32 did;
        uint256 grossAmount;
        uint256 status;       // 0=Pending, 1=Recorded
    }

    mapping(uint256 => PayrollRun) public payrollRuns;
    mapping(uint256 => EmployeePayment[]) public payrollPayments;
    uint256 public payrollCount;

    uint256 public constant REQUIRED_APPROVALS = 2;

    event PayrollRunCreated(uint256 indexed runId, uint256 periodStart, uint256 periodEnd);
    event PayrollApproved(uint256 indexed runId, address indexed approver);
    event PayrollRecorded(uint256 indexed runId, uint256 employeeCount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
    }

    function createPayrollRun(
        uint256 _periodStart,
        uint256 _periodEnd,
        EmployeePayment[] calldata _payments
    )
        external
        onlyRole(HR_ADMIN_ROLE)
        whenNotPaused
    {
        uint256 runId = payrollCount++;

        PayrollRun storage run = payrollRuns[runId];
        run.id = runId;
        run.periodStart = _periodStart;
        run.periodEnd = _periodEnd;
        run.status = 0;
        run.approvalCount = 0;
        run.createdAt = block.timestamp;

        uint256 total;
        for (uint256 i = 0; i < _payments.length; i++) {
            total += _payments[i].grossAmount;
            payrollPayments[runId].push(_payments[i]);
        }
        run.totalAmount = total;

        emit PayrollRunCreated(runId, _periodStart, _periodEnd);
    }

    function approvePayroll(uint256 _runId)
        external
        onlyRole(FINANCE_ROLE)
        whenNotPaused
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == 0, "Payroll not pending");
        require(!run.approved[msg.sender], "Already approved");

        run.approved[msg.sender] = true;
        run.approvers.push(msg.sender);
        run.approvalCount++;

        emit PayrollApproved(_runId, msg.sender);

        if (run.approvalCount >= REQUIRED_APPROVALS) {
            run.status = 1;
        }
    }

    /**
     * @notice Mark payroll as recorded. No on-chain transfer — employer
     *         disburses salary via banking channels, then calls this
     *         to record the event on-chain for audit trail.
     */
    function recordPayroll(uint256 _runId)
        external
        onlyRole(EXECUTOR_ROLE)
        whenNotPaused
        nonReentrant
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == 1, "Payroll not approved");

        run.status = 2;

        EmployeePayment[] storage payments = payrollPayments[_runId];
        for (uint256 i = 0; i < payments.length; i++) {
            payments[i].status = 1;
        }

        emit PayrollRecorded(_runId, payments.length);
    }

    function getPayments(uint256 _runId)
        external
        view
        returns (EmployeePayment[] memory)
    {
        return payrollPayments[_runId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}