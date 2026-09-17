import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretQuestion } from "./interpret";

describe("interpretQuestion", () => {
  it("maps short tax-file questions to Self Assessment", () => {
    const result = interpretQuestion("I want to file for tax");
    assert.equal(result.topic, "self-assessment");
    assert.equal(result.intent, "howto");
    assert.match(result.interpretation, /Self Assessment/i);
    assert.ok(result.preferredPaths.includes("/self-assessment-tax-returns"));
  });

  it("keeps self-employment for sole trader questions", () => {
    const result = interpretQuestion("I’ve just started self-employment. What things do I need to register for?");
    assert.equal(result.topic, "self-employment");
  });

  it("maps National Insurance number questions", () => {
    const result = interpretQuestion("How do I apply for a National Insurance number?");
    assert.equal(result.topic, "national-insurance");
    assert.equal(result.intent, "apply");
  });

  it("points DVLA address questions at the change-of-address guide", () => {
    const result = interpretQuestion("Do I need to tell DVLA if I move house?");
    assert.equal(result.topic, "driving");
    assert.ok(result.preferredPaths.includes("/change-address-driving-licence"));
    assert.equal(result.preferredPaths.includes("/browse/driving"), false);
  });
});
