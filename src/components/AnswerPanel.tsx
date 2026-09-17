"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookmarkSimple,
  CheckSquare,
  Copy,
  Link as LinkIcon,
  Printer,
  ShareNetwork,
  Translate,
} from "@phosphor-icons/react";
import { LANGUAGES } from "@/lib/languages";
import { answerAsPlainText, isSaved, saveAnswer, shareUrlFor } from "@/lib/storage";
import type { AskAnswer } from "@/lib/types";

export function AnswerPanel({ answer }: { answer: AskAnswer }) {
  const [current, setCurrent] = useState(answer);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const dir = current.language === "ar" || current.language === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    setCurrent(answer);
    setSaved(isSaved(answer.question));
  }, [answer]);

  const generatedLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(current.generatedAt));
    } catch {
      return current.generatedAt;
    }
  }, [current.generatedAt]);

  async function onSave() {
    saveAnswer(current);
    setSaved(true);
    setStatus("Saved on this device.");
  }

  async function onCopyLink() {
    await navigator.clipboard.writeText(shareUrlFor(current.question));
    setStatus("Link copied. Anyone with the link can run this question again.");
  }

  async function onCopyText() {
    await navigator.clipboard.writeText(answerAsPlainText(current));
    setStatus("Answer copied as text.");
  }

  async function onShare() {
    const url = shareUrlFor(current.question);
    if (navigator.share) {
      await navigator.share({
        title: "GovGuide AI",
        text: current.question,
        url,
      });
      return;
    }
    await onCopyLink();
  }

  async function onTranslate(code: string) {
    const language = LANGUAGES.find((item) => item.code === code);
    if (!language) return;
    if (language.code === "en") {
      setCurrent(answer);
      return;
    }
    setTranslating(true);
    setStatus(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, language: language.code }),
      });
      const data = (await response.json()) as { answer?: AskAnswer; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error || "Translation failed.");
      }
      setCurrent(data.answer);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Translation failed.");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <article className="space-y-6" lang={current.language} dir={dir}>
      <header className="border border-line bg-surface p-5 md:p-7">
        <p className="text-sm text-muted">What we understood</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{current.interpretation}</h2>
        <p className="mt-3 text-sm text-muted">
          Answer prepared {generatedLabel}. Method: {current.mode === "generative" ? "AI summary of retrieved pages" : "plain-English extract from retrieved pages"}.
        </p>
      </header>

      <section className="border border-line bg-surface p-5 md:p-7">
        <h3 className="text-xl font-bold">Plain-English summary</h3>
        <div className="prose-answer mt-4 max-w-[65ch]">
          {current.paragraphs.map((paragraph, index) => (
            <p key={`${current.id}-p${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="border border-line bg-surface p-5 md:p-7">
        <div className="flex items-center gap-2">
          <CheckSquare size={22} weight="bold" aria-hidden="true" />
          <h3 className="text-xl font-bold">What you may need to do</h3>
        </div>
        <ol className="mt-4 space-y-3">
          {current.checklist.map((item, index) => (
            <li key={item.id} className="border border-line bg-warn-bg px-4 py-3">
              <p className="font-medium">
                <span className="mr-2 text-muted">{index + 1}.</span>
                {item.title}
              </p>
              {item.detail ? <p className="mt-1 text-sm text-muted">{item.detail}</p> : null}
              <p className="mt-2 text-xs text-muted">Sources: {item.sourceIds.join(", ")}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border border-line bg-surface p-5 md:p-7">
        <h3 className="text-xl font-bold">Official source links</h3>
        <ul className="mt-4 divide-y divide-line">
          {current.sources.map((source) => (
            <li key={source.id} className="py-4 first:pt-0 last:pb-0">
              <p className="text-xs font-semibold tracking-wide text-muted">{source.id}</p>
              <a
                className="mt-1 inline-flex text-base font-bold text-accent underline-offset-4 hover:text-accent-hover hover:underline"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                {source.title}
              </a>
              <p className="mt-1 text-sm text-muted">
                {source.organisation ? `${source.organisation}. ` : ""}
                {source.documentType}
                {source.updatedAt ? `. Updated ${source.updatedAt.slice(0, 10)}` : ""}
              </p>
              <p className="mt-2 max-w-[70ch] text-sm">{source.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="no-print border border-line bg-surface p-5 md:p-7">
        <h3 className="text-xl font-bold">Save, share, or translate</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton onClick={onSave} icon={<BookmarkSimple size={18} weight="bold" />} label={saved ? "Saved" : "Save"} />
          <ActionButton onClick={onShare} icon={<ShareNetwork size={18} weight="bold" />} label="Share" />
          <ActionButton onClick={onCopyLink} icon={<LinkIcon size={18} weight="bold" />} label="Copy link" />
          <ActionButton onClick={onCopyText} icon={<Copy size={18} weight="bold" />} label="Copy text" />
          <ActionButton onClick={() => window.print()} icon={<Printer size={18} weight="bold" />} label="Print" />
        </div>
        <div className="mt-5 max-w-sm">
          <label htmlFor="language" className="flex items-center gap-2 text-sm font-medium">
            <Translate size={18} weight="bold" aria-hidden="true" />
            Answer language
          </label>
          <select
            id="language"
            className="mt-2 w-full border border-ink bg-paper px-3 py-2.5 text-ink"
            value={current.language}
            disabled={translating}
            onChange={(event) => void onTranslate(event.target.value)}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeName}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-muted">
            Official GOV.UK links stay in English. Translations are optional and may need an API key.
          </p>
        </div>
        {translating ? <p className="mt-3 text-sm">Translating…</p> : null}
        {status ? (
          <p className="mt-3 text-sm" role="status">
            {status}
          </p>
        ) : null}
      </section>

      <details className="border border-line bg-surface p-5 text-sm">
        <summary className="cursor-pointer font-medium">What we searched</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
          {current.queries.map((query) => (
            <li key={query}>{query}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 border border-ink bg-paper px-3 py-2 text-sm font-bold hover:bg-warn-bg active:scale-[0.99]"
    >
      {icon}
      {label}
    </button>
  );
}
