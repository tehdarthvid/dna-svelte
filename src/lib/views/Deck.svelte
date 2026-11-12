<script>
	import Card from '#lib/components/Card.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import deck from '#lib/data/deck.json';

	/** @type {{ imgURL?: string } | null} */
	let activeCard = $state(null);
</script>

<div class="container">
	{#each deck as card (card.title)}
		<Card params={card} onopen={() => (activeCard = card)} />
	{/each}
</div>
{#if activeCard}
	<Modal urlImg={activeCard.imgURL} onclose={() => (activeCard = null)} />
{/if}

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
