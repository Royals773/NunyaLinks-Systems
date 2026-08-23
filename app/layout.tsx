import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Fraunces } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// The only client component mounted on every route — code-split it out
// of the shared layout bundle. Still server-rendered (ssr defaults to
// true; next/dynamic's ssr: false isn't allowed from a Server Component
// like this layout), so there's no loading flash.
const AssistantWidget = dynamic(() => import("@/components/AssistantWidget"));

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display face for section headings only — body/UI copy stays on Inter.
// See .font-display in globals.css for where this gets applied.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const title = "NunyaLink Systems — Automate the busywork. Run the business.";
const description =
  "AI automation systems and mobile-first websites for SMEs. We find the work that's costing you, prove what it's worth to fix, and build the system that does it.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "NunyaLink Systems",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Organization structured data — kept as a plain object so it can be
// reused if more pages need to reference the same entity later.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "NunyaLink Systems",
  description,
  url: siteUrl,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning here (and on <html> above) only silences
          the attribute diff on these two nodes — it doesn't hide real
          mismatches elsewhere. Needed because browser extensions
          (Grammarly, QuillBot, etc.) inject data-* attributes onto
          <html>/<body> before React hydrates, which React otherwise flags
          as a mismatch even though nothing in our render is wrong. */}
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          // JSON.stringify output can't contain a literal "</script>" here since
          // the source object holds no user input, but escape defensively anyway.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        {children}
        <Footer />
        <AssistantWidget />
      </body>
    </html>
  );
}
