<script>
  import Card from "../components/Card.svelte";
  import { activeCard, deck } from "../stores/deckStore.js";

  import Modal from "../components/Modal.svelte";
</script>

<div>
  {#if null === $deck}
    <p>deck loading...</p>
  {:else}
    <div class="container">
      {#each $deck as card}
        <Card params={{ ...card }} />
      {/each}
    </div>
  {/if}
  {#if $activeCard}
    <Modal onclose={() => activeCard.set(null)} urlImg={$activeCard.imgURL} />
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
