// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchCommandBar } from "./SearchCommandBar";

afterEach(cleanup);

describe("SearchCommandBar", () => {
  it("disables submit button and blocks submission when query is empty or whitespace", () => {
    const onSubmit = vi.fn();

    render(
      <SearchCommandBar
        value="   "
        presets={Array.of("noise cancelling headphones")}
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole("button", { name: /inspect/i });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.submit(submitButton.closest("form")!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("updates input and executes search immediately when clicking a quick prompt chip", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <SearchCommandBar
        value=""
        presets={Array.of("4k oled gaming monitor")}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "4k oled gaming monitor" })
    );

    expect(onChange).toHaveBeenCalledWith("4k oled gaming monitor");
    expect(onSubmit).toHaveBeenCalledWith("4k oled gaming monitor");
  });

  it("focuses the search input when pressing Cmd+K or Ctrl+K", () => {
    render(
      <SearchCommandBar
        value=""
        presets={Array.of()}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", {
      name: /product query or shopping prompt/i,
    });
    expect(document.activeElement).not.toBe(input);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(document.activeElement).toBe(input);
  });
});
