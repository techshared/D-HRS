'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toggleLang } from './i18n';
import './styles.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3001/api/v1';

const EMPLOYEE_REGISTRY_ABI = [
  "function getEmployee(bytes32 _did) view returns (tuple(bytes32 did, string personalInfoHash, string role, string department, uint256 startDate, uint256 status, string credentialsRoot, uint256 createdAt, uint256 updatedAt))",
  "function employeeCount() view returns (uint256)",
];

function LangToggle() {
  const { i18n } = useTranslation();
  const next = i18n.language === 'en' ? 'zh' : 'en';
  const label = next === 'en' ? 'EN' : '中文';
  return (
    <button className="lang-toggle" onClick={() => toggleLang()}>
      {label}
    </button>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [account, setAccount] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [proposals, setProposals] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    // Check if wallet is connected via the backend auth session
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      if (data.success) {
        setAccount('server_session');
      }
    } catch (err) {
      console.error('Backend health check failed:', err);
    }
  };

  const handleLogin = async () => {
    // China-compliant login: no wallet connection, use backend KYC session
    try {
      const challengeRes = await fetch(`${API_BASE}/auth/challenge`);
      const challengeData = await challengeRes.json();
      if (!challengeData.success) {
        setError(t('error.loginFailed'));
        return;
      }
      // In production, this would trigger KYC/real-name auth flow
      const loginRes = await fetch(`${API_BASE}/auth/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: 'local_user' }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        setAccount(loginData.data.wallet_address);
        setError(null);
      }
    } catch (err) {
      setError(t('error.loginFailed'));
      console.error(err);
    }
  };

  const loadEmployees = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.employees || []);
      }
    } catch (err) {
      setError(t('error.loadEmployees'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  const loadProposals = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/governance/proposals`);
      const data = await res.json();
      if (data.success) {
        setProposals(data.data.proposals || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPayroll = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/payroll/history`);
      const data = await res.json();
      if (data.success) {
        setPayrollRuns(data.data.payroll_runs || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'employees') loadEmployees();
    if (activeTab === 'governance') loadProposals();
    if (activeTab === 'payroll') loadPayroll();
  }, [activeTab, loadEmployees, loadProposals, loadPayroll]);

  const handleCreateProposal = async () => {
    const title = prompt(t('governance.promptTitle') || 'Enter proposal title');
    const description = prompt(t('governance.promptDesc') || 'Enter proposal description');
    if (!title || !description) return;
    try {
      const res = await fetch(`${API_BASE}/governance/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success) {
        loadProposals();
      } else {
        setError(data.error || t('error.createProposal'));
      }
    } catch (err) {
      setError(t('error.createProposal'));
      console.error(err);
    }
  };

  const handleVote = async (proposalId, support) => {
    try {
      const res = await fetch(`${API_BASE}/governance/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ support, weight: 1 }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error || t('error.vote'));
      else loadProposals();
    } catch (err) {
      setError(t('error.vote'));
      console.error(err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>{t('app.title')}</h1>
          <span>{t('app.subtitle')}</span>
        </div>
        <div className="wallet-section">
          {account ? (
            <div className="connected">
              <span className="status">{t('status.connected')}</span>
            </div>
          ) : (
            <button className="connect-btn" onClick={handleLogin}>
              {t('login.login')}
            </button>
          )}
          <LangToggle />
        </div>
      </header>

      <nav className="nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {t('tabs.dashboard')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          {t('tabs.employees')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          {t('tabs.payroll')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          {t('tabs.credentials')}
        </button>
        <button
          className={`nav-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          {t('tabs.governance')}
        </button>
      </nav>

      <main className="main">
        {error && <div className="error">{error}</div>}

        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>{t('dashboard.title')}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{t('dashboard.totalEmployees')}</h3>
                <p className="stat-value">{employees.length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>{t('dashboard.activeEmployees')}</h3>
                <p className="stat-value">{employees.filter(e => e.status === 1).length || 0}</p>
              </div>
              <div className="stat-card">
                <h3>{t('dashboard.departments')}</h3>
                <p className="stat-value">{new Set(employees.map(e => e.department)).size || 0}</p>
              </div>
              <div className="stat-card">
                <h3>{t('dashboard.payrollStatus')}</h3>
                <p className="stat-value">{t('dashboard.active')}</p>
              </div>
            </div>

            <div className="contracts-section">
              <h3>{t('dashboard.contracts')}</h3>
              <p className="contract-note">{t('dashboard.contractNote')}</p>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="employees-section">
            <div className="section-header">
              <h2>{t('employees.title')}</h2>
            </div>

            {loading ? (
              <div className="loading">{t('employees.loading')}</div>
            ) : (
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>{t('employees.did')}</th>
                    <th>{t('employees.role')}</th>
                    <th>{t('employees.department')}</th>
                    <th>{t('employees.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, index) => (
                    <tr key={index}>
                      <td>{emp.did}</td>
                      <td>{emp.role}</td>
                      <td>{emp.department || '-'}</td>
                      <td><span className="status-badge active">{t('dashboard.active')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="payroll-section">
            <h2>{t('payroll.title')}</h2>
            <div className="payroll-status">
              {payrollRuns.length === 0 ? (
                <p className="placeholder">{t('payroll.empty')}</p>
              ) : (
                payrollRuns.map((run) => (
                  <div key={run.id} className="status-card">
                    <h3>{t('payroll.runTitle')} #{run.id}</h3>
                    <p>{t('payroll.period')}: {run.period_start?.slice(0, 10)} - {run.period_end?.slice(0, 10)}</p>
                    <p>{t('payroll.totalAmount')}: {run.total_amount}</p>
                    <p>{t('payroll.status')}: {run.status}</p>
                    <p>{t('payroll.approvals')}: {run.current_approvals}/{run.required_approvals}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="credentials-section">
            <h2>{t('credentials.title')}</h2>
            <div className="credentials-list">
              <p className="placeholder">{t('credentials.empty')}</p>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="governance-section">
            <h2>{t('governance.title')}</h2>
            {account ? (
              <button className="action-btn" onClick={handleCreateProposal}>
                {t('governance.create')}
              </button>
            ) : (
              <p className="placeholder">{t('governance.loginRequired')}</p>
            )}
            <div className="proposals-list">
              {proposals.length === 0 ? (
                <p className="placeholder">{t('governance.empty')}</p>
              ) : (
                proposals.map((prop) => (
                  <div key={prop.id} className="proposal-card">
                    <h3>{prop.title}</h3>
                    <p>{prop.description}</p>
                    <div className="proposal-votes">
                      <span className="vote for">{t('governance.for')} {prop.for_votes || 0}</span>
                      <span className="vote against">{t('governance.against')} {prop.against_votes || 0}</span>
                      <span className="vote abstain">{t('governance.abstain')} {prop.abstain_votes || 0}</span>
                    </div>
                    {account && (
                      <div className="proposal-actions">
                        <button className="vote-btn" onClick={() => handleVote(prop.id, true)}>{t('governance.voteFor')}</button>
                        <button className="vote-btn against" onClick={() => handleVote(prop.id, false)}>{t('governance.voteAgainst')}</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
}