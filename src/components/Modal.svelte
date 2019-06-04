<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let urlImg;

  console.log("modal " + urlImg);
</script>

<style>
  .lazy-img-wrapper {
    height: 100%;
    width: auto;
    position: relative;
  }
  .modal {
    z-index: 1;

    background-color: rgba(0, 0, 0, 0.61);

    position: fixed;

    height: 100%;
    width: 100%;

    left: 0;
    top: 0;
  }
  img {
    box-shadow: rgba(250, 250, 250, 0.66) 0 30px 60px 0;
    max-height: 90%;
    max-width: 90%;
    object-fit: contain;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

<svelte:window
  on:keydown={e => {
    if (27 === e.keyCode) {
      dispatch('close');
    }
  }} />
<div class="modal" on:click={() => dispatch('close')}>
  <div class="lazy-img-wrapper">

    <img src={urlImg} alt="" />

  </div>
</div>
