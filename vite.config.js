import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));
// the Svelte version actually bundled (not the latest on npm)
const { version: svelteVersion } = createRequire(import.meta.url)(
  "svelte/package.json"
);

export default {
  plugins: [sveltekit({ adapter: adapter() })],
  define: {
    __PKG_VERSION__: JSON.stringify(version),
    __SVELTE_VERSION__: JSON.stringify(svelteVersion)
  }
};
