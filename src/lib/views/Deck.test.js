import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { must } from '../test-utils.js';
import Deck from './Deck.svelte';
import deckData from '../data/deck.json';

describe('Deck', () => {
	it('renders one card per deck entry', () => {
		const { getAllByRole } = render(Deck);
		expect(getAllByRole('img')).toHaveLength(deckData.length);
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
});
