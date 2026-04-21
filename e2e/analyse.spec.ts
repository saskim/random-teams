import { test } from '@playwright/test';
import Anthropic from '@anthropic-ai/sdk';

const routes = [
  { path: '/players', name: 'Players' },
  { path: '/teams', name: 'Teams' },
  { path: '/matches', name: 'Matches' },
  { path: '/scoreboard', name: 'Scoreboard' },
];

test('Claude visual analysis', async ({ page }) => {
  test.skip(!process.env['ANTHROPIC_API_KEY'], 'ANTHROPIC_API_KEY not set — skipping analysis');

  const screenshots: { name: string; data: string }[] = [];
  for (const { path, name } of routes) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const buffer = await page.screenshot();
    screenshots.push({ name, data: buffer.toString('base64') });
  }

  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: 'You are a UI reviewer for a team randomizer Angular app called RandomTeams. It has 4 views: Players, Teams, Matches, and Scoreboard. When given screenshots, briefly describe each screen and flag any obvious UI issues such as broken layouts, missing content, overlapping elements, or visual regressions.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Review these screenshots and flag any issues:' },
          ...screenshots.flatMap(({ name, data }) => [
            { type: 'text' as const, text: `\n## ${name}` },
            {
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: 'image/png' as const, data },
            },
          ]),
        ],
      },
    ],
  });

  const analysis = response.content[0].type === 'text' ? response.content[0].text : '';
  console.log('\n── Claude Visual Analysis ──\n' + analysis);
});
