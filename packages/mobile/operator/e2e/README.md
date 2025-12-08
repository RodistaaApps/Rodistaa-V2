# E2E Testing for Operator App

## Setup

### Install Detox (Optional)

```bash
npm install --save-dev detox
```

### For Android

1. Install Android Studio and set up an emulator
2. Create an AVD (Android Virtual Device) named `Pixel_4_API_30`
3. Start the emulator

### Run Tests

```bash
# Build the app and tests
detox build --configuration android.emu.debug

# Run tests
detox test --configuration android.emu.debug
```

## Test Structure

- `firstTest.test.js` - Basic smoke test to verify app loads
- `config.json` - Detox configuration
- `jest.config.js` - Jest configuration for E2E tests

## Manual Testing (No Detox)

If Detox is not set up, you can manually verify:

1. Start Metro: `npm start`
2. Run Android: `npm run android`
3. Verify:
   - App loads without blank screen
   - Login screen appears
   - No "Initialization Error" message
   - No red error screens

## Adding More Tests

Add new test files in `e2e/` directory following the pattern:

```javascript
describe('Feature Name', () => {
  it('should do something', async () => {
    // Test code
  });
});
```

