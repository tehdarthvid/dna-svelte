declare global {
	const __PKG_VERSION__: string;
	const __SVELTE_VERSION__: string;

	interface Window {
		dataLayer: unknown[];
	}
}

export {};
