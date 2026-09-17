import { LANGUAGES } from "@/lib/languages";
import { translateAnswer } from "@/lib/rag/generate";
import type { AskAnswer } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { answer?: AskAnswer; language?: string };
    const language = LANGUAGES.find((item) => item.code === body.language);
    if (!body.answer || !language) {
      return Response.json({ error: "Send an answer and a language code." }, { status: 400 });
    }
    const translated = await translateAnswer(body.answer, language);
    return Response.json({ answer: translated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
