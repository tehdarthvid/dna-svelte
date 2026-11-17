import { describe, it, expect } from 'vitest';
import deck from './deck.json';
import aliases from './aliases.json';

/**
 * Loose form of a name, so near-duplicates ("Kid Robot" vs "Kidrobot") compare equal.
 * @param {string} s
 */
const loose = (s) =>
	s
		.normalize('NFKC')
		.toLowerCase()
		.replace(/[\s.,'’・-]/g, '');

/** @param {string} s */
const isHttpsUrl = (s) => {
	try {
		return new URL(s).protocol === 'https:';
	} catch {
		return false;
	}
};

describe('deck.json', () => {
	it('is a non-empty array', () => {
		expect(Array.isArray(deck)).toBe(true);
		expect(deck.length).toBeGreaterThan(0);
	});

	it.each(deck.map((c) => [c.title, c]))('%s has valid fields', (_t, card) => {
		expect(card.title).toBeTypeOf('string');
		expect(card.title.trim()).not.toBe('');
		expect(card.date).toBeTypeOf('string');
		expect(card.date.trim()).not.toBe('');
		// a range uses a spaced en dash (CLAUDE.md, Card dates): no hyphens or other dashes
		expect(card.date).not.toMatch(/\d\s*[-\u2010-\u2012\u2014\u2015\u2212\u301c\uff0d]\s*\d/);
		expect(isHttpsUrl(card.imgURL)).toBe(true);
		if (card.thumbURL !== undefined) expect(isHttpsUrl(card.thumbURL)).toBe(true);
		if ('url' in card) expect(isHttpsUrl(/** @type {any} */ (card).url)).toBe(true);
		expect(Array.isArray(card.tags)).toBe(true);
		card.tags.forEach((t) => expect(t).toBeTypeOf('string'));
		if (card.linkedCards !== undefined) {
			expect(Array.isArray(card.linkedCards)).toBe(true);
			card.linkedCards.forEach((t) => expect(t).toBeTypeOf('string'));
		}
	});

	it('has unique titles', () => {
		const titles = deck.map((c) => c.title);
		expect(new Set(titles).size).toBe(titles.length);
	});

	// linkedCards name future cards: each is written as that card's title would be (CLAUDE.md,
	// Linked cards). Other spellings live in aliases.json and must not be used as links.
	describe('linkedCards and aliases.json', () => {
		const links = [...new Set(deck.flatMap((c) => c.linkedCards ?? []))];
		const names = new Set([...links, ...deck.map((c) => c.title)]);
		const aliasMap = /** @type {Record<string, string>} */ (aliases);

		it('has no blank, padded or repeated links on a card', () => {
			for (const card of deck) {
				const l = card.linkedCards ?? [];
				l.forEach((t) => expect(t, card.title).toBe(t.trim()));
				l.forEach((t) => expect(t, card.title).not.toBe(''));
				expect(new Set(l).size, card.title).toBe(l.length);
			}
		});

		it('uses the canonical name, not an alias', () => {
			for (const t of links)
				expect(aliasMap[t], `"${t}" is an alias of "${aliasMap[t]}"`).toBeUndefined();
		});

		it('maps every alias to a linked name or card title', () => {
			for (const [a, t] of Object.entries(aliasMap)) {
				expect(names.has(t), `alias "${a}" -> unknown "${t}"`).toBe(true);
				expect(names.has(a), `alias "${a}" is also used as a name`).toBe(false);
			}
		});

		it('has no near-duplicate names for different entities', () => {
			/** @type {Map<string, string>} */
			const seen = new Map();
			const all = [...[...names].map((n) => [n, n]), ...Object.entries(aliasMap)];
			for (const [name, entity] of all) {
				const k = loose(name);
				const prev = seen.get(k);
				if (prev !== undefined) expect(prev, `"${name}" looks like "${prev}"`).toBe(entity);
				else seen.set(k, entity);
			}
		});
	});
});
