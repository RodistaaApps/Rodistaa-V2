/**
 * E2E Smoke Tests for Operator App
 * Detox framework
 */

describe('Operator App Smoke Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    // Enter phone number
    await element(by.id('phone-input')).typeText('9876543211');
    await element(by.id('request-otp-button')).tap();

    // Wait for OTP screen
    await waitFor(element(by.id('otp-input')))
      .toBeVisible()
      .withTimeout(2000);

    // Enter OTP
    await element(by.id('otp-input')).typeText('123456');
    await element(by.id('verify-otp-button')).tap();

    // Should navigate to home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should navigate to fleet screen', async () => {
    // Assuming already logged in
    await element(by.id('fleet-tab')).tap();
    await expect(element(by.id('fleet-screen'))).toBeVisible();
  });
});

