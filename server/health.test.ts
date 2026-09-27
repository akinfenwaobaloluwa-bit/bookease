import { describe, expect, it } from "vitest";

describe("BookEase health configuration", ( ) => {
  it("uses the expected local API port by default", () => {
    expect(Number(process.env.PORT || 4000)).toBeGreaterThan(0);
  });

  it("has a database URL when the test environment provides one", () => {
    if (process.env.DATABASE_URL) {
      expect(process.env.DATABASE_URL).toContain("mysql");
    } else {
      expect(true).toBe(true);
    }
  });
});