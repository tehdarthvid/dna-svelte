import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Modal from "./Modal.svelte";

describe("Modal", () => {
  it("opens as a modal dialog showing the image", () => {
    const { container } = render(Modal, { urlImg: "https://x.test/a.png" });
    const dialog = container.querySelector("dialog");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.querySelector("img").getAttribute("src")).toBe(
      "https://x.test/a.png"
    );
  });

  it("closes and calls onclose when clicked", async () => {
    const onclose = vi.fn();
    const { container } = render(Modal, { urlImg: "a", onclose });
    const dialog = container.querySelector("dialog");
    await fireEvent.click(dialog.querySelector("img"));
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("calls onclose when the dialog is closed natively (e.g. Esc)", () => {
    const onclose = vi.fn();
    const { container } = render(Modal, { urlImg: "a", onclose });
    container.querySelector("dialog").close();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("does not throw without onclose", async () => {
    const { container } = render(Modal, { urlImg: "a" });
    await fireEvent.click(container.querySelector("dialog"));
  });
});
