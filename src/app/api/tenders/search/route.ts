import { NextResponse } from "next/server";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";
import { searchTenders } from "@/lib/procurement/source";
import { parseSearchInput } from "@/lib/search/validate";
import { FIND_A_TENDER_URL } from "@/lib/site";

export async function GET(request: Request) {
  const limited = rateLimit(`search:${clientKeyFromRequest(request)}`);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Too many searches. Please wait a moment and try again.",
        official: FIND_A_TENDER_URL,
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) } },
    );
  }

  const url = new URL(request.url);
  const parsed = parseSearchInput(url.searchParams);
  if (parsed.errors.length) {
    return NextResponse.json({ error: parsed.errors[0] }, { status: 400 });
  }

  try {
    const result = await searchTenders(parsed.params);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        results: [],
        sourceStatus: {
          contractsFinder: { ok: false, label: "Contracts Finder" },
          findATender: { ok: false, label: "Find a Tender" },
          usingFixtures: false,
        },
        error: "Tender data is temporarily unavailable. Please try again shortly or search directly on Find a Tender.",
        official: FIND_A_TENDER_URL,
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const limited = rateLimit(`search:${clientKeyFromRequest(request)}`);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many searches. Please wait a moment and try again." }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid search request." }, { status: 400 });
  }

  const parsed = parseSearchInput(body);
  if (parsed.errors.length) {
    return NextResponse.json({ error: parsed.errors[0] }, { status: 400 });
  }

  const result = await searchTenders(parsed.params);
  return NextResponse.json(result);
}
