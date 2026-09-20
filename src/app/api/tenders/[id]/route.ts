import { NextResponse } from "next/server";
import { getTender } from "@/lib/procurement/source";
import { parseTenderId } from "@/lib/procurement/ids";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";
import { FIND_A_TENDER_URL } from "@/lib/site";
import { userSafeUpstreamMessage } from "@/lib/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = rateLimit(`tender:${clientKeyFromRequest(request)}`);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { id } = await context.params;
  if (!parseTenderId(id)) {
    return NextResponse.json({ error: "This tender id is not valid." }, { status: 400 });
  }

  try {
    const tender = await getTender(id);
    if (!tender) {
      return NextResponse.json({ error: "That notice could not be found." }, { status: 404 });
    }
    return NextResponse.json({ tender });
  } catch (error) {
    return NextResponse.json(
      {
        error: userSafeUpstreamMessage(error),
        official: FIND_A_TENDER_URL,
      },
      { status: 503 },
    );
  }
}
