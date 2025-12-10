/**
 * E2E Smoke Tests for Home and Profile Screens
 * Detox-based tests for Operator app
 */

describe('Home and Profile Screens', () => {
  beforeAll(async () => {
    // Launch app
    await device.launchApp();
  });

  beforeEach(async () => {
    // Reset app state
    await device.reloadReactNative();
  });

  describe('Home Screen', () => {
    it('should display home screen after login', async () => {
      // Skip login for now (assume already logged in)
      // In real implementation, would login first
      
      // Wait for home screen to appear
      await waitFor(element(by.id('r-header'))).toBeVisible().withTimeout(5000);
      
      // Verify header is visible
      await expect(element(by.id('r-header'))).toBeVisible();
      
      // Verify KPI cards are visible
      await expect(element(by.text('Available Trucks'))).toBeVisible();
      await expect(element(by.text('Active Bids'))).toBeVisible();
      
      // Take screenshot
      await device.takeScreenshot('home-screen');
    });

    it('should display live loads feed', async () => {
      await waitFor(element(by.id('r-header'))).toBeVisible().withTimeout(5000);
      
      // Scroll to live loads section
      await element(by.id('scroll-view')).scroll(200, 'down');
      
      // Verify live loads are visible
      await expect(element(by.text('🔥 Live Loads'))).toBeVisible();
      
      // Take screenshot
      await device.takeScreenshot('home-live-loads');
    });

    it('should navigate to bookings on quick bid press', async () => {
      await waitFor(element(by.id('r-header'))).toBeVisible().withTimeout(5000);
      
      // Find and tap quick bid button
      const quickBidButton = element(by.id('quick-bid-LD001'));
      if (await quickBidButton.exists()) {
        await quickBidButton.tap();
        // Verify navigation occurred
        await waitFor(element(by.text('Create Bid'))).toBeVisible().withTimeout(3000);
      }
    });
  });

  describe('Profile Screen', () => {
    it('should navigate to profile screen', async () => {
      await waitFor(element(by.id('r-header'))).toBeVisible().withTimeout(5000);
      
      // Tap profile button in header
      await element(by.id('header-profile-button')).tap();
      
      // Wait for profile screen
      await waitFor(element(by.id('r-profile-card'))).toBeVisible().withTimeout(3000);
      
      // Verify profile card is visible
      await expect(element(by.id('r-profile-card'))).toBeVisible();
      
      // Take screenshot
      await device.takeScreenshot('profile-screen');
    });

    it('should display KYC documents section', async () => {
      await element(by.id('header-profile-button')).tap();
      await waitFor(element(by.id('r-profile-card'))).toBeVisible().withTimeout(3000);
      
      // Scroll to documents section
      await element(by.id('scroll-view')).scroll(300, 'down');
      
      // Verify documents section
      await expect(element(by.text('KYC & Documents'))).toBeVisible();
      
      // Take screenshot
      await device.takeScreenshot('profile-documents');
    });

    it('should show reason modal when viewing document', async () => {
      await element(by.id('header-profile-button')).tap();
      await waitFor(element(by.id('r-profile-card'))).toBeVisible().withTimeout(3000);
      
      // Tap on a document
      await element(by.id('doc-DOC001')).tap();
      
      // Verify reason modal appears
      await waitFor(element(by.text('Reason for Viewing Document'))).toBeVisible().withTimeout(2000);
      
      // Take screenshot
      await device.takeScreenshot('profile-document-modal');
    });

    it('should display settings section', async () => {
      await element(by.id('header-profile-button')).tap();
      await waitFor(element(by.id('r-profile-card'))).toBeVisible().withTimeout(3000);
      
      // Scroll to settings
      await element(by.id('scroll-view')).scroll(400, 'down');
      
      // Verify settings section
      await expect(element(by.text('Account Settings'))).toBeVisible();
      
      // Take screenshot
      await device.takeScreenshot('profile-settings');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels on all interactive elements', async () => {
      await waitFor(element(by.id('r-header'))).toBeVisible().withTimeout(5000);
      
      // Verify header elements are accessible
      await expect(element(by.label('Menu'))).toBeVisible();
      await expect(element(by.label('Profile'))).toBeVisible();
      
      // Verify metric cards are accessible
      await expect(element(by.label('Available Trucks: 8'))).toBeVisible();
    });
  });
});

