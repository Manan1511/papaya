import { describe, expect, it } from "vitest";
import { clearFailures, loginLocked, recordFailure } from "./throttle";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Each test uses its own client keys, because the counts live in module state.
describe("login throttle", () => {
  it("locks a client after five failures and releases it when the window ends", () => {
    const start = 1_000_000;
    for (let attempt = 0; attempt < 4; attempt++) recordFailure("locks-after-five", start);
    expect(loginLocked("locks-after-five", start)).toBe(false);

    recordFailure("locks-after-five", start);
    expect(loginLocked("locks-after-five", start)).toBe(true);
    expect(loginLocked("locks-after-five", start + FIFTEEN_MINUTES)).toBe(false);
  });

  it("counts each client separately", () => {
    const start = 2_000_000;
    for (let attempt = 0; attempt < 5; attempt++) recordFailure("separate-busy", start);

    expect(loginLocked("separate-busy", start)).toBe(true);
    expect(loginLocked("separate-quiet", start)).toBe(false);
  });

  it("clears the count after a successful sign-in", () => {
    const start = 3_000_000;
    for (let attempt = 0; attempt < 5; attempt++) recordFailure("clears-on-success", start);

    clearFailures("clears-on-success");
    expect(loginLocked("clears-on-success", start)).toBe(false);
  });
});
