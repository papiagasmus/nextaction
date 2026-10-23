import assert from "node:assert/strict";
import test from "node:test";
import { healthPayload } from "../src/shared/health.mjs";

test("health payload identifies the NextAction Worker", () => {
  assert.deepEqual(healthPayload(), {
    status: "ok",
    service: "nextaction-worker",
  });
});
