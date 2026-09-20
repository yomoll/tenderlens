# GovGuide AI

Ask government information in normal English.

Independent tool. Not affiliated with GOV.UK. Always check the linked official guidance.

A retrieval-augmented explainer over official GOV.UK APIs: interpret the question, search, read the pages, then write a cited plain-English answer. No scraping.

## Stack

- Next.js 15 (App Router) and TypeScript
- GOV.UK Search API and Content API
- Optional OpenAI for summaries and translations
- Source Sans 3 with a GOV.UK-inspired palette (not GDS Transport, not the Crown)

## Pipeline

```text
question
  → interpret (topic pack + search queries)
  → GET /api/search.json
  → GET /api/content/{path}
  → summarise (OpenAI if OPENAI_API_KEY is set, otherwise extractive)
  → answer + checklist + official links
```

The model may only use retrieved page text. Every checklist item cites a source id such as `S1`.

## Live site

[https://govguide.civicailabs.co.uk](https://govguide.civicailabs.co.uk)

Set `NEXT_PUBLIC_SITE_URL=https://govguide.civicailabs.co.uk` in the host environment, plus `OPENAI_API_KEY` if you want generative summaries.

DNS for the subdomain (123 Reg / Fasthosts LiveDNS):

| Type | Name | Value |
|---|---|---|
| CNAME | `govguide` | `cname.vercel-dns.com` |

Then attach `govguide.civicailabs.co.uk` as a custom domain on the Vercel project for [yomoll/govguide-ai](https://github.com/yomoll/govguide-ai).

## Run locally

```bash
npm install
cp .env.example .env.local
# Put OPENAI_API_KEY in .env.local. Do not commit that file.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a key the app still searches GOV.UK and writes an extractive summary.

```bash
npm test
```

## What to look at

- `src/lib/rag/interpret.ts` — everyday language → queries and preferred paths
- `src/lib/rag/retrieve.ts` — search, fetch, rank, drop off-topic pages
- `src/lib/rag/generate.ts` — cited summary, with extractive fallback
- `src/app/api/ask/route.ts` — streamed ask endpoint
