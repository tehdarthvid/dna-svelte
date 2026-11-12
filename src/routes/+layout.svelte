<script>
	import './styles.css';
	import Analytics from '#lib/analytics/Analytics.svelte';

	let { children } = $props();
</script>

<Analytics />
{@render children()}
