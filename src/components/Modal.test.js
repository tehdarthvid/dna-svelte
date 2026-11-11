import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Modal from "./Modal.svelte";

describe("Modal", () => {
  it("renders the image", () => {
    const { container } = render(Modal, { urlImg: "https://x.test/a.png" });
    expect(container.querySelector("img").getAttribute("src")).toBe(
      "https://x.test/a.png"
    );
  });

  it("calls onclose when the backdrop is clicked", async () => {
    const onclose = vi.fn();
    const { container } = render(Modal, { urlImg: "a", onclose });
    await fireEvent.click(container.querySelector(".modal"));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("calls onclose on Escape but not other keys", async () => {
    const onclose = vi.fn();
    render(Modal, { urlImg: "a", onclose });
    await fireEvent.keyDown(window, { key: "a" });
    expect(onclose).not.toHaveBeenCalled();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("does not throw without onclose", async () => {
    const { container } = render(Modal, { urlImg: "a" });
    await fireEvent.click(container.querySelector(".modal"));
  });
});
