import type { KeyboardEvent } from "react";

const NAVIGATION_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "Home",
  "End",
  "ArrowLeft",
  "ArrowRight",
]);

const SHORTCUT_KEYS = new Set(["a", "c", "v", "x"]);

export function preventInvalidKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  allowedPattern: RegExp,
) {
  if (
    NAVIGATION_KEYS.has(event.key) ||
    ((event.ctrlKey || event.metaKey) && SHORTCUT_KEYS.has(event.key))
  ) {
    return;
  }

  if (!allowedPattern.test(event.key)) {
    event.preventDefault();
  }
}
