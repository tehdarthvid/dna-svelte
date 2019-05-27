import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    pkg_ver: "<@PKG_VERSION@>",
    svelte_ver: "<@SVELTE_VERSION@>",
    git_ver: "<@GIT_COMMIT_NUMBER@>"
  }
});

export default app;
