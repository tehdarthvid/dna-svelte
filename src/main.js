import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    pkg_ver: process.env.pkg_ver,
    svelte_ver: process.env.svelte_ver,
    git_ver: process.env.git_hash
    //ga_tracking_id: process.env.gaID
  }
});

//console.log("oyoyoy: " + process.env.pkg_ver);
export default app;
