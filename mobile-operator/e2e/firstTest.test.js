/**
 * E2E Smoke Test - Operator App
 * Basic test to verify app starts and shows login screen
 */

describe('Operator App - Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show app name on screen', async () => {
    // Wait for app to load
    await waitFor(element(by.text('Rodistaa')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show login screen elements', async () => {
    // Look for login screen elements
    await expect(element(by.text('Mobile Number'))).toBeVisible();
    await expect(element(by.id('phone-input'))).toBeVisible();
  });

  it('should not show blank screen', async () => {
    // Verify we don't see error or blank screen
    await expect(element(by.text('Initialization Error'))).not.toBeVisible();
  });
});

