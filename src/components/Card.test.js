import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";
import Card from "./Card.svelte";
import { activeCard } from "../stores/deckStore.js";

const base = {
  title: "Star Wars",
  date: "25 May 1977",
  imgURL: "https://x.test/sw.jpg"
};

beforeEach(() => activeCard.set(null));
afterEach(() => vi.useRealTimers());

describe("Card", () => {
  it("shows title and date and labels itself with the title", () => {
    const { getByRole, getByText } = render(Card, { params: base });
    expect(getByRole("img").getAttribute("aria-label")).toBe("Star Wars");
    expect(getByText("Star Wars")).toBeTruthy();
    expect(getByText("25 May 1977")).toBeTruthy();
  });

  it("renders an empty placeholder card without throwing", () => {
    const { getByRole } = render(Card, { params: {} });
    expect(getByRole("img").getAttribute("aria-label")).toBe("");
  });

  it("sets activeCard on double click", async () => {
    const { getByRole } = render(Card, { params: base });
    await fireEvent.dblClick(getByRole("img"));
    expect(get(activeCard)).toEqual({
      title: "Star Wars",
      imgURL: base.imgURL,
      date: base.date
    });
  });

  it("renders a YouTube iframe when ytVideoID is set", () => {
    const { container } = render(Card, {
      params: { ...base, ytVideoID: "abc123" }
    });
    const iframe = container.querySelector("iframe");
    expect(iframe.getAttribute("src")).toContain(
      "https://www.youtube.com/embed/abc123"
    );
  });

  it("renders a video element when vidURL is set", () => {
    const { container } = render(Card, {
      params: { ...base, vidURL: "https://x.test/v.mp4" }
    });
    expect(container.querySelector("video").getAttribute("src")).toBe(
      "https://x.test/v.mp4"
    );
  });

  it("uses the image as background for plain image cards", () => {
    const { container } = render(Card, { params: base });
    expect(container.querySelector(".card-bg").getAttribute("style")).toContain(
      base.imgURL
    );
  });

  it("tilts on mouse move and resets 1s after mouse leave", async () => {
    vi.useFakeTimers();
    const { getByRole, container } = render(Card, { params: base });
    const wrap = getByRole("img");
    const card = container.querySelector(".card");
    expect(card.getAttribute("style")).toContain("rotateY(0deg)");

    await fireEvent.mouseMove(wrap, { clientX: 100, clientY: 100 });
    expect(card.getAttribute("style")).not.toContain("rotateY(0deg)");

    await fireEvent.mouseLeave(wrap);
    vi.advanceTimersByTime(999);
    await Promise.resolve();
    expect(card.getAttribute("style")).not.toContain("rotateY(0deg)");
    vi.advanceTimersByTime(2);
    await Promise.resolve();
    expect(card.getAttribute("style")).toContain("rotateY(0deg)");
  });
});
