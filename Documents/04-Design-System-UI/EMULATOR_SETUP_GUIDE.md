# Mobile App Emulator Setup Guide

**Date**: December 2, 2025  
**Purpose**: Run Rodistaa mobile apps in Android/iOS emulators

---

## 🤖 ANDROID EMULATOR SETUP

### Prerequisites

#### 1. Install Android Studio
**Download**: https://developer.android.com/studio

**Installation Steps**:
1. Download Android Studio installer
2. Run installer with default settings
3. Wait for Android SDK installation
4. Launch Android Studio

#### 2. Install Android SDK Tools
In Android Studio:
1. Go to **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
2. Check these packages:
   - **Android SDK Platform 33** (or latest)
   - **Android SDK Build-Tools**
   - **Android Emulator**
   - **Android SDK Platform-Tools**
3. Click **Apply** and wait for installation

#### 3. Create Virtual Device
1. Open **AVD Manager** (Tools → Device Manager)
2. Click **Create Virtual Device**
3. Select device: **Pixel 5** or similar
4. Select system image: **Android 13 (API 33)** or **Android 14 (API 34)**
5. Click **Finish**

#### 4. Configure Environment Variables
Add to **System Environment Variables**:
```
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

Add to **PATH**:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

---

## 🍎 iOS SIMULATOR SETUP (Mac Only)

### Prerequisites

#### 1. Install Xcode
**Download**: App Store → Search "Xcode"

#### 2. Install Command Line Tools
```bash
xcode-select --install
```

#### 3. Install iOS Simulator
1. Open Xcode
2. Go to **Xcode** → **Preferences** → **Components**
3. Install iOS simulators

---

## 🚀 RUNNING SHIPPER APP IN EMULATOR

### Android Emulator

#### Method 1: With Expo CLI (Automatic)
```bash
cd packages/mobile/shipper
pnpm android
```

**Expo will**:
1. Start Metro Bundler
2. Build the app
3. Launch Android emulator (if not running)
4. Install app on emulator
5. Open app automatically

**Expected Time**: 2-5 minutes (first build slower)

---

#### Method 2: Manual Launch
```bash
# 1. Start emulator first
emulator -avd Pixel_5_API_33

# 2. Start Expo
cd packages/mobile/shipper
pnpm start

# 3. Press 'a' in terminal for Android
```

---

### iOS Simulator (Mac Only)

```bash
cd packages/mobile/shipper
pnpm ios
```

---

## 🔧 CURRENT ATTEMPT STATUS

**Command Running**: `pnpm android`  
**Status**: Starting...

**Expected Steps**:
1. 🔄 Checking for emulator...
2. 🔄 Starting Metro Bundler...
3. 🔄 Building Android APK...
4. 🔄 Installing on emulator...
5. 🔄 Launching app...

---

## ⚠️ POSSIBLE ISSUES

### 1. "adb not found"
**Solution**: Install Android Studio and add to PATH

### 2. "No emulator running"
**Solution**: Launch emulator manually or create one in AVD Manager

### 3. "Build failed"
**Solution**: Install Android SDK Build-Tools in Android Studio

### 4. "Expo dev tools not opening"
**Solution**: Access manually at http://localhost:8081

---

## 📊 CHECKING EMULATOR STATUS

### Check if Android emulator exists:
```bash
emulator -list-avds
```

### Check if emulator is running:
```bash
adb devices
```

### Start specific emulator:
```bash
emulator -avd YOUR_AVD_NAME
```

---

## 🎯 ALTERNATIVE: USE EXPO GO (FASTER)

If emulator setup is complex, use **Expo Go** instead:

1. **Install Expo Go** on your phone
2. **Run**: `cd packages/mobile/shipper && pnpm start`
3. **Scan QR code** with Expo Go app
4. **Test immediately** - no emulator needed!

**Advantage**: No emulator setup, real device testing

---

## 📱 ALL 3 APPS READY

### Shipper App
```bash
cd packages/mobile/shipper
pnpm android  # or pnpm ios
```

### Operator App
```bash
cd packages/mobile/operator
pnpm android  # or pnpm ios
```

### Driver App
```bash
cd packages/mobile/driver
pnpm android  # or pnpm ios
```

---

## 🎉 WHAT'S ALREADY WORKING

While emulator starts, you can test:
- ✅ **Admin Portal** in Chrome: http://localhost:3001
- ✅ **Backend API**: http://localhost:4000
- ✅ **ACS Service**: http://localhost:5000

**All web services are live and testable now!**

---

**Guide**: EMULATOR_SETUP_GUIDE.md  
**Status**: Checking for Android emulator...  
**App**: Shipper app starting...

