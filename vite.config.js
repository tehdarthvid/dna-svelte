import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));
// the Svelte version actually bundled (not the latest on npm)
const { version: svelteVersion } = createRequire(import.meta.url)('svelte/package.json');

export default {
	build: {
		// keep font files as files: the CSP has no font-src data:, so inlined subsets would be blocked
		assetsInlineLimit: (/** @type {string} */ file) => (/\.woff2?$/.test(file) ? false : undefined)
	},
	plugins: [
		sveltekit({
			adapter: adapter(),
			// The CSP. The page is prerendered, so SvelteKit writes it as a <meta http-equiv> tag (it
			// applies in local dev too). 'hash' mode adds the SHA-256 of SvelteKit's inline startup
			// script to script-src, so no 'unsafe-inline' is needed for scripts (an injected inline
			// script is blocked). frame-ancestors can't go in a meta tag: it's a header in firebase.json.
			// style-src keeps 'unsafe-inline' for the style="" attributes Svelte renders (card
			// parallax). Keep dev-only hosts out: 'self' covers Vite's dev server and HMR socket.
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self', 'www.youtube-nocookie.com'],
					'script-src': [
						'self',
						'www.googletagmanager.com',
						'www.google-analytics.com',
						// Svelte's server render adds onload="this.__e=event" to <img>/<video> with an
						// onload handler (Card's YouTube still frame), so a load before hydration is
						// replayed. 'unsafe-hashes' allows only inline handlers with exactly that text.
						'unsafe-hashes',
						'sha256-7dQwUgLau1NFCCGjfn9FsYptB6ZtWxJin6VohGIu20I='
					],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': [
						'self',
						'https://sk2q169cx9pfoawet3et.s3-ap-northeast-1.amazonaws.com',
						'https://*.google-analytics.com',
						'https://*.googletagmanager.com'
					],
					'connect-src': [
						'self',
						'https://*.google-analytics.com',
						'https://*.analytics.google.com',
						'https://*.googletagmanager.com'
					],
					'media-src': ['self', 'https://sk2q169cx9pfoawet3et.s3-ap-northeast-1.amazonaws.com'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']
				}
			}
		})
	],
	define: {
		__PKG_VERSION__: JSON.stringify(version),
		__SVELTE_VERSION__: JSON.stringify(svelteVersion)
	}
};
