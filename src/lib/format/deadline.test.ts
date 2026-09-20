import assert from "node:assert/strict";
import { test } from "node:test";
import { describeDeadline } from "./deadline.ts";

test("describes a future deadline in days remaining", () => {
  const now = new Date("2026-09-20T12:00:00Z");
  const info = describeDeadline("2026-10-02T17:00:00Z", now);
  assert.ok(info);
  assert.equal(info?.closed, false);
  assert.equal(info?.daysRemaining, 13);
  assert.match(info?.label || "", /days remaining/);
});

test("describes a closed deadline", () => {
  const now = new Date("2026-09-20T12:00:00Z");
  const info = describeDeadline("2026-09-16T12:00:00Z", now);
  assert.equal(info?.closed, true);
  assert.equal(info?.remainingLabel, "Closed");
  assert.match(info?.label || "", /Closed 4 days ago/);
});

test("returns null when no deadline is provided", () => {
  assert.equal(describeDeadline(undefined), null);
});
