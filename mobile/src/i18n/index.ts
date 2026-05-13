import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LANGUAGE_KEY = "@dhrs_lang";

const en = {
  app: { title: "D-HRS v2.0", modeLocal: "Local" },
  status: { connected: "Connected", disconnected: "Disconnected", localApi: "Local API", offline: "Offline", connecting: "Connecting..." },
  tabs: { dashboard: "Dashboard", employees: "员工", credentials: "凭证", payroll: "工资", governance: "治理" },
  kyc: { title: "Real Name Verification", subtitle: "Please enter your ID number to complete verification", walletPlaceholder: "Wallet address (optional)", idPlaceholder: "National ID number", submit: "Submit Verification", invalidId: "Please enter a valid 18-digit ID number", success: "Real name verification approved", basic: "Basic", enhanced: "Enhanced", expired: "Expired" },
  compliance: { title: "Compliance Dashboard", kycStats: "KYC Statistics", sanctions: "Sanctions List", sanctionsCount: "Addresses flagged", lastUpdate: "Last updated" },
  dashboard: { sectionTitle: "System Overview", totalEmployees: "Total Employees", active: "Active", credentials: "Credentials", proposals: "Proposals" },
  employees: { title: "Employees", add: "+ Add", empty: "No employees registered yet", did: "DID", role: "Role", department: "Department", status: "Status" },
  credentials: { title: "Credentials", placeholder: "Employee DID to view", empty: "No credentials for this employee", emptyAll: "No credentials issued yet", status: "Status", expires: "Expires" },
  payroll: { title: "Payroll", run: "+ Run", empty: "No payroll history", runTitle: "Run", amount: "Amount", approvals: "Approvals" },
  governance: { title: "Governance", add: "+ Proposal", empty: "No active proposals", for: "For", against: "Against", voteFor: "Vote For", voteAgainst: "Vote Against" },
  form: { title: "Title", description: "Description", cancel: "Cancel", create: "Create", submit: "Submit", close: "Close" },
  alert: { error: "Error", success: "Success" },
  status: { connecting: "Connecting..." },
};

const zh = {
  app: { title: "链聘通 v2.0", modeLocal: "本地" },
  status: { connected: "已连接", disconnected: "未连接", localApi: "本地接口", offline: "离线", connecting: "连接中..." },
  tabs: { dashboard: "概览", employees: "员工", credentials: "凭证", payroll: "工资", governance: "治理" },
  kyc: { title: "实名认证", subtitle: "请输入身份证信息完成实名认证", walletPlaceholder: "钱包地址（可选）", idPlaceholder: "身份证号", submit: "提交认证", invalidId: "请输入有效身份证号", success: "实名认证通过", basic: "基础级", enhanced: "增强级", expired: "已过期" },
  compliance: { title: "合规面板", kycStats: "实名认证统计", sanctions: "制裁名单", sanctionsCount: "已标记地址", lastUpdate: "最后更新" },
  dashboard: { sectionTitle: "系统概览", totalEmployees: "总员工", active: "在职", credentials: "凭证", proposals: "提案" },
  employees: { title: "员工管理", add: "+ 添加", empty: "暂无注册员工", did: "DID", role: "角色", department: "部门", status: "状态" },
  credentials: { title: "凭证", placeholder: "输入员工 DID 查看", empty: "该员工暂无凭证", emptyAll: "暂无凭证", status: "状态", expires: "到期" },
  payroll: { title: "工资", run: "+ 结算", empty: "暂无工资记录", runTitle: "结算", amount: "金额", approvals: "批准" },
  governance: { title: "治理", add: "+ 提案", empty: "暂无活跃提案", for: "赞成", against: "反对", voteFor: "投票赞成", voteAgainst: "投票反对" },
  form: { title: "标题", description: "描述", cancel: "取消", create: "创建", submit: "提交", close: "关闭" },
  alert: { error: "错误", success: "成功" },
};

function getSavedLanguage(): string {
  try {
    const saved = (global as any).localStorage?.getItem(LANGUAGE_KEY);
    if (saved === "en" || saved === "zh") return saved;
  } catch {}
  return "en";
}

export function saveLanguage(lang: "en" | "zh") {
  try {
    (global as any).localStorage?.setItem(LANGUAGE_KEY, lang);
  } catch {}
}

export function changeLanguage(lang: "en" | "zh") {
  saveLanguage(lang);
  i18n.changeLanguage(lang);
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
