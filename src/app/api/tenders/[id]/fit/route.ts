import { NextResponse } from "next/server";
import { generateFitCheck } from "@/lib/ai/provider";
import type { FitProfile } from "@/lib/ai/schema";
import { sanitizeSearchText } from "@/lib/format/text";
import { parseTenderId } from "@/lib/procurement/ids";
import { getTender } from "@/lib/procurement/source";
import { clientKeyFromRequest, rateLimit } from "@/lib/rate-limit";

const ORG_TYPES = new Set(["sme", "sole-trader", "charity", "cic", "large", "other"]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const limited = rateLimit(`fit:${clientKeyFromRequest(request)}`, 15);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { id } = await context.params;
  if (!parseTenderId(id)) {
    return NextResponse.json({ error: "This tender id is not valid." }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid fit-checker request." }, { status: 400 });
  }

  const organisationType = String(body.organisationType || "");
  if (!ORG_TYPES.has(organisationType)) {
    return NextResponse.json({ error: "Choose an organisation type." }, { status: 400 });
  }

  const profile: FitProfile = {
    organisationType: organisationType as FitProfile["organisationType"],
    serviceArea: sanitizeSearchText(String(body.serviceArea || ""), 120),
    location: sanitizeSearchText(String(body.location || ""), 80),
    size: sanitizeSearchText(String(body.size || ""), 80) || undefined,
    experience: sanitizeSearchText(String(body.experience || ""), 240) || undefined,
    turnover: sanitizeSearchText(String(body.turnover || ""), 80) || undefined,
    description: sanitizeSearchText(String(body.description || ""), 400) || undefined,
  };

  if (!profile.serviceArea || !profile.location) {
    return NextResponse.json({ error: "Add your service area and location." }, { status: 400 });
  }

  const tender = await getTender(id);
  if (!tender) {
    return NextResponse.json({ error: "That notice could not be found." }, { status: 404 });
  }

  const result = await generateFitCheck(tender, profile);
  return NextResponse.json(result);
}
