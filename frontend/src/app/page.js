'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './styles.css';

const CONTRACT_ADDRESSES = {
  employeeRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  credentialRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  payrollExecutor: '0x9fE46736679d2D9a65F0992F2272dE9f3c78766A',
  benefitsNFT: '0x0DCd1Bf3A1cD10D4bEb7d76Ea900c1e9E9fD0a6',
  hrGovernance: '0x2279B7A0a67DB72A27a1d208c9D0C6B2d8Ae4F3A',
  didRegistry: '0xACa94A711d0A09F64F2e0dE3f5A99e9c0aF7f0d'
};

// Minimal ABI for reading
const EMPLOYEE_REGISTRY_ABI = [
  "function getEmployee(bytes32 _did) view returns (tuple(bytes32 did, string personalInfoHash, string role, string department, uint256 salary, uint256 startDate, uint256 status, string credentialsRoot, uint256 createdAt, uint256 updatedAt))",
  "function employeeCount() view returns (uint256)",
  "function getAllEmployees() view returns (tuple[])"
];

export default function Home() {
  const [account, setAccount] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setError(null);
      } catch (err) {
        setError('Failed to connect wallet');
        console.error(err);
      }
    } else {
      setError('Please install MetaMask!');
    }
  };

  const loadEmployees = async () => {
    if (!account) return;
    setLoading(true);
    try {
      // Simulate loading employees (in production, fetch from blockchain/API)
      const mockEmployees = [
        { did: '0x1234', role: 'CEO', department: 'Executive', salary: 200000, status: 1 },
        { did: '0x5678', role: 'CTO', department: 'Engineering', salary: 180000, status: 1 },
        { did: '0x9abc', role: 'Senior Engineer', department: 'Engineering', salary: 150000, status: 1 },
        { did: '0xdef0', role: 'Product Manager', department: 'Product', salary: 130000, status: 1 },
      ];
      setEmployees(mockEmployees);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    }
  }, [activeTab, account]);

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>D-HRS</h1>
          <span>Decentralized HR System</span>
        </div>
        <div className="wallet-section">
          {account ? (
            <div className="connected">
              <span className="address">{account.slice(0, 6)}...{account.slice(-4)}</span>
              <span className="status">Connected</span>
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <nav className="nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button 
          className={`nav-btn ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          Payroll
        </button>
        <button 
          className={`nav-btn ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          Credentials
        </button>
        <button 
          className={`nav-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          Governance
        </button>
      </nav>

      <main className="main">
        {error && <div className="error">{error}</div>}

        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Employees</h3>
                <p className="stat-value">{employees.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Active Employees</h3>
                <p className="stat-value">{employees.filter(e => e.status === 1).length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Departments</h3>
                <p className="stat-value">{new Set(employees.map(e => e.department)).size || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Payroll Status</h3>
                <p className="stat-value">Active</p>
              </div>
            </div>

            <div className="contracts-section">
              <h3>Deployed Contracts</h3>
              <div className="contracts-list">
                {Object.entries(CONTRACT_ADDRESSES).map(([name, address]) => (
                  <div key={name} className="contract-item">
                    <span className="contract-name">{name}</span>
                    <span className="contract-address">{address.slice(0, 10)}...{address.slice(-8)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="employees-section">
            <div className="section-header">
              <h2>Employee Management</h2>
              <button className="action-btn">+ Add Employee</button>
            </div>
            
            {loading ? (
              <div className="loading">Loading employees...</div>
            ) : (
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>DID</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, index) => (
                    <tr key={index}>
                      <td>{emp.did}</td>
                      <td>{emp.role}</td>
                      <td>{emp.department}</td>
                      <td>${emp.salary.toLocaleString()}</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td>
                        <button className="view-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="payroll-section">
            <h2>Payroll Management</h2>
            <div className="payroll-actions">
              <button className="action-btn primary">Create Payroll Run</button>
              <button className="action-btn">View History</button>
            </div>
            <div className="payroll-status">
              <div className="status-card">
                <h3>Current Period</h3>
                <p>January 2024</p>
              </div>
              <div className="status-card">
                <h3>Total Amount</h3>
                <p>$560,000</p>
              </div>
              <div className="status-card">
                <h3>Status</h3>
                <p>Processing</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="credentials-section">
            <h2>Verifiable Credentials</h2>
            <div className="credential-actions">
              <button className="action-btn">Issue Credential</button>
              <button className="action-btn">Verify Credential</button>
            </div>
            <div className="credentials-list">
              <p className="placeholder">No credentials issued            </div>
 yet</p>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="governance-section">
            <h2>HR Governance</h2>
            <button className="action-btn">Create Proposal</button>
            <div className="proposals-list">
              <div className="proposal-card">
                <h3>Update Remote Work Policy</h3>
                <p>Proposal to allow 4 days remote work per week</p>
                <div className="proposal-votes">
                  <span className="vote for">For: 45</span>
                  <span className="vote against">Against: 12</span>
                  <span className="vote abstain">Abstain: 3</span>
                </div>
                <button className="vote-btn">Vote</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>D-HRS v2.0 - Built with Ethereum, Layer 2, and ERC-4337</p>
      </footer>
    </div>
  );
}
