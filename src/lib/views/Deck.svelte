<script>
	import Card from '#lib/components/Card.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import deck from '#lib/data/deck.json';

	/** @type {{ imgURL?: string } | null} */
	let activeCard = $state(null);

	/**
	 * A card with a `url` opens that page in a new tab; the rest open their full image in the modal.
	 * @param {{ url?: string, imgURL?: string }} card
	 */
	function open(card) {
		if (card.url) window.open(card.url, '_blank', 'noopener,noreferrer');
		else activeCard = card;
	}
</script>

<div class="container">
	{#each deck as card (card.title)}
		<!-- cards show the small thumbnail; the modal opens the full-size imgURL -->
		<Card params={{ ...card, imgURL: card.thumbURL ?? card.imgURL }} onopen={() => open(card)} />
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
