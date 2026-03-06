// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IAIDataOracle {
    function getSalaryBenchmark(string memory role, string memory department) external view returns (uint256);
    function getPerformanceScore(address employee) external view returns (uint256);
    function getMarketTrend(string memory metric) external view returns (int256);
}

contract HRAIOracle is Ownable, Pausable, ReentrancyGuard {
    
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
    
    address[] public authorizedHRContracts;
    
    event SalaryBenchmarkUpdated(string indexed role, string department, uint256 min, uint256 mid, uint256 max);
    event PerformanceScoreUpdated(address indexed employee, uint256 score);
    event MarketDataUpdated(string indexed metric, int256 value);
    event AuthorizedContractAdded(address indexed contract_);
    event AuthorizedContractRemoved(address indexed contract_);

    constructor() {
        _initializeSalaryBenchmarks();
        _initializeMarketData();
    }

    function _initializeSalaryBenchmarks() internal {
        salaryBenchmarks["Software Engineer|Engineering"] = SalaryBenchmark({
            role: "Software Engineer",
            department: "Engineering",
            minSalary: 80000,
            midSalary: 120000,
            maxSalary: 180000,
            updatedAt: block.timestamp
        });

        salaryBenchmarks["Senior Engineer|Engineering"] = SalaryBenchmark({
            role: "Senior Engineer",
            department: "Engineering",
            minSalary: 120000,
            midSalary: 160000,
            maxSalary: 220000,
            updatedAt: block.timestamp
        });

        salaryBenchmarks["Product Manager|Product"] = SalaryBenchmark({
            role: "Product Manager",
            department: "Product",
            minSalary: 90000,
            midSalary: 130000,
            maxSalary: 190000,
            updatedAt: block.timestamp
        });

        salaryBenchmarks["Designer|Design"] = SalaryBenchmark({
            role: "Designer",
            department: "Design",
            minSalary: 70000,
            midSalary: 100000,
            maxSalary: 150000,
            updatedAt: block.timestamp
        });

        salaryBenchmarks["HR Manager|HR"] = SalaryBenchmark({
            role: "HR Manager",
            department: "HR",
            minSalary: 75000,
            midSalary: 110000,
            maxSalary: 160000,
            updatedAt: block.timestamp
        });
    }

    function _initializeMarketData() internal {
        marketData["tech_salary_trend"] = MarketData({
            metric: "tech_salary_trend",
            value: 5200,
            updatedAt: block.timestamp
        });

        marketData["hiring_demand_index"] = MarketData({
            metric: "hiring_demand_index",
            value: 7850,
            updatedAt: block.timestamp
        });

        marketData["remote_work_preference"] = MarketData({
            metric: "remote_work_preference",
            value: 8200,
            updatedAt: block.timestamp
        });

        marketData["employee_turnover_index"] = MarketData({
            metric: "employee_turnover_index",
            value: 3100,
            updatedAt: block.timestamp
        });
    }

    function updateSalaryBenchmark(
        string memory role,
        string memory department,
        uint256 minSalary,
        uint256 midSalary,
        uint256 maxSalary
    ) external onlyOwner whenNotPaused {
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

    function getSalaryBenchmark(string memory role, string memory department) 
        external 
        view 
        whenNotPaused 
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
    ) external onlyOwner whenNotPaused {
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
        whenNotPaused 
        returns (uint256 score) 
    {
        EmployeePerformance storage perf = employeePerformance[employee];
        require(perf.lastUpdated > 0, "No performance data");
        return perf.performanceScore;
    }

    function getEmployeePerformance(address employee)
        external
        view
        whenNotPaused
        returns (uint256 score, uint256 peerRating, uint256 goalCompletion, uint256 lastUpdated)
    {
        EmployeePerformance storage perf = employeePerformance[employee];
        require(perf.lastUpdated > 0, "No performance data");
        return (perf.performanceScore, perf.peerRating, perf.goalCompletion, perf.lastUpdated);
    }

    function updateMarketData(string memory metric, int256 value) external onlyOwner whenNotPaused {
        marketData[metric] = MarketData({
            metric: metric,
            value: value,
            updatedAt: block.timestamp
        });

        emit MarketDataUpdated(metric, value);
    }

    function getMarketTrend(string memory metric) external view whenNotPaused returns (int256 value) {
        MarketData storage data = marketData[metric];
        require(data.updatedAt > 0, "Metric not found");
        return data.value;
    }

    function getRecommendedSalary(address employee, string memory role, string memory department)
        external
        view
        whenNotPaused
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
            uint256 performanceMultiplier = perf.performanceScore * 100 / 100;
            uint256 baseSalary = benchmark.minSalary + 
                ((benchmark.maxSalary - benchmark.minSalary) * performanceMultiplier) / 100;
            return baseSalary;
        }
        
        return benchmark.midSalary;
    }

    function addAuthorizedContract(address contract_) external onlyOwner {
        require(contract_ != address(0), "Invalid address");
        authorizedHRContracts.push(contract_);
        emit AuthorizedContractAdded(contract_);
    }

    function removeAuthorizedContract(address contract_) external onlyOwner {
        for (uint256 i = 0; i < authorizedHRContracts.length; i++) {
            if (authorizedHRContracts[i] == contract_) {
                authorizedHRContracts[i] = authorizedHRContracts[authorizedHRContracts.length - 1];
                authorizedHRContracts.pop();
                emit AuthorizedContractRemoved(contract_);
                return;
            }
        }
    }

    function isAuthorized(address contract_) external view returns (bool) {
        for (uint256 i = 0; i < authorizedHRContracts.length; i++) {
            if (authorizedHRContracts[i] == contract_) {
                return true;
            }
        }
        return false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
