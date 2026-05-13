const sanctions = require("../data/sanctions");

/**
 * 合规中间件 —— 实名认证 + 制裁筛查
 */

class ComplianceMiddleware {
  /**
   * 实名认证状态验证
   * @param {string} requiredLevel - BASIC | ENHANCED
   */
  static kycRequired(requiredLevel = "BASIC") {
    return (req, res, next) => {
      const user = req.user;
      if (!user || !user.realNameLevel || user.realNameLevel === "NONE") {
        return res.status(403).json({
          success: false,
          error: "KYC_REQUIRED",
          reason: "请先完成实名认证 / Real name auth required",
          kycUrl: "/api/v1/compliance/kyc/initiate",
        });
      }

      const levelWeight = { NONE: 0, BASIC: 1, ENHANCED: 2 };
      if (levelWeight[user.realNameLevel] < levelWeight[requiredLevel]) {
        return res.status(403).json({
          success: false,
          error: "KYC_LEVEL_INSUFFICIENT",
          current: user.realNameLevel,
          required: requiredLevel,
        });
      }

      if (user.kycExpiry && user.kycExpiry < Date.now()) {
        return res.status(403).json({
          success: false,
          error: "KYC_EXPIRED",
          reason: "实名认证已过期，请重新认证 / KYC expired",
          reKycUrl: "/api/v1/compliance/kyc/renew",
        });
      }

      next();
    };
  }

  /**
   * 制裁地址筛查
   */
  static sanctionsScreen() {
    return (req, res, next) => {
      const walletAddress = req.body?.wallet_address
        || req.params?.address
        || req.user?.walletAddress;

      if (!walletAddress) return next();

      const addr = walletAddress.toLowerCase();

      if (sanctions.addresses.includes(addr)) {
        return res.status(403).json({
          success: false,
          error: "COMPLIANCE_BLOCKED",
          reason: "地址匹配已知制裁名单 / Address matched sanctions list",
          blocked: true,
        });
      }

      next();
    };
  }

  /**
   * 模拟实名认证流程（生产环境应集成支付宝/CTID API）
   * 返回一个模拟的 JWT payload
   */
  static async simulateKYC(walletAddress, idNumber) {
    // 模拟身份认证延迟
    await new Promise((r) => setTimeout(r, 500));

    // 模拟身份证校验（生产环境调 CTID 接口）
    const idValid = idNumber && idNumber.length === 18;

    if (!idValid) {
      throw new Error("身份证号格式无效 / Invalid ID number");
    }

    return {
      walletAddress,
      realNameLevel: "ENHANCED",
      kycExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 年
      idNumberHash: require("crypto")
        .createHash("sha256")
        .update(idNumber)
        .digest("hex"),
      authMethod: "id_card",
      authTime: new Date().toISOString(),
    };
  }
}

module.exports = ComplianceMiddleware;
