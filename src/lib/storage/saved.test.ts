import assert from "node:assert/strict";
import { test } from "node:test";
import { isTenderSaved, loadSavedTenders, removeSavedTender, saveTender, SAVED_KEY } from "./saved.ts";
import type { Tender } from "../procurement/types.ts";

const store = new Map<string, string>();

const tender = {
  id: "cf:d01b3b0e-1813-44f9-9e33-f72dd1f53c30",
  source: "contracts-finder",
  sourceUrl: "https://www.contractsfinder.service.gov.uk/Notice/d01b3b0e-1813-44f9-9e33-f72dd1f53c30",
  sourceLabel: "Contracts Finder",
  title: "Digital support",
  buyer: { name: "Sample Buyer" },
  status: "open",
} as Tender;

test("save and remove tenders in localStorage", () => {
  const memory = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  Object.defineProperty(globalThis, "window", { value: { localStorage: memory }, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: memory, configurable: true });
  store.clear();

  assert.equal(isTenderSaved(tender.id), false);
  saveTender(tender);
  assert.equal(isTenderSaved(tender.id), true);
  assert.equal(loadSavedTenders()[0]?.title, "Digital support");
  removeSavedTender(tender.id);
  assert.equal(isTenderSaved(tender.id), false);
  assert.ok(store.has(SAVED_KEY));
});
