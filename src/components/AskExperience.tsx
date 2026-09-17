"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Baby,
  Briefcase,
  Car,
  IdentificationCard,
} from "@phosphor-icons/react";
import { EXAMPLE_QUESTIONS } from "@/lib/examples";
import type { AskAnswer, StreamEvent } from "@/lib/types";
import { AnswerPanel } from "./AnswerPanel";

type Stage = "idle" | "interpret" | "search" | "retrieve" | "answer" | "error";

const STAGE_LABEL: Record<Exclude<Stage, "idle" | "answer">, string> = {
  interpret: "Understanding your question",
  search: "Searching GOV.UK content",
  retrieve: "Reading official pages",
  error: "Something went wrong",
};

const ICONS = {
  briefcase: Briefcase,
  id: IdentificationCard,
  car: Car,
  child: Baby,
};

export function AskExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [question, setQuestion] = useState(initial);
  const [stage, setStage] = useState<Stage>(initial ? "interpret" : "idle");
  const [statusDetail, setStatusDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const askedRef = useRef<string | null>(null);

  useEffect(() => {
    if (initial && askedRef.current !== initial) {
      void submitQuestion(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    if (!answer) return;
    const node = document.getElementById("answer");
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [answer]);

  async function submitQuestion(value: string) {
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (cleaned.length < 8) {
      setError("Enter a question of at least a few words.");
      setStage("error");
      return;
    }

    askedRef.current = cleaned;
    setQuestion(cleaned);
    setError(null);
    setAnswer(null);
    setStage("interpret");
    setStatusDetail("");
    router.replace(`/?q=${encodeURIComponent(cleaned)}`);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleaned }),
      });
      if (!response.ok || !response.body) {
        throw new Error("The search could not start. Try again in a moment.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          if (event.stage === "interpret") {
            setStage("interpret");
            setStatusDetail(event.interpretation.interpretation);
          } else if (event.stage === "search") {
            setStage("search");
            setStatusDetail(`${event.hitCount} matching pages found across ${event.queries.length} searches.`);
          } else if (event.stage === "retrieve") {
            setStage("retrieve");
            setStatusDetail(event.titles.slice(0, 3).join("; "));
          } else if (event.stage === "answer") {
            setAnswer(event.answer);
            setStage("answer");
          } else if (event.stage === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "The question could not be answered.");
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submitQuestion(question);
  }

  const busy = stage === "interpret" || stage === "search" || stage === "retrieve";

  return (
    <div>
      <section className="bg-paper">
        <div className="mx-auto max-w-[40rem] px-4 pb-24 pt-16 text-center md:pb-28 md:pt-20">
          <h1 className="text-[2.15rem] font-bold leading-[1.15] tracking-tight md:text-5xl">
            Ask government information in normal English.
          </h1>
          <p className="mx-auto mt-4 max-w-[32rem] text-lg text-muted">
            Search official GOV.UK pages, then get a plain-English summary with links to check.
          </p>

          <form className="mt-8 text-left" onSubmit={onSubmit}>
            <label htmlFor="question" className="block text-base font-bold">
              Your question
            </label>
            <p id="question-help" className="mt-1 text-base text-muted">
              Write it the way you would ask a person. Do not include National Insurance numbers, passwords, or other personal details.
            </p>
            <div className="mt-3 border-2 border-ink bg-surface focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-0 focus-within:outline-[var(--focus)]">
              <textarea
                id="question"
                name="question"
                rows={3}
                required
                minLength={8}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    void submitQuestion(question);
                  }
                }}
                aria-describedby="question-help"
                className="w-full resize-y border-0 bg-transparent px-4 py-3 text-[1.1875rem] text-ink outline-none placeholder:text-muted"
                placeholder="Ask in your own words"
              />
              <div className="flex justify-end border-t border-line px-3 py-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-cta px-5 py-2.5 font-bold text-on-cta hover:bg-cta-hover active:scale-[0.99] disabled:opacity-60"
                  disabled={busy}
                >
                  Ask
                  <ArrowRight size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>

          {stage === "idle" || stage === "error" ? (
            <ul className="mt-7 space-y-0.5 text-left">
              {EXAMPLE_QUESTIONS.map((example) => {
                const Icon = ICONS[example.icon];
                return (
                  <li key={example.text}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-1 py-2.5 text-left text-[1.05rem] leading-snug text-ink hover:text-brand"
                      onClick={() => void submitQuestion(example.text)}
                    >
                      <Icon size={20} weight="regular" className="shrink-0 text-brand" aria-hidden="true" />
                      <span>{example.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>

      <div id="answer" className="mx-auto max-w-3xl scroll-mt-6 px-4 pb-12">
        {stage !== "idle" && stage !== "answer" ? (
          <div className="border border-line bg-surface p-6" aria-live="polite">
            <p className="text-base font-bold text-accent">{STAGE_LABEL[stage]}</p>
            <div className="mt-4 space-y-3" aria-hidden="true">
              <div className="h-5 w-2/3 animate-pulse bg-warn-bg" />
              <div className="h-5 w-full animate-pulse bg-warn-bg" />
              <div className="h-5 w-5/6 animate-pulse bg-warn-bg" />
            </div>
            {statusDetail ? <p className="mt-4 text-base text-muted">{statusDetail}</p> : null}
            {error ? (
              <p className="mt-4 text-base font-bold text-warn-ink" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        {answer && stage === "answer" ? <AnswerPanel answer={answer} /> : null}
      </div>
    </div>
  );
}
