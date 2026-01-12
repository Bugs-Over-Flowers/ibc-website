import { describe, expect, it } from "vitest";
import tryCatch from "@/lib/server/tryCatch";

/**
 * Integration tests for server utilities
 * These test server-side functions with controlled dependencies
 */
describe("server/tryCatch", () => {
  it("should return success result for successful promise", async () => {
    const successPromise = Promise.resolve({ data: "test data" });

    const result = await tryCatch(successPromise);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: "test data" });
    expect(result.error).toBeNull();
  });

  it("should return error result for rejected promise", async () => {
    const errorPromise = Promise.reject(new Error("Test error"));

    const result = await tryCatch(errorPromise);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Test error");
    expect(result.data).toBeNull();
  });

  it("should handle non-Error rejections", async () => {
    const errorPromise = Promise.reject("String error");

    const result = await tryCatch(errorPromise);

    expect(result.success).toBe(false);
    expect(result.error).toBe("String error");
  });

  it("should work with async functions", async () => {
    const asyncFunction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { id: 123 };
    };

    const result = await tryCatch(asyncFunction());

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 123 });
  });

  it("should work with throwing async functions", async () => {
    const throwingFunction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Async error");
    };

    const result = await tryCatch(throwingFunction());

    expect(result.success).toBe(false);
    expect(result.error).toBe("Async error");
  });
});
