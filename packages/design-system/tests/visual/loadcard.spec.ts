/**
 * Visual Regression Tests for LoadCardWeb
 */

import { test, expect } from '@playwright/test';

test.describe('LoadCardWeb Visual Tests', () => {
  test('open for bidding card matches snapshot', async ({ page }) => {
    await page.goto('/iframe.html?id=web-molecule-loadcardweb--open-for-bidding');
    await expect(page).toHaveScreenshot('loadcardweb-open.png');
  });

  test('confirmed card matches snapshot', async ({ page }) => {
    await page.goto('/iframe.html?id=web-molecule-loadcardweb--confirmed');
    await expect(page).toHaveScreenshot('loadcardweb-confirmed.png');
  });

  test('grid view matches snapshot', async ({ page }) => {
    await page.goto('/iframe.html?id=web-molecule-loadcardweb--grid-view');
    await expect(page).toHaveScreenshot('loadcardweb-grid.png');
  });
});

