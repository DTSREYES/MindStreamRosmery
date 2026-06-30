---
description: Build MindStream APK/AAB in the cloud via EAS Build (no USB cable needed)
---

# eas-build

Builds an installable Android APK or production AAB on Expo's cloud infrastructure. Use when no USB cable is available or to produce a shareable build.

## Profiles (defined in eas.json)

| Profile | Output | Use case |
|---|---|---|
| `development` | APK with dev-client | Live-reload testing, install once, then `npx expo start` to iterate |
| `preview` | Standalone APK | Test as an end user would, no dev tools, no Metro needed |
| `production` | AAB | Google Play submission (use `submit` profile after) |

## Steps

### 1. Verify EAS login

```powershell
Set-Location "C:\Users\CTecn\projects\MindStream-Final"
npx eas whoami
```

If not logged in: `npx eas login`.

### 2. Launch build

```powershell
npx eas build --profile development --platform android --non-interactive
```

Swap `development` for `preview` or `production` as needed. Runs in background — takes 10-15 min.
Progress and download link appear at `https://expo.dev/accounts/<account>/projects/mindstream/builds/<id>`.

### 3. Install on device

Once finished, EAS prints a download URL and a QR code. Either:
- Open the URL on the phone's browser to download + install the APK directly, or
- Scan the QR with the phone camera

Android will prompt "Install unknown apps" the first time — user must allow it for the browser/file manager.

### 4. For `development` profile only — start Metro after install

```powershell
npx expo start --dev-client
```

Open the installed app on the phone; it connects to Metro automatically (same WiFi network required, or use `--tunnel` if on different networks).

## Common issues

| Symptom | Fix |
|---|---|
| Build queued for a long time | Free tier has limited concurrent builds — check expo.dev dashboard |
| "Install blocked" on Android | Enable "Install unknown apps" for the browser used to download |
| App can't reach Metro | Phone and computer must share WiFi, or run `npx expo start --tunnel` |
| Credentials prompt | Accept "Using remote Android credentials (Expo server)" — EAS manages the keystore |
