---
description: Launch MindStream on a connected Android device via USB with live Metro bundler
---

# run-android

Builds and installs the app directly on a USB-connected Android device, then starts Metro for live reload.

## Prerequisites

- Android SDK at `C:\Users\CTecn\AppData\Local\Android\Sdk`
- USB debugging enabled on the device (Settings → Developer Options → USB Debugging)
- Device connected and authorized (`adb devices` shows it)

## Steps

### 1. Set environment variables

```powershell
$env:ANDROID_HOME = "C:\Users\CTecn\AppData\Local\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"
```

### 2. Verify device is connected

```powershell
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```

Expected output: one line with `device` status (not `unauthorized` or `offline`).
If empty, ask the user to: plug USB cable → accept "Allow USB debugging" dialog on phone.

### 3. Run on device

```powershell
Set-Location "C:\Users\CTecn\projects\MindStream-Final"
npx expo run:android 2>&1
```

This compiles the native code (~3 min first time, faster on subsequent runs) and installs the APK.
Metro bundler starts automatically and the app opens on the device.

## After launch — verify voice transcription

1. Tap the **+** FAB button → modal opens
2. Press and hold **🎤 MANTÉN PULSADO PARA HABLAR** → button turns red with "🔴 Escuchando..."
3. Say something in Spanish → text appears live in the text field
4. Release → transcription finalizes
5. Tap **💾 Guardar** → entry appears in the list

## Common issues

| Symptom | Fix |
|---|---|
| `adb: device unauthorized` | Accept "Allow USB debugging" on the phone screen |
| `adb: no devices` | Enable USB debugging, try a different USB cable/port |
| Build fails: SDK not found | Verify `ANDROID_HOME` path above exists |
| Microphone button disabled | Device has no speech recognition engine — install Google app |
