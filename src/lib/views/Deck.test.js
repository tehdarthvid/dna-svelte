import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { must } from '../test-utils.js';
import Deck from './Deck.svelte';
import deckData from '../data/deck.json';

describe('Deck', () => {
	it('renders one card per deck entry', () => {
		const { getAllByRole } = render(Deck);
		expect(getAllByRole('img')).toHaveLength(deckData.length);
	});

	it('shows the thumbnail on the card', () => {
		const { container } = render(Deck);
		const bg = must(container.querySelectorAll('.card-bg')[1]);
		expect(bg.getAttribute('style')).toContain(deckData[1].thumbURL ?? deckData[1].imgURL);
	});

	it('shows no modal until a card is opened', () => {
		const { container } = render(Deck);
		expect(container.querySelector('dialog')).toBeNull();
	});

	it("opens the clicked card's image and removes the modal on close", async () => {
		const { getAllByRole, container } = render(Deck);
		await fireEvent.dblClick(getAllByRole('img')[1]);
		const dialog = must(container.querySelector('dialog'));
		expect(must(dialog.querySelector('img')).getAttribute('src')).toBe(deckData[1].imgURL);

		await fireEvent.click(dialog);
		expect(container.querySelector('dialog')).toBeNull();
	});

	it('opens a card with a url in a new tab instead of the modal', async () => {
		const i = deckData.findIndex((c) => 'url' in c && c.url);
		if (i < 0) return; // no card uses url today
		const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
		const { getAllByRole, container } = render(Deck);
		await fireEvent.dblClick(getAllByRole('img')[i]);
		expect(spy).toHaveBeenCalledWith(
			/** @type {any} */ (deckData[i]).url,
			'_blank',
			'noopener,noreferrer'
		);
		expect(container.querySelector('dialog')).toBeNull();
		spy.mockRestore();
	});
});
