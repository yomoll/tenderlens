export type Intent =
  | "register"
  | "apply"
  | "eligibility"
  | "deadline"
  | "cost"
  | "howto"
  | "general";

export type Interpretation = {
  question: string;
  interpretation: string;
  queries: string[];
  preferredPaths: string[];
  topic: string;
  intent: Intent;
};

export type SearchHit = {
  title: string;
  link: string;
  description: string;
  documentType: string;
  organisation: string | null;
  updatedAt: string | null;
  score: number;
};

export type SourceDocument = {
  id: string;
  title: string;
  url: string;
  basePath: string;
  organisation: string | null;
  documentType: string;
  schemaName: string;
  updatedAt: string | null;
  excerpt: string;
  text: string;
  headings: Array<{ title: string; text: string }>;
  steps: Array<{ title: string; text: string; links: Array<{ href: string; text: string }> }>;
  withdrawn: boolean;
};

export type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  sourceIds: string[];
};

export type AnswerSource = {
  id: string;
  title: string;
  url: string;
  basePath: string;
  organisation: string | null;
  documentType: string;
  updatedAt: string | null;
  excerpt: string;
};

export type AskAnswer = {
  id: string;
  question: string;
  interpretation: string;
  topic: string;
  intent: Intent;
  summary: string;
  paragraphs: string[];
  checklist: ChecklistItem[];
  caveats: string[];
  sources: AnswerSource[];
  queries: string[];
  mode: "generative" | "extractive";
  generatedAt: string;
  language: string;
};

export type StreamEvent =
  | { stage: "interpret"; interpretation: Interpretation }
  | { stage: "search"; queries: string[]; hitCount: number }
  | { stage: "retrieve"; titles: string[] }
  | { stage: "answer"; answer: AskAnswer }
  | { stage: "error"; message: string };
