import { test, expect } from '@playwright/test';

const routes = [
  { path: '/players', title: 'Players' },
  { path: '/teams', title: 'Teams' },
  { path: '/matches', title: 'Matches' },
  { path: '/scoreboard', title: 'Scoreboard' },
];

test('app loads and shows navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.page-header')).toBeVisible();
  // Desktop viewport: sidebar is visible
  await expect(page.locator('.sidebar')).toBeVisible();
});

for (const { path, title } of routes) {
  test(`${title} route`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page).toHaveScreenshot(`${title.toLowerCase()}.png`);
  });
}
