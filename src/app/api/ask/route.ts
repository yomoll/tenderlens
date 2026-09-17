import { runAskPipeline } from "@/lib/rag/pipeline";
import type { StreamEvent } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let question = "";
  try {
    const body = (await request.json()) as { question?: string };
    question = (body.question ?? "").replace(/\s+/g, " ").trim();
  } catch {
    return Response.json({ error: "Send a JSON body with a question." }, { status: 400 });
  }

  if (question.length < 8) {
    return Response.json({ error: "Enter a longer question." }, { status: 400 });
  }
  if (question.length > 500) {
    return Response.json({ error: "Keep the question under 500 characters." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        await runAskPipeline(question, send);
      } catch (error) {
        send({
          stage: "error",
          message: error instanceof Error ? error.message : "The GOV.UK lookup failed.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
