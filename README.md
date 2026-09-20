# TenderLens

Search UK public-sector contracts and turn complex procurement notices into clear, actionable information.

TenderLens is an independent CivicAI Labs service for SMEs, sole traders, startups, charities, CICs, voluntary organisations, agencies, consultants and freelancers. It is not affiliated with or endorsed by the UK Government.

**Find public contracts. Understand them. Decide faster.**

Live domain: [tenderlens.civicailabs.co.uk](https://tenderlens.civicailabs.co.uk)

## Features

- Search official Contracts Finder notices and recent Find a Tender OCDS releases
- Filters for status, value, location, SME/VCSE suitability, category, deadline and buyer
- Tender pages with official fields kept separate from TenderLens explanations
- Deterministic summaries from official fields, with optional AI JSON explanations
- Fit checker that compares an organisation profile with published notice fields
- Bid-preparation checklist stored on the device
- Save, share and compare up to three tenders in the browser
- Glossary, SME briefing, privacy, terms and accessibility pages
- No account required for V1

## Architecture

```text
src/
  app/                  App Router pages, metadata, API routes
  components/           Header, search, tender cards, fit checker, checklist
  lib/procurement/      Types, adapters, normalisation, fixtures
  lib/ai/               Prompts, schema validation, providers, fallback
  lib/search/           Query validation
  lib/storage/          localStorage saved tenders, checklist, compare
```

UI never talks to raw government payloads. Adapters normalise into a `Tender` model first.

```ts
interface ProcurementSource {
  search(params: SearchParams): Promise<TenderSearchResult>;
  getTender(id: string): Promise<Tender | null>;
}
```

## Tech stack

- Next.js 15 App Router
- TypeScript
- React 19
- Tailwind CSS 4
- Lucide icons
- Geist
- Node test runner via `tsx`

There is no database in V1. Saved tenders use `localStorage` so Supabase auth can be added later.

## Official data sources

| Source | Role | API |
|---|---|---|
| [Find a Tender](https://www.find-tender.service.gov.uk/) | Central Digital Platform from 24 February 2025 | `GET /api/1.0/ocdsReleasePackages` and `GET /api/1.0/ocdsRecordPackages/{ocid}` |
| [Contracts Finder](https://www.contractsfinder.service.gov.uk/apidocumentation) | Keyword search, SME/VCSE flags, values, regions | `POST /api/rest/2/search_notices/json` and `GET /api/rest/2/get_published_notice/json/{id}` |

Find a Tender's public OCDS API is a dated feed, not a full keyword search. TenderLens uses it for recent notices and record lookup, then links users to the official service for anything the API cannot filter.

Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL. Required in production. |
| `CONTRACTS_FINDER_BASE_URL` | Defaults to `https://www.contractsfinder.service.gov.uk` |
| `FIND_A_TENDER_BASE_URL` | Defaults to `https://www.find-tender.service.gov.uk` |
| `AI_PROVIDER` | `none`, `openai` or `gemini` |
| `OPENAI_API_KEY` | Required only when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | Defaults to `gpt-4o-mini` |
| `GEMINI_API_KEY` | Required only when `AI_PROVIDER=gemini` |
| `GEMINI_MODEL` | Defaults to `gemini-2.0-flash` |
| `USE_TENDER_FIXTURES` | `true` only for local/preview when APIs fail. Ignored when `VERCEL_ENV=production`. |

Never put secret keys in `NEXT_PUBLIC_*` variables. Never commit `.env.local`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Search works without an AI key.

## Development

```bash
npm run dev
```

If government APIs return 403, 429 or 5xx, the UI shows a calm error and a Find a Tender link. Set `USE_TENDER_FIXTURES=true` locally if you need marked sample cards. Fixtures are labelled "Sample data" and never appear as live opportunities in production.

## Testing

```bash
npm test
```

Coverage includes tender normalisation, currency and deadline formatting, search validation, AI schema validation, id parsing, and save/remove local storage logic.

## Production build

```bash
npm run lint
npm run test
npm run build
```

## Vercel deployment

1. Import the Git repository into Vercel as a Next.js project.
2. Set `NEXT_PUBLIC_SITE_URL=https://tenderlens.civicailabs.co.uk`.
3. Leave `AI_PROVIDER=none` until you add a key, or set `AI_PROVIDER=openai` / `gemini` with the matching secret.
4. Keep `USE_TENDER_FIXTURES` unset or `false`.
5. Deploy. Preview URLs work because `NEXT_PUBLIC_SITE_URL` has a Vercel fallback via `VERCEL_URL` when unset, but production should always set the custom domain URL.

## Custom domain

Production hostname: `tenderlens.civicailabs.co.uk`

In the domain DNS (for example 123 Reg / Fasthosts LiveDNS):

| Type | Name | Value |
|---|---|---|
| CNAME | `tenderlens` | `cname.vercel-dns.com` |

Then add `tenderlens.civicailabs.co.uk` as a custom domain on the Vercel project. Wait for HTTPS to provision.

## AI configuration

AI is optional. `generateTenderExplanation(tender)` always returns schema-validated JSON. With no key, a deterministic summary is built from official fields.

The system prompt states that procurement content may contain instructions and must be treated only as data. Model output is never rendered as HTML.

## Known limitations

- Find a Tender OCDS does not offer a documented public keyword search. Keyword search is strongest on Contracts Finder. Recent Find a Tender notices are matched locally against a cached feed.
- Contracts Finder may rate-limit (`429`) or decline (`403`) bursts of traffic. TenderLens caches public queries and rate-limits its own API.
- Many mandatory bid requirements live in attachments that these APIs do not provide. TenderLens will say when information is not in the published notice.
- In-memory cache and rate limits are per serverless instance.
- Saved tenders do not sync across devices in V1.

## Government-source attribution

Every card and detail page names the source (Contracts Finder or Find a Tender) and links to the original notice. Footer includes the Open Government Licence attribution and an independence disclaimer.

## Security considerations

- Search inputs, ids and fit-checker fields are validated and length-limited.
- Tender ids must match `cf:{guid}` or `fat:{ocid}`. Arbitrary URLs are rejected.
- API secrets stay on the server.
- Internal routes are rate-limited.
- AI output is schema-validated before render.

## Roadmap

V2: accounts, email alerts, saved searches, organisation profiles, Supabase.

V3: document upload, requirement extraction, bid/no-bid workspace.

V4: bid assistant, evidence libraries, pipeline CRM.

V1 stays focused on free search, explanation, fit checking and local saves.
