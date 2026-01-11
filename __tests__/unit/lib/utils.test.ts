import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

/**
 * Unit tests for utility functions
 * These test pure functions with no external dependencies
 */
describe("lib/utils", () => {
  describe("cn (classNames utility)", () => {
    it("should merge class names correctly", () => {
      const result = cn("base-class", "additional-class");
      expect(result).toContain("base-class");
      expect(result).toContain("additional-class");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toContain("base");
      expect(result).toContain("active");
    });

    it("should filter out falsy values", () => {
      const result = cn("base", false && "hidden", null, undefined, "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("hidden");
    });

    it("should override conflicting Tailwind classes", () => {
      // cn uses tailwind-merge, so later classes override earlier ones
      const result = cn("p-4", "p-8");
      expect(result).toBe("p-8");
    });
  });
});
