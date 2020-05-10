<script>
  import { log } from "../utils/logger.js";

  import Card from "../components/Card.svelte";
  import { activeCard, deck } from "../stores/deckStore.js";

  import Modal from "../components/Modal.svelte";
  let showModal = false;
  let urlModal = "";

  let currCard = null;

  const unsubscribe = activeCard.subscribe(value => {
    currCard = value;
  });

  function handleModal(event) {
    //console.log(event.detail.url);
    urlModal = event.detail.url;
  }
</script>

<style scoped>
  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>

<div>
  {#if null === $deck}
    <p>deck loading...</p>
  {:else}
    <div class="container">
      {#each $deck as card}
        <Card on:modal={handleModal} params={{ ...card }} />
      {/each}
    </div>
  {/if}
  {#if currCard}
    <Modal on:close={() => (currCard = null)} urlImg={currCard.imgURL} />
  {/if}

</div>
