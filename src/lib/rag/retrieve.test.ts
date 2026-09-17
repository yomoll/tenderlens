import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretQuestion } from "./interpret";
import { isOffTopic, scoreHit } from "./retrieve";
import type { SearchHit } from "../types";

function hit(partial: Partial<SearchHit> & Pick<SearchHit, "title" | "link">): SearchHit {
  return {
    description: "",
    documentType: "guide",
    organisation: null,
    updatedAt: null,
    score: 1,
    ...partial,
  };
}

describe("retrieve ranking", () => {
  it("treats browse hubs as weaker than a specific guide", () => {
    const interpretation = interpretQuestion("Do I need to tell DVLA if I move house?");
    const preferred = new Set(interpretation.preferredPaths);
    const browse = scoreHit(
      hit({ title: "Driving and transport", link: "/browse/driving", documentType: "mainstream_browse_page" }),
      interpretation,
      preferred,
    );
    const guide = scoreHit(
      hit({ title: "Change the address on your driving licence", link: "/change-address-driving-licence" }),
      interpretation,
      preferred,
    );
    assert.ok(guide > browse);
  });

  it("keeps the address guide and drops sold-vehicle pages", () => {
    const interpretation = interpretQuestion("Do I need to tell DVLA if I move house?");
    assert.equal(
      isOffTopic(
        { title: "Tell DVLA you've sold, transferred or bought a vehicle", link: "/sold-bought-vehicle" },
        interpretation,
      ),
      true,
    );
    assert.equal(
      isOffTopic(
        { title: "Apply for your first provisional driving licence", link: "/apply-first-provisional-driving-licence" },
        interpretation,
      ),
      true,
    );
    assert.equal(
      isOffTopic(
        { title: "Change the address on your driving licence", link: "/change-address-driving-licence" },
        interpretation,
      ),
      false,
    );
  });
});
