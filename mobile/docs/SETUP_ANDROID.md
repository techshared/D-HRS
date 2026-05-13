# D-HRS Mobile Android 设置指南

## 环境

| 项目 | 版本 |
|------|------|
| 设备 | Meizu M2 Note (Flyme 6.3.5.0A) |
| Android | 5.1 (API 22) |
| 架构 | arm64-v8a |
| 内存 | 2 GB |
| 主机 | Windows 11 + WSL2 (Ubuntu) |
| React Native | 0.72.10 |
| Hermes | 0.12.0 (bytecode v94) |

## 构建

### 前置条件

```bash
# Windows: 安装 JDK 17, Android SDK 34, NDK 23.1.7779620
# WSL: Node.js 18+, npm
```

### 构建命令

```bash
cd mobile/android
./gradlew.bat assembleDebug
# APK 输出: app/build/outputs/apk/debug/app-debug.apk
```

### Key Patches

#### 1. JS Bundle 不被打包进 APK

**问题**: React Native 0.72 的 Gradle 插件 `TaskConfiguration.kt` 会跳过 debuggable variant 的 JS bundle 生成。默认 `debuggableVariants = ["debug"]`，导致 debug 构建中没有 `assets/index.android.bundle`。

**修复** (`mobile/android/app/build.gradle:33`):

```groovy
react {
    debuggableVariants = []   // 空列表 = 所有 variant 都生成 bundle
}
```

#### 2. Metro 连接失败

**问题**: `getUseDeveloperSupport() = BuildConfig.DEBUG` (true) 时，`DevSupportManager` 尝试连接 Metro (端口 8081)，不加载内嵌 bundle。在无 Metro 的环境中显示 "Cannot connect to Metro" 红屏。

**修复** (`MainApplication.java:27`):

```java
public boolean getUseDeveloperSupport() {
    return false;   // 跳过 Metro，直接加载内嵌 bundle
}
```

#### 3. Hermes 无法加载 libjsc.so

**问题**: React 0.72 默认的 `ReactInstanceManager` 先尝试 JSC (libjscexecutor.so)，找不到才回退到 Hermes。SoLoader 日志显示 `couldn't find DSO to load: libjscexecutor.so`，但有 `hermesEnabled=true` 时 Hermes 最终能正确加载。

此行为不影响功能，Hermes 可正常加载 HBC 字节码。

### 验证构建产物

APK 中必须包含以下文件:

```bash
python3 -c "
import zipfile
with zipfile.ZipFile('app-debug.apk') as z:
    for f in z.namelist():
        if 'bundle' in f or 'libhermes' in f:
            print(f, z.getinfo(f).file_size)
"
```

预期输出:

```
assets/index.android.bundle       # ~1.7 MB (Hermes bytecode)
lib/arm64-v8a/libhermes.so         # ~2.3 MB
lib/arm64-v8a/libhermes_executor.so # ~6.5 MB
```

## 安装

### Flyme PRD 固件限制

`adb install` 被 Flyme PRD 固件拦截。`settings put global install_non_market_apps 1` 无效。唯一可行的方法是 session install:

```bash
ADB="/path/to/adb"
APK="/path/to/app-debug.apk"
SIZE=$(stat -c%s "$APK")

$ADB push "$APK" /data/local/tmp/app.apk
SID=$($ADB shell pm install-create -r -t -S $SIZE | grep -oP '\[\K\d+')
$ADB shell pm install-write -S $SIZE $SID base.apk /data/local/tmp/app.apk
$ADB shell pm install-commit $SID
```

## 启动

### 后端必须在 Windows 上运行

**关键**: 后端必须运行在 **Windows 主机**上，不是 WSL。WSL2 的端口转发 (`wslrelay`) 在反复断开/重连后可能丢失 IPv4 监听，导致 ADB reverse 无法连接到 WSL 内的后端。

```powershell
# Windows PowerShell (推荐)
cd C:\Projects\AI\Decentralized\D-HRS\backend
node src\index.js
```

或者:

```bash
# 从 WSL 启动 Windows 上的 Node
powershell.exe -Command "cd C:\Projects\AI\Decentralized\D-HRS\backend; node src/index.js"
```

### ADB 反向代理

```bash
adb reverse tcp:3001 tcp:3001
```

验证:

```bash
# 设备端应有 LISTEN 状态的 127.0.0.1:3001
adb shell cat /proc/net/tcp | grep 0BB9
# 输出: 0100007F:0BB9 00000000:0000 0A ...
```

### 一键启动脚本

```bash
# Windows: 双击 或
mobile/scripts/start-mobile.bat
```

脚本自动完成: 清理端口 → 启动后端 → 检查设备 → ADB reverse → 安装 APK → 启动 App。

## 网络架构

```
┌─────────────┐     ADB reverse      ┌──────────┐     localhost     ┌─────────┐
│  Meizu M2   │ tcp:3001 ←────────→ │ Windows  │ ←──────────────→ │ Backend │
│  (Device)   │     (USB)           │ (Host)   │   port 3001      │ (Node)  │
└─────────────┘                      └──────────┘                  └─────────┘
    127.0.0.1:3001                   127.0.0.1:3001                0.0.0.0:3001
```

## 常见问题

### App 启动后不显示 JS 日志

可能原因:
1. **内存不足** — Meizu M2 Note 仅 2GB RAM，启动后空闲 ~64MB。强制停止其他应用后再试
2. **logcat 缓冲区溢出** — 256KB 环形缓冲区很快被系统日志填满。使用 `logcat -v time -f /path/file` 持续捕获
3. **旧进程未清理** — 先 `adb shell am force-stop com.dhrs.mobile`

### "Cannot connect to Metro" 红屏

确认 `MainApplication.java` 中 `getUseDeveloperSupport()` 返回 `false`。

### Health check 返回 "Request failed"

1. 确认后端在 Windows 上运行: `curl http://localhost:3001/api/v1/health`
2. 确认 ADB reverse 已设置: `adb shell cat /proc/net/tcp | grep 0BB9`
3. 检查是否有旧 node 进程占用了 Windows 端口 3001: `netstat -ano | findstr :3001`

### ADB reverse 失败

```bash
adb kill-server
adb start-server
adb reverse tcp:3001 tcp:3001
```

### 屏幕截图

App 主界面包含:
- 模式切换: Wallet / Local
- Local 模式下显示绿色 "Connected" 状态指示
- 数据面板: Employees, Payroll, Proposals

## 关键文件

| 文件 | 作用 |
|------|------|
| `mobile/android/app/build.gradle` | `debuggableVariants = []` 确保 bundle 打包 |
| `mobile/android/app/.../MainApplication.java` | `getUseDeveloperSupport() = false` 跳过 Metro |
| `mobile/src/api/client.ts` | `API_BASE = "http://127.0.0.1:3001/api/v1"` |
| `backend/src/index.js` | 所有响应使用 `{success: true, data: ...}` 格式 |
| `mobile/scripts/start-mobile.bat` | 一键启动脚本 |
