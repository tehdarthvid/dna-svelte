<script>
	import { PUBLIC_GA_TRACKING_ID } from '$app/env/public';

	const gaID = PUBLIC_GA_TRACKING_ID;

	if (gaID && typeof window !== 'undefined') {
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', gaID);
	}
</script>

<svelte:head>
	{#if gaID}
		<script
			async
			src="https://www.googletagmanager.com/gtag/js?id={encodeURIComponent(gaID)}"
		></script>
	{/if}
</svelte:head>
