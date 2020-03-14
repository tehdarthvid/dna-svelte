import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";

import replace from "@rollup/plugin-replace";

//import json from "rollup-plugin-json";
//import replace from "rollup-plugin-replace";
import { version } from "./package.json";
const { execSync } = require("child_process");

const production = !process.env.ROLLUP_WATCH;

if (null == process.env.URL_DECK) {
  throw new Error("Missing environment variable `URL_DECK`");
}
if (null == process.env.GITHUB_SHA) {
  throw new Error("Missing environment variable `GITHUB_SHA`");
}
if (null == process.env.GA_TRACKING_ID) {
  throw new Error("Missing environment variable `GA_TRACKING_ID`");
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js"
  },
  plugins: [
    replace({
      process: JSON.stringify({
        env: {
          pkg_ver: version,
          svelte_ver: execSync("npm info svelte version")
            .toString()
            .trim(),
          git_hash: process.env.GITHUB_SHA,
          gaID: process.env.GA_TRACKING_ID,
          url_deck: process.env.URL_DECK
        }
      })
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: css => {
        css.write("public/build/bundle.css");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}
