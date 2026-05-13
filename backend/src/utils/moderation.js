/**
 * 内容审核模块 — 敏感词过滤 + 链上数据审核
 */

const SENSITIVE_WORDS = [
  // 政治敏感词（示例，生产环境需完整列表）
  '赌博', '色情', '毒品', '枪支', '暴力',
  // 个人信息泄露风险
  '身份证', '银行卡', '密码',
];

function checkContent(text) {
  if (!text) return { pass: true, reason: null };

  const lower = text.toLowerCase();

  for (const word of SENSITIVE_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { pass: false, reason: `内容包含敏感词: ${word}` };
    }
  }

  return { pass: true, reason: null };
}

function moderateEmployeeData(data) {
  const issues = [];

  if (data.role) {
    const result = checkContent(data.role);
    if (!result.pass) issues.push(`角色: ${result.reason}`);
  }

  if (data.department) {
    const result = checkContent(data.department);
    if (!result.pass) issues.push(`部门: ${result.reason}`);
  }

  if (data.personalInfoHash) {
    const result = checkContent(data.personalInfoHash);
    if (!result.pass) issues.push(`个人信息: ${result.reason}`);
  }

  return {
    pass: issues.length === 0,
    issues
  };
}

function moderateProposal(data) {
  const issues = [];

  if (data.title) {
    const result = checkContent(data.title);
    if (!result.pass) issues.push(`标题: ${result.reason}`);
  }

  if (data.description) {
    const result = checkContent(data.description);
    if (!result.pass) issues.push(`描述: ${result.reason}`);
  }

  return {
    pass: issues.length === 0,
    issues
  };
}

module.exports = { checkContent, moderateEmployeeData, moderateProposal };
