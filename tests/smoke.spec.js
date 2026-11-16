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

test('fonts are self-hosted and allowed by the CSP', async ({ page }) => {
	// card images aren't what this checks; keep it offline
	await page.route(/amazonaws\.com/, (route) => route.abort());
	/** @type {string[]} */
	const fontHosts = [];
	/** @type {string[]} */
	const cspErrors = [];
	page.on('request', (r) => {
		if (r.resourceType() === 'font' || /fonts\.(googleapis|gstatic)\.com/.test(r.url())) {
			fontHosts.push(new URL(r.url()).host);
		}
	});
	page.on('console', (m) => {
		if (/Content Security Policy/.test(m.text())) cspErrors.push(m.text());
	});
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	await expect
		.poll(() => page.evaluate(() => document.fonts.check('16px "Noto Sans JP"', '超電磁')))
		.toBe(true);
	expect(fontHosts.length).toBeGreaterThan(0);
	expect(new Set(fontHosts)).toEqual(new Set([new URL(page.url()).host]));
	expect(cspErrors).toEqual([]);
});

test('CSP allows no inline scripts except SvelteKit-hashed ones, with no violations', async ({
	page
}) => {
	// card images: serve a 1x1 PNG so they load (the bucket's Referer rule blocks localhost)
	const png = Buffer.from(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
		'base64'
	);
	await page.route(/amazonaws\.com/, (route) =>
		route.fulfill({ contentType: 'image/png', body: png })
	);
	await page.addInitScript(() => {
		/** @type {string[]} */
		const v = [];
		// @ts-ignore
		window.__cspViolations = v;
		document.addEventListener('securitypolicyviolation', (e) =>
			v.push(`${e.violatedDirective} ${e.blockedURI}`)
		);
	});
	await page.goto('/');
	const csp = await page
		.locator('meta[http-equiv="content-security-policy" i]')
		.getAttribute('content');
	const scriptSrc = csp?.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
	expect(scriptSrc).toContain("'sha256-");
	expect(scriptSrc).not.toContain("'unsafe-inline'");
	// SvelteKit's own (hashed) inline startup script ran: it sets a __sveltekit_* global ...
	await page.waitForFunction(() => Object.keys(window).some((k) => k.startsWith('__sveltekit_')));
	// @ts-ignore
	expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
	// ... but an injected inline script is blocked
	const ran = await page.evaluate(() => {
		const s = document.createElement('script');
		s.textContent = 'window.__injected = true';
		document.head.append(s);
		// @ts-ignore
		return window.__injected === true;
	});
	expect(ran).toBe(false);
});
