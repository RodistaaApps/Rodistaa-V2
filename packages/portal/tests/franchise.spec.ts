/**
 * Playwright Tests for Franchise Portal
 */

import { test, expect } from '@playwright/test';

test.describe('Franchise Portal', () => {
  test('franchise dashboard loads', async ({ page }) => {
    await page.goto('http://localhost:3001/franchise/dashboard');
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login/);
  });

  test('franchise targets page accessible', async ({ page }) => {
    await page.goto('http://localhost:3001/franchise/targets');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Portal Navigation', () => {
  test('admin navigation works', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/dashboard');
    
    // Protected route redirects to login
    await expect(page).toHaveURL(/.*login/);
  });
});

