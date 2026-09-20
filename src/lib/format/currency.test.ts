import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMoney, formatValueRange } from "./currency.ts";

test("formats GBP without pence for whole pounds", () => {
  assert.equal(formatMoney(80000), "£80,000");
});

test("formats a value range with a hyphen", () => {
  assert.equal(formatValueRange({ min: 80000, max: 120000, currency: "GBP" }), "£80,000-£120,000");
});

test("treats zero as unspecified", () => {
  assert.equal(formatValueRange({ min: 0, max: 0, currency: "GBP" }), undefined);
});

test("formats a minimum-only value", () => {
  assert.equal(formatValueRange({ min: 25000, currency: "GBP" }), "From £25,000");
});
