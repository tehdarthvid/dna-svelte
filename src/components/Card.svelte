<script>
  //import { onMount } from "svelte";
  import { onDestroy } from "svelte";

  export let title;
  export let bgImageURL;
  export let date;

  let rX = 0;
  let rY = 0;
  let tX = 0;
  let tY = 0;

  let mouseLeaveDelay = null;

  onDestroy(() => {
    console.log("the component is being destroyed");
    clearTimeout(mouseLeaveDelay);
  });

  function handleMouseMove(e) {
    let mX =
      (e.pageX - this.offsetLeft - this.clientWidth / 2) / this.clientWidth;
    let mY =
      (e.pageY - this.offsetTop - this.clientHeight / 2) / this.clientHeight;

    rX = mX * 30;
    rY = mY * -30;
    tX = mX * -40;
    tY = mY * -40;
  }
  function handleMouseEnter(e) {
    clearTimeout(mouseLeaveDelay);
  }
  function handleMouseLeave(e) {
    mouseLeaveDelay = setTimeout(() => {
      rX = rY = tX = tY = 0;
    }, 1000);
  }
</script>

<style scoped>
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
    opacity: 0.3;
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
    opacity: 0.5;
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
</style>

<div>
  <div
    class="card-wrap"
    ref="card"
    on:mousemove={handleMouseMove}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}>
    <div class="card" style="transform: rotateY({rX}deg) rotateX({rY}deg)">
      <div
        class="card-bg"
        style="background-image: url({bgImageURL}); transform: translateX({tX}px)
        translateY({tY}px)" />
      <div class="card-info">
        <h1>{title}</h1>
        <p>{date}</p>
      </div>
    </div>
  </div>
</div>
