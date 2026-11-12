import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const deck = JSON.parse(
	readFileSync(new URL('../src/lib/data/deck.json', import.meta.url), 'utf-8')
);

test('prerendered page has title, header, footer and every card', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('darthvid DNA');
	await expect(page.locator('h1').first()).toContainText('influences DNA');
	await expect(page.getByText(/svelte v\d+\.\d+\.\d+/)).toBeVisible();
	await expect(page.locator('.card-wrap')).toHaveCount(deck.length);
});

test('double-clicking a card opens its image in a modal; Esc and click close it', async ({
	page
}) => {
	await page.goto('/');
	const card = page.getByRole('img', { name: deck[0].title, exact: true });
	const dialog = page.locator('dialog');

	// retry until hydration has attached the handler
	await expect(async () => {
		await card.dblclick();
		await expect(dialog).toBeVisible({ timeout: 500 });
	}).toPass();
	await expect(dialog.locator('img')).toHaveAttribute('src', deck[0].imgURL);

	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);

	await card.dblclick();
	await expect(dialog).toBeVisible();
	await dialog.click();
	await expect(dialog).toHaveCount(0);
});
