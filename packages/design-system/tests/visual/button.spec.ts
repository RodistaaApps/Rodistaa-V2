/**
 * Visual Regression Tests for RButtonWeb
 */

import { test, expect } from '@playwright/test';

test.describe('RButtonWeb Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=web-atomic-rbuttonweb--primary');
  });

  test('primary button matches snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('rbuttonweb-primary.png');
  });

  test('secondary button matches snapshot', async ({ page }) => {
    await page.goto('/iframe.html?id=web-atomic-rbuttonweb--secondary');
    await expect(page).toHaveScreenshot('rbuttonweb-secondary.png');
  });

  test('disabled button matches snapshot', async ({ page }) => {
    await page.goto('/iframe.html?id=web-atomic-rbuttonweb--states');
    await expect(page).toHaveScreenshot('rbuttonweb-disabled.png');
  });
});

