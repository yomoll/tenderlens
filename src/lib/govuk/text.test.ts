import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenBulletClauses, htmlToPlain, splitSentences } from "./text";
import { interpretQuestion } from "../rag/interpret";
import { summariseExtractive } from "../rag/summarise";
import type { SourceDocument } from "../types";

describe("htmlToPlain", () => {
  it("turns headings into separate sentences", () => {
    const text = htmlToPlain("<h2>Who can apply</h2><p>You can apply for a National Insurance number if you live in the UK.</p>");
    assert.match(text, /Who can apply\./);
    const sentences = splitSentences(text);
    assert.ok(sentences.some((sentence) => sentence.startsWith("You can apply")));
    assert.equal(sentences.some((sentence) => sentence.includes("Who can apply You can")), false);
  });

  it("flattens bullet lists into a readable clause", () => {
    const flat = flattenBulletClauses(
      "You can apply if you: • live in the UK • have the right to work • are looking for work",
    );
    assert.equal(flat.includes("•"), false);
    assert.match(flat, /live in the UK, have the right to work and are looking for work/);
  });
});

describe("summariseExtractive", () => {
  it("uses action checklist items instead of section titles", () => {
    const doc: SourceDocument = {
      id: "/apply-national-insurance-number",
      title: "Apply for a National Insurance number",
      url: "https://www.gov.uk/apply-national-insurance-number",
      basePath: "/apply-national-insurance-number",
      organisation: "Department for Work and Pensions",
      documentType: "guide",
      schemaName: "guide",
      updatedAt: "2024-11-06",
      excerpt: "Apply for your first National Insurance number.",
      text: "You can apply for a National Insurance number if you live in the UK. To get a National Insurance number you need to apply online. You must have the right to work in the UK.",
      headings: [
        { title: "Who can apply for a National Insurance number", text: "You can apply if you live in the UK." },
        { title: "How to apply", text: "To get a National Insurance number you need to apply online." },
      ],
      steps: [],
      withdrawn: false,
    };

    const answer = summariseExtractive(interpretQuestion("How do I apply for a National Insurance number?"), [doc]);
    assert.ok(answer.paragraphs.every((paragraph) => !/number You /.test(paragraph)));
    assert.ok(answer.checklist.every((item) => !/^Who can apply/i.test(item.title)));
    assert.ok(answer.checklist.some((item) => /apply online/i.test(item.title)));
  });
});
