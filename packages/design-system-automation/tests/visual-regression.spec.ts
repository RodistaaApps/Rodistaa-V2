import { test, expect } from '@playwright/test';

test.describe('Rodistaa visual regression - core components', () => {

  test.beforeEach(async ({ page }) => {
    // baseURL from config: Storybook at http://localhost:6006 by default
    // We'll navigate to specific Storybook iframe URLs for the component stories.
  });

  test('Primary Button - visual', async ({ page, baseURL }) => {
    // Storybook story path for Primary Button. Adjust to your story id.
    // Example Storybook iframe URL pattern:
    // http://localhost:6006/iframe.html?id=components-button--primary
    const storyUrl = `${baseURL}/iframe.html?id=components-button--primary`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');

    // Small stabilization wait in case fonts load
    await page.waitForTimeout(300);

    // Optionally hide dynamic elements
    // await page.locator('.some-dynamic-selector').evaluate(el => el.style.visibility = 'hidden');

    // Capture screenshot and compare with baseline
    await expect(page.locator('body')).toHaveScreenshot('button-primary.png', { animations: 'disabled' });
  });

  test('Secondary Button - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-button--secondary`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('button-secondary.png', { animations: 'disabled' });
  });

  test('Danger Button - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-button--danger`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('button-danger.png', { animations: 'disabled' });
  });

  test('Card Component - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-card--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('card-default.png', { animations: 'disabled' });
  });

  test('Modal Small - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-modal--small`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('modal-small.png', { animations: 'disabled' });
  });

  test('Modal Medium - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-modal--medium`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('modal-medium.png', { animations: 'disabled' });
  });

  test('Status Tag - Pending', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-statustag--pending`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('status-pending.png', { animations: 'disabled' });
  });

  test('Status Tag - Confirmed', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-statustag--confirmed`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('status-confirmed.png', { animations: 'disabled' });
  });

  test('KPI Metric Card - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-metriccard--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    // If the metric includes dynamic numbers, replace or mask them using JS
    // Example: await page.evaluate(() => { document.querySelectorAll('.metric-value').forEach(e => e.textContent='000'); });

    await expect(page.locator('body')).toHaveScreenshot('metric-card.png', { animations: 'disabled' });
  });

  test('Side Navigation - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-sidenav--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('sidenav.png', { animations: 'disabled' });
  });

  test('App Header - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-appheader--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('appheader.png', { animations: 'disabled' });
  });

  test('Search Bar - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-searchbar--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('searchbar.png', { animations: 'disabled' });
  });

  test('Table - visual', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-table--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('body')).toHaveScreenshot('table.png', { animations: 'disabled' });
  });

});

test.describe('Token Compliance Verification', () => {

  test('Verify Primary Color (#C90D0D)', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-button--primary`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');

    const button = await page.locator('button').first();
    const bgColor = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // rgb(201, 13, 13) is #C90D0D
    expect(bgColor).toBe('rgb(201, 13, 13)');
  });

  test('Verify Button Border Radius (8px)', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-button--primary`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');

    const button = await page.locator('button').first();
    const borderRadius = await button.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });

    // Should use 8px (RodistaaSpacing.borderRadius.lg)
    expect(borderRadius).toBe('8px');
  });

  test('Verify Card Padding (24px)', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-card--default`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');

    const card = await page.locator('[class*="card"]').first();
    if (await card.count() > 0) {
      const padding = await card.evaluate((el) => {
        return window.getComputedStyle(el).padding;
      });

      // Should use 24px padding (RodistaaSpacing.lg)
      expect(padding).toContain('24px');
    }
  });

  test('Verify Font Family (Baloo Bhai for headings)', async ({ page, baseURL }) => {
    const storyUrl = `${baseURL}/iframe.html?id=components-card--with-title`;
    await page.goto(storyUrl);
    await page.waitForLoadState('networkidle');

    const heading = await page.locator('h3').first();
    if (await heading.count() > 0) {
      const fontFamily = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      // Should include "Baloo Bhai"
      expect(fontFamily).toContain('Baloo Bhai');
    }
  });

});
