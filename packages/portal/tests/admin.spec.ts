/**
 * Playwright Tests for Admin Portal
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    
    await expect(page.locator('text=Rodistaa')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  // Note: Full E2E tests require backend running
  // These are basic structural tests
});

