// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IComplianceEngine {
    function guard(address _user, bytes32 _txId) external view;
}

contract DecentralizedHRS is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant HR_ADMIN_ROLE = keccak256("HR_ADMIN_ROLE");
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");
    bytes32 public constant DEPARTMENT_HEAD_ROLE = keccak256("DEPARTMENT_HEAD_ROLE");

    enum EvaluationType {
        Performance,
        Competency,
        ThreeSixtyDegree,
        SelfAssessment
    }

    enum JobGrade {
        Entry,
        Junior,
        Mid,
        Senior,
        Lead,
        Manager,
        Director,
        VP
    }

    enum EvaluationStatus {
        Pending,
        InProgress,
        Completed,
        Disputed
    }

    enum RecruitmentStatus {
        Open,
        InReview,
        Interviewing,
        OfferExtended,
        Closed,
        Cancelled
    }

    enum ApplicationStatus {
        Submitted,
        Screening,
        Interview,
        Offer,
        Rejected,
        Withdrawn
    }

    struct Evaluation {
        bytes32 employeeDID;
        bytes32 evaluatorDID;
        EvaluationType evalType;
        uint256 score;
        string performanceHash;
        string strengths;
        string weaknesses;
        string recommendations;
        uint256 timestamp;
        EvaluationStatus status;
    }

    struct JobPosting {
        uint256 id;
        string title;
        string description;
        string requirements;
        string department;
        JobGrade grade;
        uint256 minSalary;
        uint256 maxSalary;
        address creator;
        uint256 createdAt;
        uint256 deadline;
        RecruitmentStatus status;
        uint256 applicantCount;
    }

    struct JobApplication {
        uint256 postingId;
        bytes32 applicantDID;
        address applicantWallet;
        string resumeHash;
        string coverLetterHash;
        uint256 appliedAt;
        ApplicationStatus status;
        bytes32[] referralDIDs;
        uint256[] interviewScores;
    }

    struct JobGradeLevel {
        JobGrade grade;
        uint256 minSalary;
        uint256 maxSalary;
        string description;
    }

    struct PromotionReview {
        uint256 id;
        bytes32 employeeDID;
        JobGrade currentGrade;
        JobGrade targetGrade;
        uint256 performanceScore;
        uint256 peerReviewScore;
        uint256 managerReviewScore;
        bool approved;
        uint256 reviewDate;
        address reviewer;
    }

    struct SalaryAdjustment {
        bytes32 employeeDID;
        int256 adjustmentPercent;
        string reason;
        uint256 effectiveDate;
        address approver;
        uint256 timestamp;
    }

    struct JobTransfer {
        bytes32 employeeDID;
        string fromDepartment;
        string toDepartment;
        string reason;
        uint256 requestDate;
        uint256 approvalDate;
        bool approved;
        address approver;
    }

    struct EmployeeLayoff {
        bytes32 employeeDID;
        string reason;
        uint256 noticePeriod;
        uint256 effectiveDate;
        string severanceHash;
        bool approved;
        bool denied;
        address approver;
        uint256 timestamp;
    }

    mapping(bytes32 => Evaluation[]) public employeeEvaluations;
    mapping(uint256 => JobPosting) public jobPostings;
    mapping(uint256 => JobApplication[]) public jobApplications;
    mapping(bytes32 => PromotionReview[]) public promotionReviews;
    mapping(bytes32 => SalaryAdjustment[]) public salaryHistory;
    mapping(bytes32 => JobTransfer[]) public transferHistory;
    mapping(bytes32 => EmployeeLayoff[]) public layoffHistory;
    mapping(uint256 => mapping(bytes32 => bool)) public hasEvaluated;

    uint256 public postingCount;
    uint256 public promotionReviewCount;
    JobGradeLevel[] public jobGrades;

    IComplianceEngine public complianceEngine;

    event ComplianceEngineSet(address indexed engine);

    event EvaluationCreated(bytes32 indexed employeeDID, uint256 indexed evalId, EvaluationType evalType);
    event EvaluationCompleted(bytes32 indexed employeeDID, uint256 indexed evalId, uint256 score);
    event EvaluationDisputed(bytes32 indexed employeeDID, uint256 indexed evalId);
    event JobPostingCreated(uint256 indexed postingId, string title, string department);
    event JobPostingUpdated(uint256 indexed postingId, RecruitmentStatus status);
    event JobApplicationSubmitted(uint256 indexed postingId, bytes32 indexed applicantDID);
    event ApplicationStatusChanged(uint256 indexed postingId, bytes32 indexed applicantDID, ApplicationStatus status);
    event PromotionReviewInitiated(uint256 indexed reviewId, bytes32 indexed employeeDID, JobGrade targetGrade);
    event PromotionApproved(uint256 indexed reviewId, bytes32 indexed employeeDID, JobGrade newGrade);
    event PromotionDenied(uint256 indexed reviewId, bytes32 indexed employeeDID);
    event SalaryAdjustmentProposed(bytes32 indexed employeeDID, int256 adjustmentPercent);
    event SalaryAdjustmentApproved(bytes32 indexed employeeDID, int256 adjustmentPercent);
    event JobTransferRequested(bytes32 indexed employeeDID, string toDepartment);
    event JobTransferApproved(bytes32 indexed employeeDID, string toDepartment);
    event LayoffProposed(bytes32 indexed employeeDID, string reason);
    event LayoffApproved(bytes32 indexed employeeDID);
    event JobGradeUpdated(JobGrade grade, uint256 minSalary, uint256 maxSalary);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HR_ADMIN_ROLE, msg.sender);
        _grantRole(EVALUATOR_ROLE, msg.sender);
        _grantRole(DEPARTMENT_HEAD_ROLE, msg.sender);

        jobGrades.push(JobGradeLevel(JobGrade.Entry, 30000, 45000, "Entry level"));
        jobGrades.push(JobGradeLevel(JobGrade.Junior, 45000, 65000, "Junior level"));
        jobGrades.push(JobGradeLevel(JobGrade.Mid, 65000, 90000, "Mid level"));
        jobGrades.push(JobGradeLevel(JobGrade.Senior, 90000, 120000, "Senior level"));
        jobGrades.push(JobGradeLevel(JobGrade.Lead, 120000, 150000, "Lead level"));
        jobGrades.push(JobGradeLevel(JobGrade.Manager, 150000, 200000, "Manager level"));
        jobGrades.push(JobGradeLevel(JobGrade.Director, 200000, 280000, "Director level"));
        jobGrades.push(JobGradeLevel(JobGrade.VP, 280000, 500000, "VP level"));
    }

    function setComplianceEngine(address _engine) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_engine != address(0), "Zero address");
        complianceEngine = IComplianceEngine(_engine);
        emit ComplianceEngineSet(_engine);
    }

    function updateJobGrade(JobGrade _grade, uint256 _minSalary, uint256 _maxSalary, string calldata _description) 
        external onlyRole(HR_ADMIN_ROLE) 
    {
        require(uint256(_grade) < jobGrades.length, "Invalid grade");
        jobGrades[uint256(_grade)] = JobGradeLevel(_grade, _minSalary, _maxSalary, _description);
        emit JobGradeUpdated(_grade, _minSalary, _maxSalary);
    }

    function createEvaluation(
        bytes32 _employeeDID,
        bytes32 _evaluatorDID,
        EvaluationType _evalType
    ) external onlyRole(EVALUATOR_ROLE) whenNotPaused returns (uint256) {
        require(_employeeDID != bytes32(0), "Invalid employee DID");
        require(_evaluatorDID != bytes32(0), "Invalid evaluator DID");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _employeeDID);
        }

        uint256 evalId = employeeEvaluations[_employeeDID].length;
        
        Evaluation memory evaluation = Evaluation({
            employeeDID: _employeeDID,
            evaluatorDID: _evaluatorDID,
            evalType: _evalType,
            score: 0,
            performanceHash: "",
            strengths: "",
            weaknesses: "",
            recommendations: "",
            timestamp: block.timestamp,
            status: EvaluationStatus.Pending
        });

        employeeEvaluations[_employeeDID].push(evaluation);
        hasEvaluated[evalId][_evaluatorDID] = true;

        emit EvaluationCreated(_employeeDID, evalId, _evalType);
        return evalId;
    }

    function completeEvaluation(
        bytes32 _employeeDID,
        uint256 _evalId,
        uint256 _score,
        string calldata _performanceHash,
        string calldata _strengths,
        string calldata _weaknesses,
        string calldata _recommendations
    ) external onlyRole(EVALUATOR_ROLE) whenNotPaused {
        require(_evalId < employeeEvaluations[_employeeDID].length, "Invalid evaluation ID");
        
        Evaluation storage evaluation = employeeEvaluations[_employeeDID][_evalId];
        require(evaluation.status == EvaluationStatus.Pending || evaluation.status == EvaluationStatus.InProgress, "Invalid status");
        require(_score <= 100, "Score must be 0-100");

        evaluation.score = _score;
        evaluation.performanceHash = _performanceHash;
        evaluation.strengths = _strengths;
        evaluation.weaknesses = _weaknesses;
        evaluation.recommendations = _recommendations;
        evaluation.status = EvaluationStatus.Completed;

        emit EvaluationCompleted(_employeeDID, _evalId, _score);
    }

    function disputeEvaluation(bytes32 _employeeDID, uint256 _evalId) 
        external whenNotPaused onlyRole(HR_ADMIN_ROLE)
    {
        require(_evalId < employeeEvaluations[_employeeDID].length, "Invalid evaluation ID");
        
        Evaluation storage evaluation = employeeEvaluations[_employeeDID][_evalId];
        require(evaluation.status == EvaluationStatus.Completed, "Evaluation not completed");
        
        evaluation.status = EvaluationStatus.Disputed;
        
        emit EvaluationDisputed(_employeeDID, _evalId);
    }

    function createJobPosting(
        string calldata _title,
        string calldata _description,
        string calldata _requirements,
        string calldata _department,
        JobGrade _grade,
        uint256 _minSalary,
        uint256 _maxSalary,
        uint256 _deadlineDays
    ) external onlyRole(HR_ADMIN_ROLE) whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_department).length > 0, "Department required");
        require(_minSalary <= _maxSalary, "Invalid salary range");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, bytes32(uint256(uint160(msg.sender))));
        }

        uint256 postingId = postingCount++;
        
        JobPosting memory posting = JobPosting({
            id: postingId,
            title: _title,
            description: _description,
            requirements: _requirements,
            department: _department,
            grade: _grade,
            minSalary: _minSalary,
            maxSalary: _maxSalary,
            creator: msg.sender,
            createdAt: block.timestamp,
            deadline: block.timestamp + (_deadlineDays * 1 days),
            status: RecruitmentStatus.Open,
            applicantCount: 0
        });

        jobPostings[postingId] = posting;

        emit JobPostingCreated(postingId, _title, _department);
        return postingId;
    }

    function updateJobPostingStatus(uint256 _postingId, RecruitmentStatus _status) 
        external onlyRole(HR_ADMIN_ROLE) whenNotPaused
    {
        require(_postingId < postingCount, "Invalid posting ID");
        
        jobPostings[_postingId].status = _status;
        
        emit JobPostingUpdated(_postingId, _status);
    }

    function submitApplication(
        uint256 _postingId,
        bytes32 _applicantDID,
        address _applicantWallet,
        string calldata _resumeHash,
        string calldata _coverLetterHash,
        bytes32[] calldata _referralDIDs
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(_postingId < postingCount, "Invalid posting ID");
        require(jobPostings[_postingId].status == RecruitmentStatus.Open, "Position not open");
        require(block.timestamp <= jobPostings[_postingId].deadline, "Deadline passed");

        uint256 appId = jobApplications[_postingId].length;
        
        JobApplication memory application = JobApplication({
            postingId: _postingId,
            applicantDID: _applicantDID,
            applicantWallet: _applicantWallet,
            resumeHash: _resumeHash,
            coverLetterHash: _coverLetterHash,
            appliedAt: block.timestamp,
            status: ApplicationStatus.Submitted,
            referralDIDs: _referralDIDs,
            interviewScores: new uint256[](0)
        });

        jobApplications[_postingId].push(application);
        jobPostings[_postingId].applicantCount++;

        emit JobApplicationSubmitted(_postingId, _applicantDID);
        return appId;
    }

    function updateApplicationStatus(
        uint256 _postingId,
        bytes32 _applicantDID,
        ApplicationStatus _status
    ) external onlyRole(HR_ADMIN_ROLE) whenNotPaused {
        require(_postingId < postingCount, "Invalid posting ID");
        
        JobApplication[] storage applications = jobApplications[_postingId];
        bool found = false;
        
        for (uint256 i = 0; i < applications.length; i++) {
            if (applications[i].applicantDID == _applicantDID) {
                applications[i].status = _status;
                found = true;
                break;
            }
        }
        
        require(found, "Application not found");
        
        emit ApplicationStatusChanged(_postingId, _applicantDID, _status);
    }

    function initiatePromotionReview(
        bytes32 _employeeDID,
        JobGrade _currentGrade,
        JobGrade _targetGrade,
        uint256 _performanceScore,
        uint256 _peerReviewScore,
        uint256 _managerReviewScore
    ) external onlyRole(DEPARTMENT_HEAD_ROLE) whenNotPaused returns (uint256) {
        require(uint256(_targetGrade) > uint256(_currentGrade), "Target grade must be higher");
        require(_performanceScore <= 100, "Invalid performance score");
        require(_peerReviewScore <= 100, "Invalid peer review score");
        require(_managerReviewScore <= 100, "Invalid manager review score");

        uint256 reviewId = promotionReviewCount++;
        
        PromotionReview memory review = PromotionReview({
            id: reviewId,
            employeeDID: _employeeDID,
            currentGrade: _currentGrade,
            targetGrade: _targetGrade,
            performanceScore: _performanceScore,
            peerReviewScore: _peerReviewScore,
            managerReviewScore: _managerReviewScore,
            approved: false,
            reviewDate: block.timestamp,
            reviewer: msg.sender
        });

        promotionReviews[_employeeDID].push(review);

        emit PromotionReviewInitiated(reviewId, _employeeDID, _targetGrade);
        return reviewId;
    }

    function approvePromotion(bytes32 _employeeDID, uint256 _reviewId) 
        external onlyRole(HR_ADMIN_ROLE) whenNotPaused
    {
        require(_reviewId < promotionReviews[_employeeDID].length, "Invalid review ID");
        
        PromotionReview storage review = promotionReviews[_employeeDID][_reviewId];
        
        uint256 avgScore = (review.performanceScore + review.peerReviewScore + review.managerReviewScore) / 3;
        bool approved = avgScore >= 70;
        
        review.approved = approved;
        
        if (approved) {
            emit PromotionApproved(_reviewId, _employeeDID, review.targetGrade);
        } else {
            emit PromotionDenied(_reviewId, _employeeDID);
        }
    }

    function proposeSalaryAdjustment(
        bytes32 _employeeDID,
        int256 _adjustmentPercent,
        string calldata _reason,
        uint256 _effectiveDate
    ) external onlyRole(HR_ADMIN_ROLE) whenNotPaused {
        require(_adjustmentPercent >= -50 && _adjustmentPercent <= 100, "Adjustment must be between -50% and 100%");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _employeeDID);
        }
        
        SalaryAdjustment memory adjustment = SalaryAdjustment({
            employeeDID: _employeeDID,
            adjustmentPercent: _adjustmentPercent,
            reason: _reason,
            effectiveDate: _effectiveDate,
            approver: msg.sender,
            timestamp: block.timestamp
        });
        
        salaryHistory[_employeeDID].push(adjustment);
        
        emit SalaryAdjustmentProposed(_employeeDID, _adjustmentPercent);
    }

    function approveSalaryAdjustment(bytes32 _employeeDID, uint256 _adjustmentIndex) 
        external onlyRole(HR_ADMIN_ROLE) whenNotPaused
    {
        require(_adjustmentIndex < salaryHistory[_employeeDID].length, "Invalid adjustment index");
        
        SalaryAdjustment storage adjustment = salaryHistory[_employeeDID][_adjustmentIndex];
        adjustment.approver = msg.sender;
        
        emit SalaryAdjustmentApproved(_employeeDID, adjustment.adjustmentPercent);
    }

    function requestJobTransfer(
        bytes32 _employeeDID,
        string calldata _fromDepartment,
        string calldata _toDepartment,
        string calldata _reason
    ) external whenNotPaused onlyRole(HR_ADMIN_ROLE) {
        require(bytes(_toDepartment).length > 0, "Destination department required");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _employeeDID);
        }
        
        JobTransfer memory transfer = JobTransfer({
            employeeDID: _employeeDID,
            fromDepartment: _fromDepartment,
            toDepartment: _toDepartment,
            reason: _reason,
            requestDate: block.timestamp,
            approvalDate: 0,
            approved: false,
            approver: address(0)
        });
        
        transferHistory[_employeeDID].push(transfer);
        
        emit JobTransferRequested(_employeeDID, _toDepartment);
    }

    function approveJobTransfer(bytes32 _employeeDID, uint256 _transferIndex) 
        external onlyRole(DEPARTMENT_HEAD_ROLE) whenNotPaused
    {
        require(_transferIndex < transferHistory[_employeeDID].length, "Invalid transfer index");
        
        JobTransfer storage transfer = transferHistory[_employeeDID][_transferIndex];
        require(!transfer.approved, "Already approved");
        
        transfer.approved = true;
        transfer.approvalDate = block.timestamp;
        transfer.approver = msg.sender;
        
        emit JobTransferApproved(_employeeDID, transfer.toDepartment);
    }

    function proposeLayoff(
        bytes32 _employeeDID,
        string calldata _reason,
        uint256 _noticePeriodDays,
        uint256 _effectiveDate,
        string calldata _severanceHash
    ) external onlyRole(HR_ADMIN_ROLE) whenNotPaused {
        require(bytes(_reason).length > 0, "Reason required");

        if (address(complianceEngine) != address(0)) {
            complianceEngine.guard(msg.sender, _employeeDID);
        }

        EmployeeLayoff memory layoff = EmployeeLayoff({
            employeeDID: _employeeDID,
            reason: _reason,
            noticePeriod: _noticePeriodDays,
            effectiveDate: _effectiveDate,
            severanceHash: _severanceHash,
            approved: false,
            denied: false,
            approver: address(0),
            timestamp: block.timestamp
        });
        
        layoffHistory[_employeeDID].push(layoff);
        
        emit LayoffProposed(_employeeDID, _reason);
    }

    function approveLayoff(bytes32 _employeeDID, uint256 _layoffIndex) 
        external onlyRole(HR_ADMIN_ROLE) whenNotPaused
    {
        require(_layoffIndex < layoffHistory[_employeeDID].length, "Invalid layoff index");
        
        EmployeeLayoff storage layoff = layoffHistory[_employeeDID][_layoffIndex];
        require(!layoff.approved, "Already approved");
        require(!layoff.denied, "Already denied");
        
        layoff.approved = true;
        layoff.approver = msg.sender;
        
        emit LayoffApproved(_employeeDID);
    }

    function denyLayoff(bytes32 _employeeDID, uint256 _layoffIndex) 
        external onlyRole(HR_ADMIN_ROLE) whenNotPaused
    {
        require(_layoffIndex < layoffHistory[_employeeDID].length, "Invalid layoff index");

        EmployeeLayoff storage layoff = layoffHistory[_employeeDID][_layoffIndex];
        require(!layoff.approved, "Already approved");
        require(!layoff.denied, "Already denied");

        layoff.denied = true;
        layoff.approver = msg.sender;
    }

    function getEmployeeEvaluations(bytes32 _employeeDID) 
        external view returns (Evaluation[] memory) 
    {
        return employeeEvaluations[_employeeDID];
    }

    function getJobPosting(uint256 _postingId) 
        external view returns (JobPosting memory) 
    {
        return jobPostings[_postingId];
    }

    function getJobApplications(uint256 _postingId) 
        external view returns (JobApplication[] memory) 
    {
        return jobApplications[_postingId];
    }

    function getPromotionReviews(bytes32 _employeeDID) 
        external view returns (PromotionReview[] memory) 
    {
        return promotionReviews[_employeeDID];
    }

    function getSalaryHistory(bytes32 _employeeDID) 
        external view returns (SalaryAdjustment[] memory) 
    {
        return salaryHistory[_employeeDID];
    }

    function getTransferHistory(bytes32 _employeeDID) 
        external view returns (JobTransfer[] memory) 
    {
        return transferHistory[_employeeDID];
    }

    function getLayoffHistory(bytes32 _employeeDID) 
        external view returns (EmployeeLayoff[] memory) 
    {
        return layoffHistory[_employeeDID];
    }

    function getJobGrade(uint256 _index) 
        external view returns (JobGradeLevel memory) 
    {
        require(_index < jobGrades.length, "Invalid grade index");
        return jobGrades[_index];
    }

    function getAllJobGrades() 
        external view returns (JobGradeLevel[] memory) 
    {
        return jobGrades;
    }

    function getJobGradesCount() 
        external view returns (uint256) 
    {
        return jobGrades.length;
    }

    function pause() external onlyRole(HR_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(HR_ADMIN_ROLE) {
        _unpause();
    }
}
