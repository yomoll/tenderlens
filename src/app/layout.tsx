import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getMetadataBase, INDEPENDENCE_DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "TenderLens | Understand UK Public Sector Tenders",
    template: "%s | TenderLens",
  },
  description:
    "Search UK public-sector contracts and turn complex procurement notices into clear, actionable information for SMEs, charities and growing organisations.",
  applicationName: "TenderLens",
  authors: [{ name: "CivicAI Labs" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "TenderLens",
    title: "TenderLens | Understand UK Public Sector Tenders",
    description:
      "Search UK public-sector contracts and turn complex procurement notices into clear, actionable information for SMEs, charities and growing organisations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TenderLens | Understand UK Public Sector Tenders",
    description:
      "Search UK public-sector contracts and turn complex procurement notices into clear, actionable information.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("tenderlens.theme")==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${GeistSans.className} flex min-h-[100dvh] flex-col bg-paper text-ink antialiased`}>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header />
        <div className="flex-1">{children}</div>
        <p className="sr-only">{INDEPENDENCE_DISCLAIMER}</p>
        <Footer />
      </body>
    </html>
  );
}
