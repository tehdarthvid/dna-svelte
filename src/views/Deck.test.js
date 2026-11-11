import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Deck from "./Deck.svelte";
import { activeCard } from "../stores/deckStore.js";
import deckData from "../data/deck.json";

beforeEach(() => activeCard.set(null));

describe("Deck", () => {
  it("renders one card per deck entry", () => {
    const { getAllByRole } = render(Deck);
    expect(getAllByRole("img")).toHaveLength(deckData.length);
  });

  it("shows no modal until a card is activated", () => {
    const { container } = render(Deck);
    expect(container.querySelector(".modal")).toBeNull();
  });

  it("opens the modal on double click and closes it on Escape", async () => {
    const { getAllByRole, container, findByText } = render(Deck);
    await fireEvent.dblClick(getAllByRole("img")[0]);
    const modal = container.querySelector(".modal");
    expect(modal).not.toBeNull();
    expect(modal.querySelector("img").getAttribute("src")).toBe(
      deckData[0].imgURL
    );

    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".modal")).toBeNull();
  });

  it("closes the modal when the backdrop is clicked", async () => {
    const { getAllByRole, container } = render(Deck);
    await fireEvent.dblClick(getAllByRole("img")[0]);
    await fireEvent.click(container.querySelector(".modal"));
    expect(container.querySelector(".modal")).toBeNull();
  });
});
