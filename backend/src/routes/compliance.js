const express = require("express");
const router = express.Router();
const ComplianceMiddleware = require("../middleware/compliance");
const sanctions = require("../data/sanctions");
const { encrypt, hash, maskIdNumber } = require("../utils/crypto");
const { moderateEmployeeData } = require("../utils/moderation");

// 内存存储（生产环境应使用数据库）
const kycStore = new Map();
const consentStore = new Map();
const auditLog = [];

/**
 * GET /api/v1/compliance/dashboard
 * 合规状态概览
 */
router.get("/dashboard", (req, res) => {
  const stats = {
    totalUsers: kycStore.size,
    kycStats: {
      BASIC: 0,
      ENHANCED: 0,
      NONE: 0,
      EXPIRED: 0,
    },
    sanctions: {
      totalAddresses: sanctions.addresses.length,
      lastUpdated: sanctions.lastUpdated,
    },
  };

  for (const [, user] of kycStore) {
    if (user.kycExpiry && user.kycExpiry < Date.now()) {
      stats.kycStats.EXPIRED++;
    } else if (user.realNameLevel) {
      stats.kycStats[user.realNameLevel]++;
    } else {
      stats.kycStats.NONE++;
    }
  }

  res.json({ success: true, data: stats });
});

/**
 * GET /api/v1/compliance/status/:address
 * 查询指定地址的实名认证状态
 */
router.get("/status/:address", (req, res) => {
  const user = kycStore.get(req.params.address.toLowerCase());
  res.json({
    success: true,
    data: user
      ? {
          walletAddress: user.walletAddress,
          realNameLevel: user.realNameLevel,
          kycExpiry: user.kycExpiry,
          authMethod: user.authMethod,
          authTime: user.authTime,
          valid: user.kycExpiry > Date.now(),
        }
      : {
          walletAddress: req.params.address,
          realNameLevel: "NONE",
          valid: false,
        },
  });
});

/**
 * POST /api/v1/compliance/kyc/initiate
 * 发起实名认证（生产环境应跳转到支付宝/CTID SDK）
 */
router.post("/kyc/initiate", async (req, res) => {
  try {
    const { wallet_address, id_number } = req.body;

    if (!wallet_address || !id_number) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        reason: "wallet_address 和 id_number 为必填项",
      });
    }

    // Enforce consent check before KYC
    const consent = consentStore.get(wallet_address.toLowerCase());
    if (!consent) {
      return res.status(403).json({
        success: false,
        error: "CONSENT_REQUIRED",
        reason: "请先同意隐私政策和用户协议 / Consent required before KYC",
      });
    }

    const kycResult = await ComplianceMiddleware.simulateKYC(
      wallet_address,
      id_number
    );

    kycStore.set(wallet_address.toLowerCase(), kycResult);

    res.json({
      success: true,
      data: {
        status: "APPROVED",
        level: kycResult.realNameLevel,
        message: "实名认证通过 / Real name verification approved",
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "KYC_FAILED",
      reason: err.message,
    });
  }
});

/**
 * POST /api/v1/compliance/kyc/renew
 * 刷新实名认证
 */
router.post("/kyc/renew", async (req, res) => {
  try {
    const { wallet_address, id_number } = req.body;
    if (!wallet_address || !id_number) {
      return res.status(400).json({
        success: false,
        error: "MISSING_FIELDS",
        reason: "wallet_address 和 id_number 为必填项",
      });
    }

    const kycResult = await ComplianceMiddleware.simulateKYC(
      wallet_address,
      id_number
    );
    kycStore.set(wallet_address.toLowerCase(), kycResult);

    res.json({
      success: true,
      data: {
        status: "RENEWED",
        level: kycResult.realNameLevel,
        expiry: kycResult.kycExpiry,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "KYC_RENEW_FAILED",
      reason: err.message,
    });
  }
});

/**
 * GET /api/v1/compliance/sanctions
 * 查看制裁名单
 */
router.get("/sanctions", (req, res) => {
  res.json({
    success: true,
    data: {
      count: sanctions.addresses.length,
      entities: sanctions.entities,
      countries: sanctions.countries,
      lastUpdated: sanctions.lastUpdated,
      source: sanctions.source,
    },
  });
});

/**
 * POST /api/v1/compliance/sanctions/check
 * 检查地址是否在制裁名单中
 */
router.post("/sanctions/check", (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ success: false, error: "address required" });
  }

  const hit = sanctions.addresses.includes(address.toLowerCase());
  res.json({
    success: true,
    data: {
      address,
      blocked: hit,
      reason: hit ? "Address matched sanctions list" : "Clear",
    },
  });
});

