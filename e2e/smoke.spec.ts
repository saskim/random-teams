import { test, expect } from '@playwright/test';

const routes = [
  { path: '/players', title: 'Players' },
  { path: '/teams', title: 'Teams' },
  { path: '/matches', title: 'Matches' },
  { path: '/scoreboard', title: 'Scoreboard' },
];

test('app loads and nav drawer opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('mat-toolbar')).toBeVisible();
  await page.click('button[aria-label="Open menu"]');
  await expect(page.locator('mat-drawer')).toBeVisible();
});

for (const { path, title } of routes) {
  test(`${title} route`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page).toHaveScreenshot(`${title.toLowerCase()}.png`);
  });
}
