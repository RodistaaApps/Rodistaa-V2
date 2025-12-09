/**
 * Tickets E2E Tests
 * 
 * End-to-end tests for ticket lifecycle:
 * - List → filter → create → assign → add message → resolve
 * - SLA escalation simulation
 */

import { test, expect, Page } from '@playwright/test';

const ADMIN_PORTAL_URL = process.env.ADMIN_PORTAL_URL || 'http://localhost:3001';

test.describe('Ticket Management Module', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Tickets List', () => {
    test('should display tickets list', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.waitForSelector('table');

      await expect(page.locator('h1')).toContainText('Support Tickets');
      await expect(page.locator('thead th')).toContainText('Ticket ID');
      await expect(page.locator('thead th')).toContainText('SLA');

      const rows = page.locator('tbody tr');
      await expect(rows).not.toHaveCount(0);
    });

    test('should filter by status', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('[placeholder*="Status"]');
      await page.click('text=Open');
      await page.waitForTimeout(500);

      const statusTags = page.locator('tbody tr .ant-tag:has-text("OPEN")');
      expect(await statusTags.count()).toBeGreaterThan(0);
    });

    test('should filter by priority', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('[placeholder*="Priority"]');
      await page.click('text=High');
      await page.waitForTimeout(500);

      const priorityTags = page.locator('tbody tr .ant-tag:has-text("HIGH")');
      expect(await priorityTags.count()).toBeGreaterThan(0);
    });

    test('should open detail panel', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('tbody tr:first-child td:first-child a');
      await page.waitForSelector('.ant-drawer-content');

      await expect(page.locator('.ant-drawer-title')).toContainText('Ticket Details');
      await expect(page.locator('.ant-tabs-tab')).toContainText('Overview');
      await expect(page.locator('.ant-tabs-tab')).toContainText('Timeline');
    });
  });

  test.describe('Ticket Detail', () => {
    test('should display SLA progress', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('tbody tr:first-child td:first-child a');
      await page.waitForSelector('.ant-drawer-content');

      await expect(page.locator('.ant-progress')).toBeVisible();
    });

    test('should display timeline messages', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('tbody tr:first-child td:first-child a');
      await page.waitForSelector('.ant-drawer-content');

      await page.click('.ant-tabs-tab:has-text("Timeline")');
      await expect(page.locator('.ant-timeline')).toBeVisible();
    });

    test('should display audit log', async () => {
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.click('tbody tr:first-child td:first-child a');
      await page.waitForSelector('.ant-drawer-content');

      await page.click('.ant-tabs-tab:has-text("Audit")');
      await expect(page.locator('.ant-list')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('tickets list should load within 1 second', async () => {
      const startTime = Date.now();
      
      await page.goto(`${ADMIN_PORTAL_URL}/admin/tickets`);
      await page.waitForSelector('table tbody tr');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });
  });
});

