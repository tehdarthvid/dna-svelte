import { describe, it, expect, vi, afterEach } from 'vitest';
import { tick } from 'svelte';
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

	it('plays YouTube cards through youtube-nocookie.com', async () => {
		const { container } = render(Card, {
			params: { ...base, ytVideoID: 'abc123' }
		});
		await tick();
		const iframe = must(container.querySelector('iframe'));
		expect(iframe.getAttribute('src')).toContain('https://www.youtube-nocookie.com/embed/abc123');
	});

	it('fades a YouTube card in on its still frame, and shows the player once it loads', async () => {
		const { container } = render(Card, {
			params: { title: base.title, ytVideoID: 'abc123' }
		});
		await tick();
		const bg = must(container.querySelector('.card-bg'));
		const still = must(container.querySelector('img.yt-still'));
		expect(still.getAttribute('src')).toBe('https://i.ytimg.com/vi_webp/abc123/hqdefault.webp');
		expect(bg.classList.contains('card-bg__fade-in')).toBe(false);

		await fireEvent.load(still);
		expect(bg.classList.contains('card-bg__fade-in')).toBe(true);

		const iframe = must(container.querySelector('iframe'));
		expect(iframe.classList.contains('yt-pending')).toBe(true);
		await fireEvent.load(iframe);
		expect(iframe.classList.contains('yt-pending')).toBe(false);
	});

	it('keeps the YouTube still frame when data saver is on', async () => {
		vi.stubGlobal('navigator', { ...navigator, connection: { saveData: true } });
		const { container } = render(Card, {
			params: { title: base.title, ytVideoID: 'abc123' }
		});
		await tick();
		expect(container.querySelector('img.yt-still')).toBeTruthy();
		expect(container.querySelector('iframe')).toBeNull();
		vi.unstubAllGlobals();
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

	it('loads an image background only once the card is near the viewport', async () => {
		/** @type {IntersectionObserverCallback[]} */
		const observers = [];
		vi.stubGlobal(
			'IntersectionObserver',
			class {
				/** @param {IntersectionObserverCallback} cb */
				constructor(cb) {
					observers.push(cb);
				}
				observe() {}
				disconnect() {}
			}
		);
		try {
			const { container } = render(Card, { params: base });
			const bg = must(container.querySelector('.card-bg'));
			expect(bg.getAttribute('style')).not.toContain(base.imgURL);

			const entry = /** @type {IntersectionObserverEntry} */ ({ isIntersecting: true });
			must(observers[0])([entry], /** @type {IntersectionObserver} */ ({}));
			await tick();
			expect(bg.getAttribute('style')).toContain(base.imgURL);
		} finally {
			vi.unstubAllGlobals();
		}
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
