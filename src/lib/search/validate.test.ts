import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSearchInput } from "./validate.ts";

test("defaults status to open and sanitises the query", () => {
  const parsed = parseSearchInput({ q: "  digital\nmarketing  ", status: "open" });
  assert.equal(parsed.params.q, "digital marketing");
  assert.equal(parsed.params.status, "open");
  assert.equal(parsed.errors.length, 0);
});

test("rejects a minimum above the maximum", () => {
  const parsed = parseSearchInput({ minValue: "100", maxValue: "50" });
  assert.equal(parsed.errors.length, 1);
});

test("ignores unknown enums and overlong ids", () => {
  const parsed = parseSearchInput({ status: "nope", region: "mars", cursor: "abc" });
  assert.equal(parsed.params.status, "open");
  assert.equal(parsed.params.region, undefined);
  assert.equal(parsed.params.cursor, undefined);
});
