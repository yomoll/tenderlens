"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { FitProfile, FitResult } from "@/lib/ai/schema";
import type { Tender } from "@/lib/procurement/types";

const TYPES: Array<{ id: FitProfile["organisationType"]; label: string }> = [
  { id: "sme", label: "SME" },
  { id: "sole-trader", label: "Sole trader" },
  { id: "charity", label: "Charity" },
  { id: "cic", label: "CIC" },
  { id: "large", label: "Large organisation" },
  { id: "other", label: "Other" },
];

export function FitChecker({ tender }: { tender: Tender }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitResult | null>(null);
  const [profile, setProfile] = useState<FitProfile>({
    organisationType: "sme",
    serviceArea: "",
    location: "",
  });

  function open() {
    trackEvent("fit_checker_started", { id: tender.id });
    dialog.current?.showModal();
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/tenders/${encodeURIComponent(tender.id)}/fit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "The fit check could not be completed.");
        return;
      }
      setResult(json.result as FitResult);
      trackEvent("fit_checker_completed", { id: tender.id });
    } catch {
      setError("The fit check could not be completed. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Is this tender worth exploring?</h2>
      <p className="mt-1 text-sm text-muted">
        Compare a few facts about your organisation with the published notice. This is not an eligibility decision.
      </p>
      <button type="button" className="mt-3 inline-flex min-h-11 items-center rounded-md bg-cta px-4 font-semibold text-cta-ink" onClick={open}>
        Check my fit
      </button>
      <dialog ref={dialog} className="w-[min(100%,40rem)] rounded-lg border border-line bg-surface p-0 text-ink">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <h3 className="text-xl font-semibold">Check my fit</h3>
          <p className="mt-1 text-sm text-muted">
            Details stay on this device unless an AI provider is configured, in which case they are sent temporarily to generate the
            comparison.
          </p>
          <form
            className="mt-4 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <fieldset>
              <legend className="text-sm font-semibold">Organisation type</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {TYPES.map((type) => (
                  <label key={type.id} className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="org-type"
                      checked={profile.organisationType === type.id}
                      onChange={() => setProfile({ ...profile, organisationType: type.id })}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Business/service area" value={profile.serviceArea} onChange={(serviceArea) => setProfile({ ...profile, serviceArea })} required />
            <Field label="Location" value={profile.location} onChange={(location) => setProfile({ ...profile, location })} required />
            <Field label="Approximate organisation size" optional value={profile.size || ""} onChange={(size) => setProfile({ ...profile, size })} />
            <Field label="Relevant experience" optional value={profile.experience || ""} onChange={(experience) => setProfile({ ...profile, experience })} />
            <Field label="Optional annual turnover range" optional value={profile.turnover || ""} onChange={(turnover) => setProfile({ ...profile, turnover })} />
            <div>
              <label className="text-sm font-semibold" htmlFor="org-desc">
                Tell us what your organisation does
              </label>
              <textarea
                id="org-desc"
                className="mt-1 min-h-24 w-full rounded-md border border-line bg-surface p-3"
                value={profile.description || ""}
                onChange={(event) => setProfile({ ...profile, description: event.target.value })}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="sticky bottom-0 z-10 -mx-6 mt-2 flex flex-wrap gap-3 border-t border-line bg-surface px-6 py-3">
              <button type="submit" className="min-h-11 rounded-md bg-cta px-4 font-semibold text-cta-ink" disabled={busy}>
                {busy ? "Checking" : "Compare with this notice"}
              </button>
              <button type="button" className="min-h-11 rounded-md border border-line px-4" onClick={() => dialog.current?.close()}>
                Close
              </button>
            </div>
          </form>
          {result ? (
            <div className="mt-6 space-y-4 border-t border-line pt-4">
              <p className="text-sm font-semibold">
                Label: {result.verdictLabel}
              </p>
              <FitList title="Strong alignment" items={result.alignment} />
              <FitList title="Things to check" items={result.checks} />
              <FitList title="Questions to answer before bidding" items={result.questions} />
              <div>
                <h4 className="font-semibold">Suggested next step</h4>
                <p className="mt-1 text-sm">{result.suggestedNextStep}</p>
              </div>
              <p className="text-xs text-muted">{result.disclaimer}</p>
            </div>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  optional = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
        {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
      </label>
      <input
        id={id}
        required={required}
        className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
