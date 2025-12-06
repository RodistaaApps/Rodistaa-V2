# Mobile Apps Development Setup Guide

**Last Updated**: 2025-12-05

---

## 📋 Prerequisites

### Required Software

1. **Node.js** 18+ 
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

3. **Java Development Kit (JDK)** 11 or 17
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [Adoptium](https://adoptium.net/)
   - Set `JAVA_HOME` environment variable

4. **Android Studio** (for Android development)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK, Platform Tools, Build Tools
   - Set `ANDROID_HOME` environment variable

5. **Xcode** (for iOS development, macOS only)
   - Install from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

6. **Package Manager**
   - **pnpm** (recommended) or npm
   - Install pnpm: `npm install -g pnpm`

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd Rodistaa

# Install dependencies (from repo root)
pnpm install
```

### 2. Start Metro Bundler

```bash
# From app directory
cd packages/mobile/operator
npm start

# Or with cache reset
npm start -- --reset-cache
```

### 3. Run on Android

```bash
# Make sure Android emulator is running
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator-name>

# Run app
cd packages/mobile/operator
npm run android
```

### 4. Run on iOS (macOS only)

```bash
cd packages/mobile/operator
npm run ios
```

---

## 📱 App-Specific Setup

### Operator App (React Native CLI)

```bash
cd packages/mobile/operator

# Install dependencies
npm install

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Run lint
npm run lint
```

### Driver App (Expo)

```bash
cd packages/mobile/driver

# Install dependencies
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Shipper App (Expo)

```bash
cd packages/mobile/shipper

# Install dependencies
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 🛠️ Common Commands

### Metro Bundler

```bash
# Start Metro
npm start

# Start with cache reset
npm start -- --reset-cache

# Start on specific port
npm start -- --port 8081
```

### Android

```bash
# Run on Android
npm run android

# Build debug APK
cd android && ./gradlew assembleDebug

# Clean build
cd android && ./gradlew clean

# Install dependencies (if using Expo)
npx pod-install
```

### iOS (macOS only)

```bash
# Install pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on specific simulator
npm run ios -- --simulator="iPhone 14"

# Clean build
cd ios && xcodebuild clean && cd ..
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests (if Detox is set up)
cd e2e && detox test
```

---

## 🐛 Troubleshooting

### Blank Screen Issues

1. **Clear Metro cache**:
   ```bash
   npm start -- --reset-cache
   ```

2. **Clear React Native cache**:
   ```bash
   watchman watch-del-all
   rm -rf node_modules
   npm install
   ```

3. **Rebuild native code**:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   
   # iOS
   cd ios && pod deintegrate && pod install && cd ..
   ```

### Module Not Found Errors

1. **Clear and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check Metro bundler is running**:
   ```bash
   npm start
   ```

3. **Verify workspace dependencies**:
   ```bash
   # From repo root
   pnpm install
   ```

### Android Build Issues

1. **Clean Gradle cache**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Check Android SDK path**:
   ```bash
   echo $ANDROID_HOME
   # Should point to Android SDK location
   ```

3. **Update Gradle**:
   ```bash
   cd android
   ./gradlew wrapper --gradle-version=8.0
   ```

### iOS Build Issues (macOS only)

1. **Reinstall pods**:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

2. **Clean Xcode build**:
   ```bash
   cd ios
   xcodebuild clean
   cd ..
   ```

3. **Check CocoaPods version**:
   ```bash
   pod --version
   # Should be >= 1.11.0
   ```

---

## 📦 Project Structure

```
packages/mobile/
├── operator/          # React Native CLI app
│   ├── android/       # Android native code
│   ├── ios/           # iOS native code (if exists)
│   ├── src/           # Source code
│   ├── e2e/           # E2E tests
│   ├── App.tsx        # Root component
│   └── index.js       # Entry point
├── driver/            # Expo Router app
│   └── src/
│       └── app/       # Expo Router pages
└── shipper/           # Expo Router app
    └── src/
        └── app/       # Expo Router pages
```

---

## 🔧 Environment Variables

Create `.env` files in app directories if needed:

```bash
# .env
API_URL=http://localhost:4000
DEBUG_MODE=true
```

Load with `react-native-config` or similar library.

---

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Detox E2E Testing](https://wix.github.io/Detox/)

---

## 🆘 Getting Help

1. Check `VERIFY_MOBILE.md` for verification steps
2. Review `reports/mobile/summary.md` for known issues
3. Check Metro bundler logs for error messages
4. Use SafeFallback "Send Debug Log" button if app crashes

---

**Note**: This is a living document. Update as setup requirements change.