/**
 * GET /api/v1/compliance/users
 * 查询所有已认证用户列表（HR Admin 使用）
 */
router.get("/users", (req, res) => {
  const users = Array.from(kycStore.values()).map((u) => ({
    walletAddress: u.walletAddress,
    realNameLevel: u.realNameLevel,
    kycExpiry: u.kycExpiry,
    valid: u.kycExpiry > Date.now(),
    authMethod: u.authMethod,
    authTime: u.authTime,
  }));

  res.json({ success: true, data: users });
});

/**
 * POST /api/v1/compliance/consent
 * 记录用户同意（隐私政策 + 用户协议）
 */
router.post("/consent", (req, res) => {
  const { wallet_address, policy_version, agreement_version } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ success: false, error: "wallet_address required" });
  }

  consentStore.set(wallet_address.toLowerCase(), {
    walletAddress: wallet_address,
    policyVersion: policy_version || "v1.0",
    agreementVersion: agreement_version || "v1.0",
    consentTime: new Date().toISOString(),
    ip: req.ip,
  });

  auditLog.push({
    action: "CONSENT_RECORDED",
    wallet: wallet_address,
    time: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: { status: "recorded", time: new Date().toISOString() },
  });
});

/**
 * GET /api/v1/compliance/consent/:address
 * 查询用户同意状态
 */
router.get("/consent/:address", (req, res) => {
  const consent = consentStore.get(req.params.address.toLowerCase());
  res.json({
    success: true,
    data: consent
      ? { ...consent, status: "agreed" }
      : { status: "not_agreed" },
  });
});

/**
 * GET /api/v1/compliance/user-data/:address
 * 用户查阅权 — 查看系统收集的个人信息
 */
router.get("/user-data/:address", (req, res) => {
  const addr = req.params.address.toLowerCase();
  const kyc = kycStore.get(addr);
  const consent = consentStore.get(addr);

  const userData = {
    walletAddress: addr,
    kyc: kyc
      ? {
          realNameLevel: kyc.realNameLevel,
          idNumberMasked: maskIdNumber(kyc.idNumberHash ? "***hashed***" : null),
          authMethod: kyc.authMethod,
          authTime: kyc.authTime,
          expiry: kyc.kycExpiry,
        }
      : null,
    consent: consent || null,
    dataCollected: [
      "身份证号（仅存储哈希值）",
      "实名认证等级",
      "操作日志",
    ],
    dataNotCollected: [
      "银行账户信息",
      "位置信息",
      "设备通讯录",
    ],
  };

  auditLog.push({
    action: "DATA_VIEW",
    wallet: addr,
    time: new Date().toISOString(),
  });

  res.json({ success: true, data: userData });
});

/**
 * PUT /api/v1/compliance/user-data/:address
 * 用户更正权 — 更正个人信息
 */
router.put("/user-data/:address", (req, res) => {
  const addr = req.params.address.toLowerCase();
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({ success: false, error: "field and value required" });
  }

  const kyc = kycStore.get(addr);
  if (!kyc) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // 只允许更正特定字段
  const allowedFields = ["idNumberHash", "walletAddress"];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({
      success: false,
      error: `Field '${field}' cannot be corrected. Allowed: ${allowedFields.join(", ")}`,
    });
  }

  if (field === "idNumberHash") {
    kyc.idNumberHash = hash(value);
  } else {
    kyc[field] = value;
  }

  kycStore.set(addr, kyc);

  auditLog.push({
    action: "DATA_CORRECTED",
    wallet: addr,
    field,
    time: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: { status: "corrected", field, time: new Date().toISOString() },
  });
});

/**
 * DELETE /api/v1/compliance/user-data/:address
 * 用户删除权 — 删除个人信息
 */
router.delete("/user-data/:address", (req, res) => {
  const addr = req.params.address.toLowerCase();

  const existed = kycStore.has(addr);
  kycStore.delete(addr);
  consentStore.delete(addr);

  auditLog.push({
    action: "DATA_DELETED",
    wallet: addr,
    existed,
    time: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: {
      status: "deleted",
      note: "链上数据因技术限制无法物理删除，已撤销访问权限实现功能删除",
      time: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/v1/compliance/audit-log
 * 审计日志查询
 */
router.get("/audit-log", (req, res) => {
  const { action, wallet, limit = 50 } = req.query;
  let logs = [...auditLog];

  if (action) logs = logs.filter((l) => l.action === action);
  if (wallet) logs = logs.filter((l) => l.wallet === wallet.toLowerCase());

  logs = logs.slice(-parseInt(limit));

  res.json({ success: true, data: logs });
});

module.exports = router;
