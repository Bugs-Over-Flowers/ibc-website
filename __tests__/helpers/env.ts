//
//--- Helper functions ---
//
export function checkTestEnvironment() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("This function can only be called in test environment!");
  }
}
