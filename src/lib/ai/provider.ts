import { asRecord, asString } from "../format/text";
import { fallbackExplanation, fallbackFit } from "./fallback";
import { explanationUserPrompt, fitUserPrompt, SYSTEM_GUARDRAILS } from "./prompts";
import { validateExplanation, validateFitResult, type FitProfile, type FitResult, type TenderExplanation } from "./schema";
import type { Tender } from "../procurement/types";

type JsonCompletion = {
  system: string;
  user: string;
};

function providerName(): "none" | "openai" | "gemini" {
  const value = (process.env.AI_PROVIDER || "none").toLowerCase();
  if (value === "openai" || value === "gemini") return value;
  return "none";
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /```json\s*([\s\S]*?)```/i.exec(trimmed);
  const raw = fenced?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function completeOpenAI({ system, user }: JsonCompletion): Promise<unknown> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing openai key");
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`openai ${response.status}`);
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return extractJson(payload.choices?.[0]?.message?.content || "");
}

async function completeGemini({ system, user }: JsonCompletion): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("missing gemini key");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
    }),
  });
  if (!response.ok) throw new Error(`gemini ${response.status}`);
  const payload = asRecord(await response.json());
  const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
  const content = asRecord(asRecord(candidates[0])?.content);
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  const text = parts.map((part) => asString(asRecord(part)?.text) || "").join("\n");
  return extractJson(text);
}

async function completeJson(prompt: JsonCompletion): Promise<unknown> {
  const provider = providerName();
  if (provider === "openai" && process.env.OPENAI_API_KEY) return completeOpenAI(prompt);
  if (provider === "gemini" && process.env.GEMINI_API_KEY) return completeGemini(prompt);
  return null;
}

export function aiEnabled(): boolean {
  const provider = providerName();
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  if (provider === "gemini") return Boolean(process.env.GEMINI_API_KEY);
  return false;
}

export async function generateTenderExplanation(tender: Tender): Promise<{ explanation: TenderExplanation; mode: "ai" | "fallback" }> {
  if (aiEnabled()) {
    try {
      const parsed = validateExplanation(
        await completeJson({
          system: SYSTEM_GUARDRAILS,
          user: explanationUserPrompt(tender),
        }),
      );
      if (parsed) return { explanation: parsed, mode: "ai" };
    } catch {
      // Fall through to official-field summary.
    }
  }
  return { explanation: fallbackExplanation(tender), mode: "fallback" };
}

export async function generateFitCheck(tender: Tender, profile: FitProfile): Promise<{ result: FitResult; mode: "ai" | "fallback" }> {
  if (aiEnabled()) {
    try {
      const parsed = validateFitResult(
        await completeJson({
          system: SYSTEM_GUARDRAILS,
          user: fitUserPrompt(tender, {
            organisationType: profile.organisationType,
            serviceArea: profile.serviceArea,
            location: profile.location,
            size: profile.size || "",
            experience: profile.experience || "",
            turnover: profile.turnover || "",
            description: profile.description || "",
          }),
        }),
      );
      if (parsed) return { result: parsed, mode: "ai" };
    } catch {
      // Fall through.
    }
  }
  return { result: fallbackFit(tender, profile), mode: "fallback" };
}
