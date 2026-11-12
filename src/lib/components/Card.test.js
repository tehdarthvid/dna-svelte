import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { must } from '../test-utils.js';
import Card from './Card.svelte';

const base = {
	title: 'Star Wars',
	date: '25 May 1977',
	imgURL: 'https://x.test/sw.jpg'
};

afterEach(() => vi.useRealTimers());

describe('Card', () => {
	it('shows title and date and labels itself with the title', () => {
		const { getByRole, getByText } = render(Card, { params: base });
		expect(getByRole('img').getAttribute('aria-label')).toBe('Star Wars');
		expect(getByText('Star Wars')).toBeTruthy();
		expect(getByText('25 May 1977')).toBeTruthy();
	});

	it('renders an empty placeholder card without throwing', () => {
		const { getByRole } = render(Card, { params: {} });
		expect(getByRole('img').getAttribute('aria-label')).toBe('');
	});

	it('calls onopen with its params on double click', async () => {
		const onopen = vi.fn();
		const { getByRole } = render(Card, { params: base, onopen });
		await fireEvent.dblClick(getByRole('img'));
		expect(onopen).toHaveBeenCalledExactlyOnceWith(base);
	});

	it('ignores double click without onopen', async () => {
		const { getByRole } = render(Card, { params: base });
		await fireEvent.dblClick(getByRole('img'));
	});

	it('renders a YouTube iframe when ytVideoID is set', () => {
		const { container } = render(Card, {
			params: { ...base, ytVideoID: 'abc123' }
		});
		const iframe = must(container.querySelector('iframe'));
		expect(iframe.getAttribute('src')).toContain('https://www.youtube.com/embed/abc123');
	});

	it('renders a video element when vidURL is set', () => {
		const { container } = render(Card, {
			params: { ...base, vidURL: 'https://x.test/v.mp4' }
		});
		expect(must(container.querySelector('video')).getAttribute('src')).toBe('https://x.test/v.mp4');
	});

	it('uses the image as background for plain image cards', () => {
		const { container } = render(Card, { params: base });
		expect(must(container.querySelector('.card-bg')).getAttribute('style')).toContain(base.imgURL);
	});

	it('tilts on mouse move and resets 1s after mouse leave', async () => {
		vi.useFakeTimers();
		const { getByRole, container } = render(Card, { params: base });
		const wrap = getByRole('img');
		const card = must(container.querySelector('.card'));
		expect(card.getAttribute('style')).toContain('rotateY(0deg)');

		await fireEvent.mouseMove(wrap, { clientX: 100, clientY: 100 });
		expect(card.getAttribute('style')).not.toContain('rotateY(0deg)');

		await fireEvent.mouseLeave(wrap);
		vi.advanceTimersByTime(999);
		await Promise.resolve();
		expect(card.getAttribute('style')).not.toContain('rotateY(0deg)');
		vi.advanceTimersByTime(2);
		await Promise.resolve();
		expect(card.getAttribute('style')).toContain('rotateY(0deg)');
	});
});
