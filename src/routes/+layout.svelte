<script>
	// Self-hosted fonts (Fontsource; Ubuntu Font Licence, OFL). The Latin face is preloaded; Noto Sans JP's
	// ~120 unicode-range subsets (31 KiB of CSS) load after hydration so they don't block render.
	import '@fontsource/ubuntu/400.css';
	import ubuntuLatin from '@fontsource/ubuntu/files/ubuntu-latin-400-normal.woff2?url';
	import './styles.css';
	import Analytics from '#lib/analytics/Analytics.svelte';

	let { children } = $props();

	$effect(() => {
		import('@fontsource/noto-sans-jp/400.css');
	});
</script>

<svelte:head>
	<link rel="preload" as="font" type="font/woff2" href={ubuntuLatin} crossorigin="anonymous" />
</svelte:head>

<Analytics />
{@render children()}
