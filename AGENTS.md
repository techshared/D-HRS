# Agent Context

## Project Overview

D-HRS (链聘通 / ChainHire) v2.0 — Blockchain-based HR management platform for China compliance. No cryptocurrency payments. All on-chain operations are approval-only audit trails.

## Architecture

### Smart Contracts (contracts/src/)
- `ComplianceEngine.sol` — KYC + sanctions + compliance guard
- `EmployeeRegistry.sol` — Employee registration (NO salary on-chain, PIPL compliant)
- `CredentialRegistry.sol` — W3C VC issuance/verification
- `PayrollExecutor.sol` — Multi-sig approval workflow (NO on-chain payments)
- `BenefitsNFT.sol` — Soulbound NFT (non-transferable)
- `HRGovernance.sol` — DAO proposals/voting
- `DIDRegistry.sol` — DID management
- `HRAIOracle.sol` — Salary benchmarks/performance scoring
- `DecentralizedHRS.sol` — Recruitment/evaluations/promotions/layoffs

### Backend (backend/src/)
- `index.js` — Express API server (port 3001) with JWT auth + compliance middleware
- `middleware/compliance.js` — KYC verification + sanctions screening
- `routes/compliance.js` — Compliance API endpoints
- `data/sanctions.js` — Sanctions list (OFAC + China MOFA)

### Mobile (mobile/)
- `App.tsx` — React Native app with KYC screen → Dashboard
- `src/api/client.ts` — API client
- `src/i18n/` — EN/中文 translations (i18next)

### Web (index.html)
- Standalone HTML/CSS/JS with vanilla i18n
- Compliance Dashboard tab

## Critical Constraints

### China Compliance (MUST follow)
- ❌ NO cryptocurrency payments (salary paid by employer via banking)
- ❌ NO ERC-20 token issuance/transfers
- ❌ NO Bitcoin/Lightning Network
- ❌ NO wallet connections (MetaMask, WalletConnect)
- ❌ NO on-chain salary storage (PIPL: personal financial data off-chain)
- ❌ NO transferable NFTs (BenefitsNFT is soulbound)
- ✅ Real-name authentication (KYC) required before HR operations
- ✅ Sanctions screening on all sensitive endpoints
- ✅ All contracts must be pausable

### Security Requirements
- JWT authentication on all business routes
- `authenticateToken` middleware must be applied to write endpoints
- `ComplianceMiddleware.sanctionsScreen()` on all sensitive operations
- Input validation on all contract functions
- ReentrancyGuard on state-modifying functions
- Rate limiting (100 actions/day, 1 minute cooldown)
- User consent required before first use (Privacy Policy + User Agreement)
- Content moderation on employee data and governance proposals
- Database field-level encryption (AES-256 for salary/ID numbers)
- Audit logging for all sensitive operations

## Mobile (Android)

**Device**: Meizu M2 Note, Android 5.1 (API 22), Flyme 6.3.5.0A, arm64-v8a, 2GB RAM

### Build
- `debuggableVariants = []` in `mobile/android/app/build.gradle` — forces JS bundle into debug APK
- `getUseDeveloperSupport() = false` in `MainApplication.java` — skips Metro, uses embedded bundle
- Hermes bytecode works on API 22 (verified)
- Gradle: Tencent mirror, ext versions in root `build.gradle`
- Build: `cd mobile/android && ./gradlew.bat assembleDebug`
- Output: `mobile/android/app/build/outputs/apk/debug/app-debug.apk` (~64 MB)

### Install (session install required)
```bash
ADB=/path/to/adb
SIZE=$(stat -c%s app-debug.apk)
adb push app-debug.apk /data/local/tmp/app.apk
SID=$(adb shell pm install-create -r -t -S $SIZE | grep -oP '\[\K\d+')
adb shell pm install-write -S $SIZE $SID base.apk /data/local/tmp/app.apk
adb shell pm install-commit $SID
```

### Network
- Backend API: `http://127.0.0.1:3001/api/v1`
- **Backend must run on Windows** (not WSL — WSL2 port forwarding breaks on reconnect)
- ADB reverse: `adb reverse tcp:3001 tcp:3001`
- All backend responses use `{success: true, data: ...}` format
- Startup script: `mobile/scripts/start-mobile.bat`

### Debugging
- JS logs: `adb logcat -s ReactNativeJS`
- logcat buffer is 256KB — capture immediately or use `-f` flag
- Device memory very limited (~64 MB free) — kill other apps before testing
- Check for stale Windows node processes on port 3001

## Key Files

| File | Purpose |
|------|---------|
| `contracts/src/ComplianceEngine.sol` | On-chain compliance (KYC + sanctions) |
| `contracts/src/EmployeeRegistry.sol` | Employee management (no salary) |
| `contracts/src/PayrollExecutor.sol` | Payroll approval (no payments) |
| `contracts/src/BenefitsNFT.sol` | Soulbound benefits NFT |
| `backend/src/index.js` | API server with JWT + compliance |
| `backend/src/middleware/compliance.js` | KYC + sanctions middleware |
| `backend/src/routes/compliance.js` | Compliance API endpoints |
| `backend/src/utils/crypto.js` | Encryption utilities (AES-256 + SHA-256) |
| `backend/src/utils/moderation.js` | Content moderation (sensitive word filter) |
| `mobile/App.tsx` | Mobile app (Consent → KYC → Dashboard) |
| `index.html` | Web UI with Compliance tab |
| `docs/compliance/` | 等保 2.0 security policy documents |
| `docs/filing/` | Blockchain filing materials |
| `docs/legal/` | User agreement + Privacy policy |
| `SECURITY_AUDIT.md` | Security audit report |

## Compliance Documentation

- `docs/compliance/01-12_*.md` — 等保 2.0 security management policies
- `docs/compliance/等保三级差距评估自查清单.md` — Gap assessment checklist
- `docs/compliance/等保三级测评详细步骤.md` — Level 3 assessment guide
- `docs/compliance/智能合约安全审计准备.md` — Smart contract audit preparation
- `docs/compliance/第三方合约审计详细步骤.md` — Third-party audit guide
- `docs/compliance/数据安全风险评估报告.md` — Data security risk assessment
- `docs/filing/区块链信息服务备案材料.md` — Blockchain filing materials
- `docs/filing/备案自行提交详细步骤.md` — Self-filing guide
- `docs/legal/用户协议.md` — User agreement
- `docs/legal/隐私政策.md` — Privacy policy
