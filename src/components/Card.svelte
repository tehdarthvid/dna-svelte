<script>
  import { log } from "../utils/logger.js";
  import { activeCard, deck } from "../stores/deckStore.js";

  import { onDestroy, afterUpdate } from "svelte";

  export let params;

  let mX = 0;
  let mY = 0;
  $: rX = mX * 30;
  $: rY = mY * -30;
  $: tX = mX * -40;
  $: tY = mY * -40;

  let isBgImageLoaded = false;
  let img = null;
  let mouseLeaveDelay = null;

  /*
   * Svelte lifecycle handlers
   */

  afterUpdate(() => {
    if (!params.vidURL && !isBgImageLoaded && params.imgURL) {
      img = new Image();
      img.onload = handleImageLoaded;
      img.src = params.imgURL;
    }
    //console.log("afterUpdate: " + params.title);
  });
  onDestroy(() => {
    //console.log("the component is being destroyed");
    clearTimeout(mouseLeaveDelay);
  });

  /*
   * event handlers
   */

  // The behaviour changes if this is not an anonymous function.
  const handleImageLoaded = () => {
    // console.log(params.title);
    isBgImageLoaded = true;
  };
  function handleMouseMove(e) {
    mX = (e.pageX - this.offsetLeft - this.clientWidth / 2) / this.clientWidth;
    mY = (e.pageY - this.offsetTop - this.clientHeight / 2) / this.clientHeight;
    //console.log(title + " " + mX);
  }
  function handleMouseEnter(e) {
    clearTimeout(mouseLeaveDelay);
  }
  function handleMouseLeave(e) {
    mouseLeaveDelay = setTimeout(() => {
      rX = rY = tX = tY = 0;
    }, 1000);
  }
  function handleDblClick(e) {
    console.log(params.title + " dblclick");
    let ac = {
      title: params.title,
      imgURL: params.imgURL,
      date: params.date
    };
    activeCard.set(ac);
    // window.open(params.url, "_blank");
  }
</script>

<style scoped>
  p {
    font-size: 16px;
  }
  h1 + p,
  p + p {
    margin-top: 10px;
  }
  * {
    -webkit-margin-before: 0px;
    -webkit-margin-after: 0px;
  }
  .card-wrap {
    width: 240px;
    height: 320px;
    margin: 10px;
    transform: perspective(800px);
    transform-style: preserve-3d;
    cursor: pointer;
  }
  .card-wrap:hover .card-info {
    transform: translateY(0);
  }
  .card-wrap:hover .card-info p,
  .card-wrap:hover .card-info h1 {
    opacity: 1;
  }
  .card-wrap:hover .card-info,
  .card-wrap:hover .card-info h1,
  .card-wrap:hover .card-info p {
    transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .card-wrap:hover .card-info:after {
    transition: 5s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 1;
    transform: translateY(0);
  }
  .card-wrap:hover .card-bg {
    transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1),
      opacity 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    opacity: 0.9;
  }
  .card-wrap:hover .card {
    transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 2s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: rgba(255, 255, 255, 0.2) 0 0 40px 5px,
      rgba(255, 255, 255, 1) 0 0 0 1px, rgba(0, 0, 0, 0.66) 0 30px 60px 0,
      inset #333 0 0 0 5px, inset white 0 0 0 6px;
  }
  .card {
    position: relative;
    text-align: center;
    flex: 0 0 240px;
    width: 100%;
    height: 100%;
    background-color: #333;
    overflow: hidden;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.66) 0 30px 60px 0, inset #333 0 0 0 5px,
      inset rgba(255, 255, 255, 0.5) 0 0 0 6px;
    transition: 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }
  .card-bg {
    opacity: 0;
    position: absolute;
    top: -20px;
    left: -20px;
    width: 100%;
    height: 100%;
    padding: 20px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    transition: 1s cubic-bezier(0.445, 0.05, 0.55, 0.95),
      opacity 2s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    pointer-events: none;
  }
  .card-bg__fade-in {
    opacity: 0.4;
  }
  .card-info {
    word-break: keep-all;
    padding-top: 20px;
    padding-bottom: 20px;
    position: absolute;
    bottom: 0;
    color: #fff;
    transform: translateY(40px);
    transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
    width: 100%;
  }
  .card-info h1 {
    font-size: 24px;
    font-weight: 700;
    text-shadow: rgba(0, 0, 0, 0.5) 0 10px 10px;
    opacity: 0.4;
    transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .card-info p {
    opacity: 0;
    text-shadow: rgba(0, 0, 0, 1) 0 2px 3px;
    transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  .card-info * {
    position: relative;
    z-index: 1;
  }
  .card-info:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
    background-blend-mode: overlay;
    opacity: 0;
    transform: translateY(100%);
    transition: 5s 1s cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }

  /* 
   * Center the video inside the card like the image verison. 
   * Otherwise, everything else rely on `card-bg`.
   */
  .center_video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

<div
  class="card-wrap"
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:dblclick={handleDblClick}>

  <div class="card" style="transform: rotateY({rX}deg) rotateX({rY}deg)">
    {#if null != params.ytVideoID}
      <div
        class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg card-bg__fade-in'}
        style="transform: translateX({tX}px) translateY({tY}px); ">
        <iframe
          title={params.title ? params.title : ''}
          class="center_video"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/{params.ytVideoID}?rel=0&amp;controls=0&amp;autoplay=1&amp;mute=1&amp;loop=1&amp;playlist={params.ytVideoID}"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope;
          picture-in-picture"
          loop="1"
          allowfullscreen
          onStateChange={handleImageLoaded} />
      </div>
    {:else if null != params.vidURL}
      <div
        class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg'}
        style="transform: translateX({tX}px) translateY({tY}px); ">
        <video
          class="center_video"
          src={params.vidURL}
          autoplay="true"
          loop="true"
          muted="true"
          on:playing={handleImageLoaded} />
      </div>
    {:else if null != params.imgURL}
      <div
        class={isBgImageLoaded ? 'card-bg card-bg__fade-in' : 'card-bg'}
        style="transform: translateX({tX}px) translateY({tY}px);
        background-image: url({params.imgURL})" />
    {/if}

    <div class="card-info">
      <h1>{params.title ? params.title : ''}</h1>
      <p>{params.date ? params.date : ''}</p>
    </div>

  </div>
</div>
