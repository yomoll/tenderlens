import assert from "node:assert/strict";
import { test } from "node:test";
import { validateExplanation, validateFitResult } from "./schema.ts";

test("accepts a complete explanation object", () => {
  const result = validateExplanation({
    overview: "A buyer needs digital support.",
    suitableFor: "May suit digital agencies, based on the stated category.",
    requirements: ["Read the notice"],
    nextSteps: ["Open the official source"],
    risks: ["Documents may add requirements"],
    missingInformation: ["No insurance figure is stated"],
    keyDates: ["Closes 14 October 2026"],
    valueExplanation: "£80,000-£120,000",
    locationExplanation: "London",
  });
  assert.ok(result);
  assert.equal(result?.overview.includes("digital support"), true);
});

test("rejects missing overview", () => {
  assert.equal(validateExplanation({ suitableFor: "maybe" }), null);
});

test("rejects an unknown fit verdict", () => {
  assert.equal(
    validateFitResult({
      verdict: "definitely-eligible",
      alignment: [],
      checks: [],
      questions: [],
      suggestedNextStep: "Read the notice",
    }),
    null,
  );
});
