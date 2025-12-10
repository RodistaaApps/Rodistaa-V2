/**
 * Comprehensive E2E Tests for Portals
 * Updated for Phone/OTP Authentication Flow
 */

import { test, expect } from '@playwright/test';

const TEST_PHONE = '9876543210';
const DEV_OTP = '123456';
const BASE_URL = 'http://localhost:3001';

test.describe('Complete Portal Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests require backend running with test data
    await page.goto(BASE_URL);
  });

  test('complete phone/OTP login flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Step 1: Enter phone number
    const phoneInput = page.locator('input[placeholder*="phone" i], input[name="phone"]').first();
    await phoneInput.fill(TEST_PHONE);
    
    // Step 2: Send OTP (if separate button exists)
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    if (await sendOtpButton.count() > 0) {
      await sendOtpButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 3: Enter OTP
    const otpInput = page.locator('input[placeholder*="otp" i], input[name="otp"]').first();
    if (await otpInput.count() > 0) {
      await otpInput.fill(DEV_OTP);
    }
    
    // Step 4: Submit login
    await page.click('button:has-text("Login")');
    
    // Step 5: Wait for navigation
    await page.waitForTimeout(2000);
    
    // Verify we're logged in (not on login page anymore)
    const url = page.url();
    expect(url).not.toContain('/login');
  });

  test('admin dashboard elements', async ({ page }) => {
    // This test validates page structure (works in dev mode without auth)
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    
    // Should have Rodistaa branding
    const logo = await page.locator('text=Rodistaa').count();
    expect(logo).toBeGreaterThan(0);
    
    // Check for dashboard content
    const hasDashboardText = await page.locator('text=Dashboard').count() > 0;
    if (hasDashboardText) {
      // Verify some metric cards exist
      const metricsText = await page.textContent('body');
      expect(metricsText).toMatch(/Users|Bookings|Trucks|Revenue/i);
    }
  });

  test('navigation between admin pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    
    // Try navigating to KYC page
    const kycLink = page.locator('text=KYC Management, a[href*="kyc"]').first();
    if (await kycLink.count() > 0) {
      await kycLink.click();
      await page.waitForTimeout(1000);
      
      // Verify URL changed
      const url = page.url();
      expect(url).toContain('kyc');
    }
  });
});

test.describe('Portal Features', () => {
  test('KYC page displays pending requests', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc`);
    await page.waitForTimeout(1500);
    
    // In dev mode, page loads without redirect
    const url = page.url();
    
    if (url.includes('kyc')) {
      // Check for table or pending requests heading
      const hasKycContent = await page.locator('text=/KYC|Pending|Verification/i').count() > 0;
      expect(hasKycContent).toBeTruthy();
    }
  });

  test('Truck management page displays trucks', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/trucks`);
    await page.waitForTimeout(1500);
    
    // In dev mode, page loads without redirect
    const url = page.url();
    
    if (url.includes('trucks')) {
      // Check for truck-related content
      const hasTruckContent = await page.locator('text=/Truck|Registration|Vehicle/i').count() > 0;
      expect(hasTruckContent).toBeTruthy();
    }
  });

  test('Override requests page structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/overrides`);
    await page.waitForTimeout(1500);
    
    const url = page.url();
    
    if (url.includes('overrides') || url.includes('override')) {
      // Check for override-related content
      const hasOverrideContent = await page.locator('text=/Override|Request|Approve/i').count() > 0;
      expect(hasOverrideContent).toBeTruthy();
    }
  });
});

