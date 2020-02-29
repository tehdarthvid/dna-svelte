import { readable, writable } from "svelte/store";
import initDeck from "./actions.js";

export const deck = readable(null, function start(set) {
  set([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
  initDeck(set);
  return function stop() {};
});

export const activeCard = writable(null);
