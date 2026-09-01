import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

describe("<Button />", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("fires onPress when clicked", async () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("is disabled and non-interactive while loading", async () => {
    const onPress = vi.fn();
    render(
      <Button isLoading onPress={onPress}>
        Go
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onPress).not.toHaveBeenCalled();
  });
});
