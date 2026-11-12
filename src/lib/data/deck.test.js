import { describe, it, expect } from "vitest";
import deck from "./deck.json";

const isHttpsUrl = s => {
  try {
    return new URL(s).protocol === "https:";
  } catch {
    return false;
  }
};

describe("deck.json", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(deck)).toBe(true);
    expect(deck.length).toBeGreaterThan(0);
  });

  it.each(deck.map(c => [c.title, c]))("%s has valid fields", (_t, card) => {
    expect(card.title).toBeTypeOf("string");
    expect(card.title.trim()).not.toBe("");
    expect(card.date).toBeTypeOf("string");
    expect(card.date.trim()).not.toBe("");
    expect(isHttpsUrl(card.imgURL)).toBe(true);
    expect(Array.isArray(card.tags)).toBe(true);
    card.tags.forEach(t => expect(t).toBeTypeOf("string"));
    if (card.linkedCards !== undefined) {
      expect(Array.isArray(card.linkedCards)).toBe(true);
      card.linkedCards.forEach(t => expect(t).toBeTypeOf("string"));
    }
  });

  it("has unique titles", () => {
    const titles = deck.map(c => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
