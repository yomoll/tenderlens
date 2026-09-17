import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">About GovGuide AI</h1>
      <p className="mt-4 text-lg">
        Independent tool. Not affiliated with GOV.UK. Always check the linked official guidance.
      </p>
      <div className="mt-8 space-y-5 text-muted">
        <p>
          GovGuide AI is a portfolio and public-interest prototype. It helps people ask UK government questions in ordinary English, then points them back to the official pages.
        </p>
        <p>
          Content is read through the{" "}
          <a className="text-accent underline underline-offset-2" href="https://www.gov.uk/api/search.json?q=self+employed">
            GOV.UK Search API
          </a>{" "}
          and the{" "}
          <a className="text-accent underline underline-offset-2" href="https://content-api.publishing.service.gov.uk/">
            GOV.UK Content API
          </a>
          . Those APIs exist so applications can use published GOV.UK content without scraping the website.
        </p>
        <p>
          GOV.UK content is Crown copyright. This site does not use the Crown or GDS Transport. The colours follow the GOV.UK palette so official pages feel familiar, but this remains an independent tool.
        </p>
        <p>
          Questions are processed on this app’s server so it can call GOV.UK. Saved answers are stored only in your browser. If an OpenAI key is configured, retrieved excerpts may be sent to that model to write or translate the summary.
        </p>
        <p>
          Do not paste personal information such as National Insurance numbers, passport numbers, or login codes.
        </p>
      </div>
    </main>
  );
}
