import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeContractsFinderItem, normalizeFindATenderRelease } from "./normalize.ts";

test("normalises a Contracts Finder search hit", () => {
  const tender = normalizeContractsFinderItem({
    score: 2,
    item: {
      id: "d01b3b0e-1813-44f9-9e33-f72dd1f53c30",
      title: "Digital support",
      description: "Help with accessibility.",
      organisationName: "Sample Buyer",
      noticeStatus: "Open",
      noticeType: "Contract",
      deadlineDate: "2026-10-14T17:00:00Z",
      publishedDate: "2026-09-01T09:00:00Z",
      valueLow: 80000,
      valueHigh: 120000,
      region: "London",
      isSuitableForSme: true,
      isSuitableForVco: false,
      cpvCodes: "72000000",
      cpvDescription: "IT services",
    },
  });
  assert.ok(tender);
  assert.equal(tender?.id, "cf:d01b3b0e-1813-44f9-9e33-f72dd1f53c30");
  assert.equal(tender?.source, "contracts-finder");
  assert.equal(tender?.status, "open");
  assert.equal(tender?.suitableForSME, true);
  assert.equal(tender?.value?.min, 80000);
  assert.equal(tender?.sourceUrl.includes("d01b3b0e-1813-44f9-9e33-f72dd1f53c30"), true);
});

test("does not invent a missing title", () => {
  assert.equal(normalizeContractsFinderItem({ item: { id: "x" } }), null);
});

test("normalises a Find a Tender OCDS release", () => {
  const tender = normalizeFindATenderRelease({
    ocid: "ocds-h6vhtk-0775e7",
    id: "088905-2026",
    date: "2026-09-18T10:00:00Z",
    tag: ["tender"],
    tender: {
      title: "Restoration design",
      status: "active",
      description: "Design stages.",
      value: { amount: 350000, currency: "GBP" },
      tenderPeriod: { endDate: "2026-10-09T12:00:00+01:00" },
      classification: { id: "71000000", description: "Architectural services" },
    },
    buyer: { name: "Green Action Trust" },
  });
  assert.ok(tender);
  assert.equal(tender?.id, "fat:ocds-h6vhtk-0775e7");
  assert.equal(tender?.sourceLabel, "Find a Tender");
  assert.equal(tender?.status, "open");
  assert.equal(tender?.value?.max, 350000);
  assert.equal(tender?.sourceUrl, "https://www.find-tender.service.gov.uk/Notice/088905-2026");
});
