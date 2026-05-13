import "fast-text-encoding";
import "react-native-get-random-values";
import "./src/i18n";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "./src/i18n";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, Employee, Credential, PayrollRun, Proposal, getToken, setToken, clearToken } from "./src/api/client";

const KYC_STORAGE_KEY = "dhrs_kyc_verified";
const CONSENT_STORAGE_KEY = "dhrs_consent_agreed";

function DashboardScreenLocal({ onCompliancePress }: { onCompliancePress?: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    api.health()
      .then(() => setStatus("connected"))
      .catch(() => setStatus("disconnected"));
  }, []);

  const refreshEmployees = useCallback(() => {
    api.getEmployees().then((d) => setEmployees(d.employees)).catch(() => {});
  }, []);
  const refreshCredentials = useCallback((did: string) => {
    api.getCredentials(did).then((d) => setCredentials(d.credentials)).catch(() => {});
  }, []);
  const refreshPayroll = useCallback(() => {
    api.getPayrollHistory().then((d) => setPayrollRuns(d.payroll_runs)).catch(() => {});
  }, []);
  const refreshProposals = useCallback(() => {
    api.getProposals().then((d) => setProposals(d.proposals)).catch(() => {});
  }, []);

  useEffect(() => { if (status === "connected") { refreshEmployees(); refreshPayroll(); refreshProposals(); } }, [status]);

  const tabs = [
    { id: "dashboard", label: t("tabs.dashboard") },
    { id: "employees", label: t("tabs.employees") },
    { id: "credentials", label: t("tabs.credentials") },
    { id: "payroll", label: t("tabs.payroll") },
    { id: "governance", label: t("tabs.governance") },
  ];

  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [newDid, setNewDid] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");

  const handleCreateEmployee = () => {
    if (!newDid || !newRole) return;
    api.createEmployee({ did: newDid, role: newRole, department: newDept })
      .then(() => { refreshEmployees(); setShowNewEmployee(false); setNewDid(""); setNewRole(""); setNewDept(""); })
      .catch((e) => Alert.alert(t("alert.error"), e.message));
  };

  const [showNewProposal, setShowNewProposal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDesc, setProposalDesc] = useState("");

  const handleCreateProposal = () => {
    if (!proposalTitle || !proposalDesc) return;
    api.createProposal({ title: proposalTitle, description: proposalDesc })
      .then(() => { refreshProposals(); setShowNewProposal(false); setProposalTitle(""); setProposalDesc(""); })
      .catch((e) => Alert.alert(t("alert.error"), e.message));
  };

  const [selectedDid, setSelectedDid] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("app.title")}</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusDot, status === "connected" ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>{status === "connected" ? t("status.localApi") : t("status.offline")}</Text>
          <LangToggle current={i18n.language as "en" | "zh"} />
          <TouchableOpacity onPress={onCompliancePress} style={styles.complianceBadge}>
            <Text style={styles.complianceBadgeText}>⚖️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id} style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "dashboard" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("dashboard.sectionTitle")}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{employees.length}</Text>
                <Text style={styles.statLabel}>{t("dashboard.totalEmployees")}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{employees.filter(e => e.status === "active").length}</Text>
                <Text style={styles.statLabel}>{t("dashboard.active")}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{credentials.length}</Text>
                <Text style={styles.statLabel}>{t("dashboard.credentials")}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{proposals.length}</Text>
                <Text style={styles.statLabel}>{t("dashboard.proposals")}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "employees" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("employees.title")}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowNewEmployee(true)}>
                <Text style={styles.addButtonText}>{t("employees.add")}</Text>
              </TouchableOpacity>
            </View>
            {showNewEmployee && (
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder={t("employees.did")} value={newDid} onChangeText={setNewDid} />
                <TextInput style={styles.input} placeholder={t("employees.role")} value={newRole} onChangeText={setNewRole} />
                <TextInput style={styles.input} placeholder={t("employees.department")} value={newDept} onChangeText={setNewDept} />
                <View style={styles.formActions}>
                  <Button title={t("form.cancel")} onPress={() => setShowNewEmployee(false)} color="#64748b" />
                  <Button title={t("form.create")} onPress={handleCreateEmployee} color="#2563eb" />
                </View>
              </View>
            )}
            {employees.length === 0 ? (
              <Text style={styles.emptyText}>{t("employees.empty")}</Text>
            ) : (
              employees.map((emp) => (
                <View key={emp.did} style={styles.card}>
                  <Text style={styles.cardTitle}>{emp.did}</Text>
                  <Text style={styles.cardSub}>{t("employees.role")}: {emp.role} | {t("employees.department")}: {emp.department || "-"} | {t("employees.status")}: {emp.status}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "credentials" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("credentials.title")}</Text>
            </View>
            <TextInput style={styles.input} placeholder={t("credentials.placeholder")} value={selectedDid} onChangeText={(v) => { setSelectedDid(v); if (v) refreshCredentials(v); }} />
            {credentials.length === 0 ? (
              <Text style={styles.emptyText}>{t("credentials.empty")}</Text>
            ) : (
              credentials.map((cred) => (
                <View key={cred.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{cred.credential_type}</Text>
                  <Text style={styles.cardSub}>{t("credentials.status")}: {cred.status} | {t("credentials.expires")}: {cred.expires_at.slice(0, 10)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "payroll" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("payroll.title")}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => {
                const now = new Date();
                const periodStart = now.toISOString().slice(0, 10);
                const periodEnd = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
                const employeesForPayroll = employees.filter(e => e.status === "active" || e.status === 1);
                const payments = employeesForPayroll.map((emp: Employee) => ({
                  did: emp.did,
                  wallet: emp.wallet_address || "",
                  amount: emp.salary || 0,
                }));
                api.runPayroll({ period_start: periodStart, period_end: periodEnd, payments })
                  .then(refreshPayroll).catch((e) => Alert.alert(t("alert.error"), e.message));
              }}>
                <Text style={styles.addButtonText}>{t("payroll.run")}</Text>
              </TouchableOpacity>
            </View>
            {payrollRuns.length === 0 ? (
              <Text style={styles.emptyText}>{t("payroll.empty")}</Text>
            ) : (
              payrollRuns.map((run) => (
                <View key={run.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{t("payroll.runTitle")} #{run.id}</Text>
                  <Text style={styles.cardSub}>{t("payroll.amount")}: {run.total_amount} | {t("employees.status")}: {run.status} | {t("payroll.approvals")}: {run.current_approvals}/{run.required_approvals}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "governance" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("governance.title")}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowNewProposal(true)}>
                <Text style={styles.addButtonText}>{t("governance.add")}</Text>
              </TouchableOpacity>
            </View>
            {showNewProposal && (
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder={t("form.title")} value={proposalTitle} onChangeText={setProposalTitle} />
                <TextInput style={styles.input} placeholder={t("form.description")} value={proposalDesc} onChangeText={setProposalDesc} />
                <View style={styles.formActions}>
                  <Button title={t("form.cancel")} onPress={() => setShowNewProposal(false)} color="#64748b" />
                  <Button title={t("form.create")} onPress={handleCreateProposal} color="#2563eb" />
                </View>
              </View>
            )}
            {proposals.length === 0 ? (
              <Text style={styles.emptyText}>{t("governance.empty")}</Text>
            ) : (
              proposals.map((prop) => (
                <View key={prop.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{prop.title}</Text>
                  <Text style={styles.cardSub}>{t("employees.status")}: {prop.status} | {t("governance.for")}: {prop.for_votes} | {t("governance.against")}: {prop.against_votes}</Text>
                  <View style={styles.cardActions}>
                    <Button title={t("governance.voteFor")} onPress={() => api.voteProposal(prop.id, true).then(refreshProposals)} color="#10b981" />
                    <Button title={t("governance.voteAgainst")} onPress={() => api.voteProposal(prop.id, false).then(refreshProposals)} color="#ef4444" />
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}



function LangToggle({ current }: { current: "en" | "zh" }) {
  const next = current === "en" ? "zh" : "en";
  const label = next === "en" ? "EN" : "中文";
  return (
    <TouchableOpacity onPress={() => changeLanguage(next)} style={styles.langToggle}>
      <Text style={styles.langText}>{label}</Text>
    </TouchableOpacity>
  );
}

/**
 * 用户协议 + 隐私政策同意界面
 */
function ConsentScreen({ onAgree }: { onAgree: () => void }) {
  const { t } = useTranslation();
  const [policyChecked, setPolicyChecked] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

const handleAgree = async () => {
    if (!policyChecked || !agreementChecked) {
      Alert.alert(t("alert.error") || "Error", "请先阅读并同意隐私政策和用户协议");
      return;
    }
    try {
      const res = await api.complianceConsent({
        wallet_address: "mobile_" + Date.now(),
        policy_version: "v1.0",
        agreement_version: "v1.0",
      });
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, "true");
      onAgree();
    } catch (e: any) {
      Alert.alert(t("alert.error") || "Error", "无法连接到服务器，请检查网络");
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.kycContainer}>
        <Text style={styles.kycTitle}>链聘通</Text>
        <Text style={styles.kycSubtitle}>使用前请阅读并同意以下协议</Text>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, width: "100%" }}
          onPress={() => setPolicyChecked(!policyChecked)}
        >
          <View style={{
            width: 20, height: 20, borderWidth: 2, borderColor: "#2563eb",
            borderRadius: 4, marginRight: 8, backgroundColor: policyChecked ? "#2563eb" : "transparent",
          }}>
            {policyChecked && <Text style={{ color: "#fff", fontSize: 12, textAlign: "center" }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 14, color: "#334155", flex: 1 }}>
            我已阅读并同意《隐私政策》
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 32, width: "100%" }}
          onPress={() => setAgreementChecked(!agreementChecked)}
        >
          <View style={{
            width: 20, height: 20, borderWidth: 2, borderColor: "#2563eb",
            borderRadius: 4, marginRight: 8, backgroundColor: agreementChecked ? "#2563eb" : "transparent",
          }}>
            {agreementChecked && <Text style={{ color: "#fff", fontSize: 12, textAlign: "center" }}>✓</Text>}
          </View>
          <Text style={{ fontSize: 14, color: "#334155", flex: 1 }}>
            我已阅读并同意《用户协议》
          </Text>
        </TouchableOpacity>

        <View style={styles.kycActions}>
          <Button
            title="同意并继续"
            onPress={handleAgree}
            disabled={!policyChecked || !agreementChecked}
            color="#2563eb"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * 实名认证界面
 */
function KycScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [idNumber, setIdNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!idNumber || idNumber.length < 18) {
      Alert.alert(t("alert.error"), t("kyc.invalidId") || "请输入有效身份证号");
      return;
    }
    setLoading(true);
    try {
      const res = await api.complianceInitiateKYC({
        wallet_address: walletAddress || "local_" + Date.now(),
        id_number: idNumber,
      });
      if (res) {
        await AsyncStorage.setItem(KYC_STORAGE_KEY, "true");
        Alert.alert(t("alert.success") || "成功", t("kyc.success") || "实名认证通过");
        onComplete();
      }
    } catch (e: any) {
      Alert.alert(t("alert.error"), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.kycContainer}>
        <Text style={styles.kycTitle}>{t("kyc.title") || "实名认证"}</Text>
        <Text style={styles.kycSubtitle}>{t("kyc.subtitle") || "请输入身份证信息完成实名认证"}</Text>

        <TextInput
          style={styles.input}
          placeholder={t("kyc.walletPlaceholder") || "钱包地址（可选）"}
          value={walletAddress}
          onChangeText={setWalletAddress}
        />
        <TextInput
          style={styles.input}
          placeholder={t("kyc.idPlaceholder") || "身份证号"}
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="default"
          autoCapitalize="characters"
        />

        <View style={styles.kycActions}>
          <Button
            title={loading ? t("status.connecting") || "处理中..." : t("kyc.submit") || "提交认证"}
            onPress={handleSubmit}
            disabled={loading}
            color="#2563eb"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * 合规 Dashboard（HR Admin 使用）
 */
function ComplianceDashboard({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.complianceDashboard()
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("compliance.title") || "合规面板"}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: "#2563eb", fontSize: 16 }}>{t("form.close") || "关闭"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("compliance.kycStats") || "实名认证统计"}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.kycStats?.ENHANCED || 0}</Text>
              <Text style={styles.statLabel}>{t("kyc.enhanced") || "增强级"}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.kycStats?.BASIC || 0}</Text>
              <Text style={styles.statLabel}>{t("kyc.basic") || "基础级"}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.kycStats?.EXPIRED || 0}</Text>
              <Text style={[styles.statLabel, { color: "#ef4444" }]}>{t("kyc.expired") || "已过期"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("compliance.sanctions") || "制裁名单"}</Text>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.sanctions?.totalAddresses || 0}</Text>
            <Text style={styles.statLabel}>{t("compliance.sanctionsCount") || "地址已标记"}</Text>
          </View>
          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
            {t("compliance.lastUpdate") || "最后更新"}: {stats?.sanctions?.lastUpdated || "-"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [consentDone, setConsentDone] = useState(false);
  const [kycDone, setKycDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showCompliance, setShowCompliance] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CONSENT_STORAGE_KEY),
      AsyncStorage.getItem(KYC_STORAGE_KEY),
    ]).then(([consent, kyc]) => {
      if (consent === "true") setConsentDone(true);
      if (kyc === "true") setKycDone(true);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.kycContainer}>
          <Text style={{ fontSize: 16, color: "#64748b" }}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!consentDone) {
    return <ConsentScreen onAgree={() => setConsentDone(true)} />;
  }

  if (!kycDone) {
    return <KycScreen onComplete={() => setKycDone(true)} />;
  }

  return (
    <>
      {showCompliance ? (
        <ComplianceDashboard onClose={() => setShowCompliance(false)} />
      ) : (
        <>
          <DashboardScreenLocal onCompliancePress={() => setShowCompliance(true)} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#2563eb" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  connected: { backgroundColor: "#10b981" },
  disconnected: { backgroundColor: "#ef4444" },
  statusText: { fontSize: 12, color: "#64748b" },

  tabBar: {
    flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0",
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#2563eb" },
  tabText: { fontSize: 12, color: "#64748b" },
  activeTabText: { color: "#2563eb", fontWeight: "600" },
  content: { flex: 1 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: "#fff", padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0",
  },
  statValue: { fontSize: 28, fontWeight: "700", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  addButton: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  emptyText: { textAlign: "center", color: "#64748b", paddingVertical: 32 },
  card: {
    backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  cardSub: { fontSize: 12, color: "#64748b", marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  form: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 14 },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },

  complianceBadge: {
    marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: "#f0fdf4",
  },
  complianceBadgeText: { fontSize: 14 },

  kycContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    padding: 32, backgroundColor: "#f8fafc",
  },
  kycTitle: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: "#1e293b" },
  kycSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 32, textAlign: "center" },
  kycActions: { width: "100%", marginTop: 16 },

  langToggle: {
    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1, borderColor: "#cbd5e1",
  },
  langText: { fontSize: 10, color: "#64748b", fontWeight: "600" },
});
