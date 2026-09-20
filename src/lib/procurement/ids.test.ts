import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeTenderId, parseTenderId } from "./ids.ts";

test("encodes and parses a Contracts Finder GUID", () => {
  const id = encodeTenderId("contracts-finder", "d01b3b0e-1813-44f9-9e33-f72dd1f53c30");
  assert.deepEqual(parseTenderId(id), {
    source: "contracts-finder",
    nativeId: "d01b3b0e-1813-44f9-9e33-f72dd1f53c30",
  });
});

test("rejects arbitrary URLs in ids", () => {
  assert.equal(parseTenderId("https://evil.example"), null);
  assert.equal(parseTenderId("cf:not-a-guid"), null);
  assert.equal(parseTenderId("fat:something-else"), null);
});
