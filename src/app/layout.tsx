import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "GovGuide AI",
    template: "%s | GovGuide AI",
  },
  description: "Ask government information in normal English. Independent tool. Not affiliated with GOV.UK.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sourceSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("govguide.theme")==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-[100dvh] flex-col bg-paper font-sans text-ink antialiased">
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        <DisclaimerBanner />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
