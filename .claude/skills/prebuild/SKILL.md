---
description: Regenerate the android/ and ios/ native folders from app.json (expo prebuild)
---

# prebuild

Regenerates native Android/iOS project folders from `app.json` + installed config plugins. Required after changing `app.json` plugins, permissions, or native module config — those changes don't take effect until prebuild runs and the app is rebuilt.

Note: `android/` and `ios/` are gitignored in this project — EAS Build and CI always regenerate them from `app.json` on every build. Running prebuild locally is only needed for local testing via `npx expo run:android`.

## Steps

### 1. Set Android SDK env (if running locally afterward)

```powershell
$env:ANDROID_HOME = "C:\Users\CTecn\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"
```

### 2. Run prebuild

```powershell
Set-Location "C:\Users\CTecn\projects\MindStream-Final"
npx expo prebuild --clean --platform android
```

Use `--clean` to wipe and fully regenerate (safest after plugin/permission changes).
Drop `--platform android` to regenerate both `android/` and `ios/`.

Git may warn about uncommitted changes — safe to proceed since `android/`/`ios/` are gitignored anyway.

### 3. Verify plugin output landed correctly

For `expo-speech-recognition` specifically, check the manifest got the right permissions/queries:

```bash
grep -n "RECORD_AUDIO\|RecognitionService\|googlequicksearchbox" android/app/src/main/AndroidManifest.xml
```

Expected: `android.permission.RECORD_AUDIO`, a `<queries>` entry for `com.google.android.googlequicksearchbox`, and an `android.speech.RecognitionService` intent filter.

### 4. Next step

Either:
- `npx expo run:android` to build + install on a USB-connected device (see [run-android](../run-android/SKILL.md))
- Commit `app.json` and let EAS Build prebuild remotely (see [eas-build](../eas-build/SKILL.md))
