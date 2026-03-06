// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PayrollExecutor is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    struct PayrollRun {
        uint256 id;
        uint256 periodStart;
        uint256 periodEnd;
        uint256 totalAmount;
        uint256 status;
        uint256 approvalCount;
        address[] approvers;
        mapping(address => bool) approved;
        uint256 createdAt;
    }

    struct EmployeePayment {
        bytes32 did;
        address wallet;
        uint256 grossAmount;
        uint256 deductions;
        uint256 netAmount;
        uint256 status;
    }

    mapping(uint256 => PayrollRun) public payrollRuns;
    mapping(uint256 => EmployeePayment[]) public payrollPayments;
    uint256 public payrollCount;
    
    address public paymentToken;
    uint256 public constant REQUIRED_APPROVALS = 2;

    event PayrollRunCreated(
        uint256 indexed runId,
        uint256 periodStart,
        uint256 periodEnd
    );
    event PayrollApproved(
        uint256 indexed runId,
        address approver
    );
    event PayrollExecuted(uint256 indexed runId);
    event PaymentProcessed(
        uint256 indexed runId,
        address indexed recipient,
        uint256 amount
    );

    constructor(address _paymentToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        paymentToken = _paymentToken;
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
            total += _payments[i].netAmount;
            payrollPayments[runId].push(_payments[i]);
        }
        run.totalAmount = total;

        emit PayrollRunCreated(runId, _periodStart, _periodEnd);
    }

    function approvePayroll(uint256 _runId) 
        external 
        onlyRole(FINANCE_ROLE) 
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

    function executePayroll(uint256 _runId) 
        external 
        onlyRole(EXECUTOR_ROLE) 
        nonReentrant 
    {
        PayrollRun storage run = payrollRuns[_runId];
        require(run.status == 1, "Payroll not approved");
        
        run.status = 2;
        
        EmployeePayment[] storage payments = payrollPayments[_runId];
        
        for (uint256 i = 0; i < payments.length; i++) {
            EmployeePayment storage payment = payments[i];
            
            if (paymentToken != address(0)) {
                IERC20(paymentToken).transfer(payment.wallet, payment.netAmount);
            }
            
            payment.status = 1;
            
            emit PaymentProcessed(_runId, payment.wallet, payment.netAmount);
        }
        
        run.status = 2;
        emit PayrollExecuted(_runId);
    }

    function getPayments(uint256 _runId) 
        external 
        view 
        returns (EmployeePayment[] memory) 
    {
        return payrollPayments[_runId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
