<script>
  export let pkg_ver;
  export let svelte_ver;
  export let git_ver;

  import Deck from "./views/Deck.svelte";
</script>

<style>
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  #app a {
    color: #202d3a;
    text-decoration: inherit;
    /* no underline */
  }

  p {
    line-height: 1.5em;
  }
  h1 + p,
  p + p {
    margin-top: 10px;
  }
  * {
    -webkit-margin-before: 0px;
    -webkit-margin-after: 0px;
  }

  #version {
    width: 100%;
    top: 0;
    left: 0;
    position: absolute;
    text-align: right;
  }
  #version a {
    color: inherit;
    /* blue colors for links too */
    text-decoration: inherit;
    /* no underline */
  }
</style>

<div id="app">
  <div id="version">
    <a
      href="https://github.com/tehdarthvid/dna-svelte/releases"
      target="_blank">
      v{pkg_ver} {git_ver}
    </a>
  </div>
  <div id="title">
    <h1>
      <a href="https://twitter.com/darthvid" target="_blank">darthvid</a>
      's influences DNA
    </h1>
    <p>[also the target for webdev study]</p>
  </div>
  <Deck />
  <p>[ svelte v{svelte_ver} ]</p>
</div>
