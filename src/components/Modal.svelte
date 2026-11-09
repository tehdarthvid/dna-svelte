<script>
  let { urlImg, onclose } = $props();
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
  onkeydown={e => {
    if ('Escape' === e.key) {
      onclose?.();
    }
  }} />
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="modal" onclick={() => onclose?.()}>
  <div class="lazy-img-wrapper">

    <img src={urlImg} alt="" />

  </div>
</div>
