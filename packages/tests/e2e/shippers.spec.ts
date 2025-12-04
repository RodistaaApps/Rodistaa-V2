/**
 * Shippers Feature E2E Tests (Playwright)
 * Tests complete shipper management workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Shippers Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3001/login');
    await page.fill('input[placeholder*="phone"]', '+919999999999');
    await page.click('button:has-text("Send OTP")');
    await page.fill('input[placeholder*="OTP"]', '123456');
    await page.click('button:has-text("Login")');
    
    // Navigate to Users page
    await page.goto('http://localhost:3001/admin/users?role=shipper');
    await page.waitForLoadState('networkidle');
  });

  test('should load shippers list and display data', async ({ page }) => {
    // Verify table headers
    await expect(page.locator('text=User ID / Role')).toBeVisible();
    await expect(page.locator('text=Name & Mobile')).toBeVisible();
    await expect(page.locator('text=Ledger Balance')).toBeVisible();
    
    // Verify at least one shipper is displayed
    await expect(page.locator('text=/USR-\\d+/')).toBeVisible();
  });

  test('should apply search filter', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Rohit');
    await page.waitForTimeout(500);
    
    // Verify filtered results
    await expect(page.locator('text=Rohit Sharma')).toBeVisible();
  });

  test('should apply franchise filter', async ({ page }) => {
    // Open franchise dropdown
    await page.click('div[class*="ant-select"]:has-text("Franchise")');
    
    // Select a franchise
    await page.click('text=Vijayawada');
    await page.waitForTimeout(500);
    
    // Verify results are filtered
    await expect(page.locator('text=/Vijayawada/')).toBeVisible();
  });

  test('should open shipper detail panel', async ({ page }) => {
    // Click view button on first shipper
    await page.click('button[aria-label*="eye"]:first-of-type');
    
    // Verify panel opens
    await expect(page.locator('.ant-drawer')).toBeVisible();
    
    // Verify header shows shipper info
    await expect(page.locator('text=/USR-\\d+/')).toBeVisible();
    await expect(page.locator('text=Shipper')).toBeVisible();
  });

  test('should display all tabs in detail panel', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Verify all 9 tabs are present
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Bookings')).toBeVisible();
    await expect(page.locator('text=Shipments')).toBeVisible();
    await expect(page.locator('text=Ledger')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();
    await expect(page.locator('text=Activity')).toBeVisible();
    await expect(page.locator('text=/ACS.*Risk/')).toBeVisible();
    await expect(page.locator('text=Admin Actions')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Click Bookings tab
    await page.click('text=Bookings');
    await expect(page.locator('text=Booking ID')).toBeVisible();
    
    // Click Ledger tab
    await page.click('text=Ledger');
    await expect(page.locator('text=Current Balance')).toBeVisible();
  });

  test('should display trust score in Overview tab', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Verify trust score is displayed
    await expect(page.locator('text=Trust Score')).toBeVisible();
    await expect(page.locator('text=/\\d{1,3}/')).toBeVisible(); // The score number
  });

  test('should show document permission request for sensitive docs', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Go to Documents tab
    await page.click('text=Documents');
    await page.waitForTimeout(500);
    
    // Try to view a sensitive document
    const requestViewButton = page.locator('button:has-text("Request View")').first();
    if (await requestViewButton.isVisible()) {
      await requestViewButton.click();
      
      // Verify modal opens
      await expect(page.locator('text=Request Document Access')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    }
  });

  test('should open ledger adjustment modal', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Go to Ledger tab
    await page.click('text=Ledger');
    await page.waitForTimeout(500);
    
    // Click Manual Adjustment button
    await page.click('button:has-text("Manual Adjustment")');
    
    // Verify modal opens
    await expect(page.locator('text=Manual Ledger Adjustment')).toBeVisible();
    await expect(page.locator('text=/Audit Trail/')).toBeVisible();
  });

  test('should display ACS flags if present', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Go to ACS tab
    await page.click('text=/ACS.*Risk/');
    await page.waitForTimeout(500);
    
    // Check for flags or empty state
    const hasFlags = await page.locator('text=/Active ACS Flag/').isVisible();
    const noFlags = await page.locator('text=No Active ACS Flags').isVisible();
    
    expect(hasFlags || noFlags).toBe(true);
  });

  test('should close panel when close button clicked', async ({ page }) => {
    await page.click('button[aria-label*="eye"]:first-of-type');
    await page.waitForSelector('.ant-drawer');
    
    // Click close button
    await page.click('button[aria-label="Close"]');
    
    // Verify panel is closed
    await expect(page.locator('.ant-drawer')).not.toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Verify pagination controls are present
    await expect(page.locator('.ant-pagination')).toBeVisible();
    await expect(page.locator('text=/Total.*shippers/')).toBeVisible();
  });
});

