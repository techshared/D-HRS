// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract HRAIOracle is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
    bytes32 public constant HR_CONTRACT_ROLE = keccak256("HR_CONTRACT_ROLE");

    struct SalaryBenchmark {
        string role;
        string department;
        uint256 minSalary;
        uint256 midSalary;
        uint256 maxSalary;
        uint256 updatedAt;
    }

    struct EmployeePerformance {
        address employee;
        uint256 performanceScore;
        uint256 peerRating;
        uint256 goalCompletion;
        uint256 lastUpdated;
    }

    struct MarketData {
        string metric;
        int256 value;
        uint256 updatedAt;
    }

    mapping(string => SalaryBenchmark) public salaryBenchmarks;
    mapping(address => EmployeePerformance) public employeePerformance;
    mapping(string => MarketData) public marketData;

    event SalaryBenchmarkUpdated(string indexed role, string department, uint256 min, uint256 mid, uint256 max);
    event PerformanceScoreUpdated(address indexed employee, uint256 score);
    event MarketDataUpdated(string indexed metric, int256 value);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ADMIN_ROLE, msg.sender);
        _grantRole(HR_CONTRACT_ROLE, msg.sender);
    }

    modifier onlyAuthorized() {
        require(hasRole(HR_CONTRACT_ROLE, msg.sender) || hasRole(ORACLE_ADMIN_ROLE, msg.sender), "Not authorized HR contract");
        _;
    }

    function updateSalaryBenchmark(
        string memory role,
        string memory department,
        uint256 minSalary,
        uint256 midSalary,
        uint256 maxSalary
    ) external onlyRole(ORACLE_ADMIN_ROLE) whenNotPaused {
        require(bytes(role).length > 0, "Role required");
        require(minSalary <= midSalary && midSalary <= maxSalary, "Invalid salary range");

        string memory key = string(abi.encodePacked(role, "|", department));
        salaryBenchmarks[key] = SalaryBenchmark({
            role: role,
            department: department,
            minSalary: minSalary,
            midSalary: midSalary,
            maxSalary: maxSalary,
            updatedAt: block.timestamp
        });

        emit SalaryBenchmarkUpdated(role, department, minSalary, midSalary, maxSalary);
    }

    function removeSalaryBenchmark(string memory role, string memory department)
        external
        onlyRole(ORACLE_ADMIN_ROLE)
        whenNotPaused
    {
        string memory key = string(abi.encodePacked(role, "|", department));
        delete salaryBenchmarks[key];
    }

    function getSalaryBenchmark(string memory role, string memory department)
        external
        view
        onlyAuthorized
        returns (uint256 min, uint256 mid, uint256 max)
    {
        string memory key = string(abi.encodePacked(role, "|", department));
        SalaryBenchmark storage benchmark = salaryBenchmarks[key];

        if (benchmark.midSalary == 0) {
            key = string(abi.encodePacked(role, "|", "General"));
            benchmark = salaryBenchmarks[key];
        }

        require(benchmark.midSalary > 0, "Benchmark not found");

        return (benchmark.minSalary, benchmark.midSalary, benchmark.maxSalary);
    }

    function updatePerformanceScore(
        address employee,
        uint256 performanceScore,
        uint256 peerRating,
        uint256 goalCompletion
    ) external onlyRole(ORACLE_ADMIN_ROLE) whenNotPaused {
        require(employee != address(0), "Invalid address");
        require(performanceScore <= 100, "Score must be 0-100");
        require(peerRating <= 100, "Peer rating must be 0-100");
        require(goalCompletion <= 100, "Goal completion must be 0-100");

        uint256 weightedScore = (performanceScore * 50 + peerRating * 30 + goalCompletion * 20) / 100;

        employeePerformance[employee] = EmployeePerformance({
            employee: employee,
            performanceScore: weightedScore,
            peerRating: peerRating,
            goalCompletion: goalCompletion,
            lastUpdated: block.timestamp
        });

        emit PerformanceScoreUpdated(employee, weightedScore);
    }

    function getPerformanceScore(address employee)
        external
        view
        onlyAuthorized
        returns (uint256 score)
    {
        EmployeePerformance storage perf = employeePerformance[employee];
        require(perf.lastUpdated > 0, "No performance data");
        return perf.performanceScore;
    }

    function getEmployeePerformance(address employee)
        external
        view
        onlyAuthorized
        returns (uint256 score, uint256 peerRating, uint256 goalCompletion, uint256 lastUpdated)
    {
        EmployeePerformance storage perf = employeePerformance[employee];
        require(perf.lastUpdated > 0, "No performance data");
        return (perf.performanceScore, perf.peerRating, perf.goalCompletion, perf.lastUpdated);
    }

    function updateMarketData(string memory metric, int256 value) external onlyRole(ORACLE_ADMIN_ROLE) whenNotPaused {
        require(bytes(metric).length > 0, "Metric required");
        marketData[metric] = MarketData({
            metric: metric,
            value: value,
            updatedAt: block.timestamp
        });

        emit MarketDataUpdated(metric, value);
    }

    function getMarketTrend(string memory metric) external view onlyAuthorized returns (int256 value) {
        MarketData storage data = marketData[metric];
        require(data.updatedAt > 0, "Metric not found");
        return data.value;
    }

    function getRecommendedSalary(address employee, string memory role, string memory department)
        external
        view
        onlyAuthorized
        returns (uint256 recommended)
    {
        string memory key = string(abi.encodePacked(role, "|", department));
        SalaryBenchmark storage benchmark = salaryBenchmarks[key];

        if (benchmark.midSalary == 0) {
            key = string(abi.encodePacked(role, "|", "General"));
            benchmark = salaryBenchmarks[key];
        }

        require(benchmark.midSalary > 0, "No benchmark found");

        EmployeePerformance storage perf = employeePerformance[employee];

        if (perf.lastUpdated > 0) {
            uint256 performanceMultiplier = perf.performanceScore;
            uint256 baseSalary = benchmark.minSalary +
                ((benchmark.maxSalary - benchmark.minSalary) * performanceMultiplier) / 100;
            return baseSalary;
        }

        return benchmark.midSalary;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
