import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    pkg_ver: process.env.pkg_ver,
    svelte_ver: process.env.svelte_ver
  }
});

export default app;
