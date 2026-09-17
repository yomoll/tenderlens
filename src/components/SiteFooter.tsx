import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm font-semibold">GovGuide AI</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            An independent explainer that searches GOV.UK through official APIs. It is not a government
            service and does not replace GOV.UK.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Official sources</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li>
              <a className="text-accent underline underline-offset-4 hover:text-accent-hover" href="https://www.gov.uk">
                GOV.UK
              </a>
            </li>
            <li>
              <a
                className="text-accent underline underline-offset-4 hover:text-accent-hover"
                href="https://content-api.publishing.service.gov.uk/"
              >
                GOV.UK Content API
              </a>
            </li>
          </ul>
          <p className="mt-4">
            <Link className="text-accent underline underline-offset-4 hover:text-accent-hover" href="/about">
              About this tool
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
