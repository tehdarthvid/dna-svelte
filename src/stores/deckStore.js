import { readable } from "svelte/store";
import { initDeck } from "./actions.js";

export const deck = readable(null, function start(set) {
  initDeck(set);
  return function stop() {};
});
