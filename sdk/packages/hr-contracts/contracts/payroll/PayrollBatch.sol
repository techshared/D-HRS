// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PayrollBatch
 * @dev Batch payroll payments with multi-sig approval
 */
contract PayrollBatch is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct PayrollRun {
        uint256 id;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 totalAmount;
        uint256 employeeCount;
        PayrollStatus status;
        uint256 approvalCount;
        uint256 requiredApprovals;
        uint256 createdAt;
        uint256 executedAt;
    }

    struct EmployeePayment {
        address employee;
        uint256 amount;
        bytes32 departmentId;
        bool processed;
    }

    enum PayrollStatus {
        Pending,
        Approved,
        Executed,
        Failed,
        Cancelled
    }

    IERC20 public paymentToken;
    uint256 public payrollCount;
    uint256 public constant REQUIRED_APPROVALS = 2;

    mapping(uint256 => PayrollRun) public payrollRuns;
    mapping(uint256 => EmployeePayment[]) public payrollPayments;
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    event PayrollCreated(uint256 indexed runId, uint256 totalAmount, uint256 employeeCount);
    event PayrollApproved(uint256 indexed runId, address indexed approver);
    event PayrollExecuted(uint256 indexed runId, uint256 successCount, uint256 failCount);
    event PaymentProcessed(uint256 indexed runId, address indexed employee, uint256 amount);

    constructor(address _paymentToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev Create a new payroll run
     */
    function createPayroll(
        uint256 _periodStart,
        uint256 _periodEnd,
        address[] calldata _employees,
        uint256[] calldata _amounts,
        bytes32[] calldata _departmentIds
    ) external onlyRole(HR_ADMIN_ROLE) returns (uint256) {
        require(_employees.length == _amounts.length, "Arrays length mismatch");
        require(_employees.length == _departmentIds.length, "Arrays length mismatch");
        require(_periodStart < _periodEnd, "Invalid period");

        uint256 runId = payrollCount++;
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < _employees.length; i++) {
            totalAmount += _amounts[i];
            payrollPayments[runId].push(EmployeePayment({
                employee: _employees[i],
                amount: _amounts[i],
                departmentId: _departmentIds[i],
                processed: false
            }));
        }

        payrollRuns[runId] = PayrollRun({
            id: runId,
            periodStart: _periodStart,
            periodEnd: _periodEnd,
            totalAmount: totalAmount,
            employeeCount: _employees.length,
            status: PayrollStatus.Pending,
            approvalCount: 0,
            requiredApprovals: REQUIRED_APPROVALS,
            createdAt: block.timestamp,
            executedAt: 0
        });

        emit PayrollCreated(runId, totalAmount, _employees.length);
        return runId;
    }

    /**
     * @dev Approve payroll run
     */
    function approvePayroll(uint256 _runId) external onlyRole(FINANCE_ROLE) {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == PayrollStatus.Pending, "Not pending");
        require(!hasApproved[_runId][msg.sender], "Already approved");

        hasApproved[_runId][msg.sender] = true;
        run.approvalCount++;

        emit PayrollApproved(_runId, msg.sender);

        if (run.approvalCount >= run.requiredApprovals) {
            run.status = PayrollStatus.Approved;
        }
    }

    /**
     * @dev Execute payroll batch
     */
    function executePayroll(uint256 _runId) 
        external 
        onlyRole(EXECUTOR_ROLE) 
        nonReentrant 
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == PayrollStatus.Approved, "Not approved");

        run.status = PayrollStatus.Executed;
        run.executedAt = block.timestamp;

        EmployeePayment[] storage payments = payrollPayments[_runId];
        uint256 successCount = 0;
        uint256 failCount = 0;

        for (uint256 i = 0; i < payments.length; i++) {
            EmployeePayment storage payment = payments[i];
            
            // Use low-level call to handle failures gracefully
            (bool success, ) = address(paymentToken).call(
                abi.encodeWithSelector(
                    paymentToken.transfer.selector,
                    payment.employee,
                    payment.amount
                )
            );
            
            if (success) {
                payment.processed = true;
                successCount++;
                emit PaymentProcessed(_runId, payment.employee, payment.amount);
            } else {
                failCount++;
            }
        }

        emit PayrollExecuted(_runId, successCount, failCount);
    }

    /**
     * @dev Get payroll payments
     */
    function getPayrollPayments(uint256 _runId) 
        external 
        view 
        returns (EmployeePayment[] memory) 
    {
        return payrollPayments[_runId];
    }
}
