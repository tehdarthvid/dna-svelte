<script>
  import Card from "../components/Card.svelte";
  import { deck } from "../stores/deckStore.js";

  import Modal from "../components/Modal.svelte";
  let showModal = false;
  let urlModal = "";

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
        <Card on:modal={handleModal} {...card} />
      {/each}
    </div>
  {/if}
  {#if urlModal}
    <Modal on:close={() => (urlModal = '')} urlImg={urlModal} />
  {/if}

</div>
