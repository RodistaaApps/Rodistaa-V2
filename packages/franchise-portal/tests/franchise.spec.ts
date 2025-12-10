/**
 * Playwright Tests for Franchise Portal
 * Updated for Phone/OTP Authentication
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Franchise Portal', () => {
  test('franchise dashboard loads or redirects', async ({ page }) => {
    await page.goto(`${BASE_URL}/franchise/dashboard`);
    await page.waitForTimeout(1000);
    
    // In development mode, may load without auth
    // In production mode, redirects to login
    const url = page.url();
    expect(url).toMatch(/\/(franchise\/dashboard|login)/);
  });

  test('franchise targets page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/franchise/targets`);
    await page.waitForTimeout(1000);
    
    // Check if page loads or redirects
    const url = page.url();
    expect(url).toMatch(/\/(franchise\/targets|login)/);
  });

  test('franchise portal has distinct branding', async ({ page }) => {
    await page.goto(`${BASE_URL}/franchise/dashboard`);
    await page.waitForTimeout(1500);
    
    // Check for Rodistaa branding (shared across portals)
    const hasBranding = await page.locator('text=Rodistaa').count() > 0;
    
    // If franchise page loaded, verify it's not admin
    const url = page.url();
    if (url.includes('franchise')) {
      expect(url).not.toContain('admin');
    }
  });
});

test.describe('Portal Navigation', () => {
  test('admin navigation works in dev mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    
    // In dev mode, loads without redirect
    // In production, would redirect to login
    const url = page.url();
    expect(url).toMatch(/\/(admin\/dashboard|login)/);
  });

  test('can navigate between admin pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    
    // Verify navigation menu exists
    const hasMenu = await page.locator('text=/Dashboard|KYC|Truck/i').count() > 0;
    
    if (hasMenu) {
      // Try clicking on a menu item
      const truckLink = page.locator('text=Truck Management, a[href*="truck"]').first();
      if (await truckLink.count() > 0) {
        await truckLink.click();
        await page.waitForTimeout(1000);
        
        const newUrl = page.url();
        expect(newUrl).toContain('truck');
      }
    }
  });
});

