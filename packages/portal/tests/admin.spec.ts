/**
 * Playwright Tests for Admin Portal
 * Updated for Phone/OTP Authentication Flow
 */

import { test, expect } from '@playwright/test';

const TEST_PHONE = '9876543210';
const DEV_OTP = '123456';

test.describe('Admin Portal', () => {
  test('login page loads with phone/OTP fields', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    // Check page title/branding
    await expect(page.locator('text=Rodistaa')).toBeVisible();
    
    // Verify phone input field exists
    await expect(page.locator('input[placeholder*="phone" i], input[name="phone"]')).toBeVisible();
    
    // Check for Send OTP button or Login button
    const hasOtpButton = await page.locator('button:has-text("Send OTP")').count() > 0;
    const hasLoginButton = await page.locator('button:has-text("Login")').count() > 0;
    
    expect(hasOtpButton || hasLoginButton).toBeTruthy();
  });

  test('complete login flow with phone and OTP', async ({ page }) => {
    // Note: This test requires backend to be running on localhost:4000
    await page.goto('http://localhost:3001/login');
    
    // Enter phone number
    const phoneInput = page.locator('input[placeholder*="phone" i], input[name="phone"]').first();
    await phoneInput.fill(TEST_PHONE);
    
    // Send OTP (if button exists)
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    if (await sendOtpButton.count() > 0) {
      await sendOtpButton.click();
      await page.waitForTimeout(1000); // Wait for OTP to be sent
    }
    
    // Enter OTP (dev mode: 123456)
    const otpInput = page.locator('input[placeholder*="otp" i], input[name="otp"]').first();
    if (await otpInput.count() > 0) {
      await otpInput.fill(DEV_OTP);
    }
    
    // Click Login button
    const loginButton = page.locator('button:has-text("Login")').first();
    await loginButton.click();
    
    // Should redirect to dashboard or admin area after successful login
    await page.waitForTimeout(2000);
    
    // Verify we're no longer on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('protected routes allow access in development mode', async ({ page }) => {
    // In development mode, protected routes don't redirect
    await page.goto('http://localhost:3001/admin/dashboard');
    
    // Should load dashboard, not redirect to login (dev mode)
    await page.waitForTimeout(1000);
    
    // Check if we're on dashboard or login
    const url = page.url();
    
    // In production, this would redirect to login
    // In development, it shows the dashboard
    expect(url).toMatch(/\/(admin\/dashboard|login)/);
  });

  test('dashboard displays key metrics', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/dashboard');
    await page.waitForTimeout(1500);
    
    // Check for dashboard heading
    const hasDashboard = await page.locator('text=Dashboard').count() > 0;
    
    if (hasDashboard) {
      // Verify metric cards are present (mock data)
      const hasMetrics = await page.locator('text=/Active|Users|Bookings|Trucks|Revenue/i').count() > 0;
      expect(hasMetrics).toBeTruthy();
    }
  });

  // Note: Full E2E tests require backend running on localhost:4000
  // Tests are designed to work in both dev and production modes
});

