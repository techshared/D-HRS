// Change this IP to match your Windows host on the same WiFi network
const API_BASE = "http://127.0.0.1:3001/api/v1";
const TOKEN_KEY = "@dhrs_token";

import AsyncStorage from "@react-native-async-storage/async-storage";

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

// Token management for JWT auth
async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

async function clearToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });
  const body: { success: boolean; data?: T; error?: string } = await res.json();
  if (!body.success) throw new Error(body.error || "Request failed");
  return body.data as T;
}

export { getToken, setToken, clearToken };

export interface Employee {
  did: string;
  wallet_address: string;
  personal_info_hash?: string;
  role: string;
  department?: string;
  salary?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  subject_did: string;
  credential_type: string;
  data_hash?: string;
  issued_at: string;
  expires_at: string;
  status: string;
}

export interface PayrollRun {
  id: number;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: string;
  required_approvals: number;
  current_approvals: number;
  payments: any[];
  created_at: string;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  category?: string;
  proposer: string;
  status: string;
  for_votes: number;
  against_votes: number;
  abstain_votes: number;
  quorum_required: number;
  start_time: string;
  end_time: string;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  // Auth
  authChallenge: () => request<{ challenge: string }>("/auth/challenge"),
  authConnect: (walletAddress: string) =>
    request<{ token: string; wallet_address: string }>("/auth/connect", {
      method: "POST",
      body: JSON.stringify({ wallet_address: walletAddress }),
    }),

  // Employees
  getEmployees: () => request<{ employees: Employee[] }>("/employees"),
  getEmployee: (did: string) => request<Employee>(`/employees/${did}`),
  createEmployee: (data: Partial<Employee>) =>
    request<{ did: string; transaction_hash: string; status: string }>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Credentials
  getCredentials: (did: string) =>
    request<{ credentials: Credential[] }>(`/credentials/${did}`),
  issueCredential: (data: { subject_did: string; credential_type: string; data?: any; expiry_days?: number }) =>
    request<{ credential_id: string; issued_at: string; expires_at: string }>("/credentials/issue", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Payroll
  getPayrollHistory: () =>
    request<{ payroll_runs: PayrollRun[] }>("/payroll/history"),
  runPayroll: (data: { period_start: string; period_end: string; payments: any[] }) =>
    request<{ run_id: number; total_amount: number; status: string }>("/payroll/run", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  approvePayroll: (runId: number) =>
    request<{ run_id: number; status: string }>(`/payroll/run/${runId}/approve`, {
      method: "POST",
    }),

  // Governance
  getProposals: () => request<{ proposals: Proposal[] }>("/governance/proposals"),
  createProposal: (data: { title: string; description: string; category?: string }) =>
    request<{ proposal_id: number; status: string }>("/governance/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  voteProposal: (proposalId: number, support: boolean, weight?: number) =>
    request<{ proposal_id: number; vote: string }>(`/governance/proposals/${proposalId}/vote`, {
      method: "POST",
      body: JSON.stringify({ support, weight: weight || 1 }),
    }),

  // Contracts
  getContracts: () => request<Record<string, string>>("/contracts"),

  // Compliance
  complianceDashboard: () => request<any>("/compliance/dashboard"),
  complianceStatus: (address: string) => request<any>(`/compliance/status/${address}`),
  complianceUsers: () => request<any>("/compliance/users"),
  complianceSanctions: () => request<any>("/compliance/sanctions"),
  complianceCheckSanction: (address: string) => request<any>("/compliance/sanctions/check", {
    method: "POST",
    body: JSON.stringify({ address }),
  }),
  complianceInitiateKYC: (data: { wallet_address: string; id_number: string }) =>
    request<any>("/compliance/kyc/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  complianceConsent: (data: { wallet_address: string; policy_version: string; agreement_version: string }) =>
    request<any>("/compliance/consent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
