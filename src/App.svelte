<script>
  export let pkg_ver;
  export let svelte_ver;

  import { googleAnalytics } from "./utils/google-analytics.js";

  import Deck from "./views/Deck.svelte";

  if (process.env.gaID) googleAnalytics(process.env.gaID);
  var strGitHash = process.env.git_hash;
  strGitHash = strGitHash.slice(0, 7);
</script>

<style>
  #app {
    /* font-family: "Ubuntu", "Noto Sans JP", "Avenir", Helvetica, Arial,sans-serif; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /* color: #2c3e50; */
  }
  #app a {
    /* color: #202d3a; */
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
      href="https://github.com/tehdarthvid/dna-svelte/blob/master/CHANGELOG.md"
      target="_blank">
      v{pkg_ver}
    </a>
    <a
      href="https://github.com/tehdarthvid/dna-svelte/commits/master"
      target="_blank">
      {strGitHash}
    </a>
  </div>
  <div id="title">
    <h1>
      <a href="https://darthvid.com" target="_blank">darthvid's</a>
      influences DNA
    </h1>
    <p>Key interests influenced my life.</p>
    <p>[also the target for webdev study]</p>
  </div>
  <Deck />
  <p>[ svelte v{svelte_ver} ]</p>
</div>
