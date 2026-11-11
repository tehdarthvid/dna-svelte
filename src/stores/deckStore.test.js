import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { deck, activeCard } from "./deckStore.js";
import deckData from "../data/deck.json";

describe("deckStore", () => {
  it("deck resolves to the data in deck.json", () => {
    expect(get(deck)).toEqual(deckData);
  });

  it("activeCard starts null and can be set and cleared", () => {
    expect(get(activeCard)).toBeNull();
    activeCard.set({ title: "x" });
    expect(get(activeCard)).toEqual({ title: "x" });
    activeCard.set(null);
    expect(get(activeCard)).toBeNull();
  });
});
