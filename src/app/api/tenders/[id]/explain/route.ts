import { NextResponse } from "next/server";
import { generateTenderExplanation } from "@/lib/ai/provider";
import { parseTenderId } from "@/lib/procurement/ids";
import { getTender } from "@/lib/procurement/source";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const limited = rateLimit(`explain:${clientKeyFromRequest(request)}`, 20);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { id } = await context.params;
  if (!parseTenderId(id)) {
    return NextResponse.json({ error: "This tender id is not valid." }, { status: 400 });
  }

  const tender = await getTender(id);
  if (!tender) {
    return NextResponse.json({ error: "That notice could not be found." }, { status: 404 });
  }

  const result = await generateTenderExplanation(tender);
  return NextResponse.json(result);
}
