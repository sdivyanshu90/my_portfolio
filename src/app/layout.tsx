import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { personal, site, socials } from "@/data/portfolio";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: personal.name,
  jobTitle: personal.roles.join(", "),
  worksFor: { "@type": "Organization", name: "Uniiq", url: "https://uniiq.ai" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Mumbai" },
  email: `mailto:${personal.email}`,
  url: site.url,
  image: new URL(personal.avatar, site.url).toString(),
  sameAs: socials.map((s) => s.href),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Navi Mumbai",
    addressCountry: "IN",
  },
  knowsAbout: [
    "Machine Learning",
    "Deep Learning",
    "LLM Systems",
    "Multi-Party Computation",
    "PyTorch",
    "Quantitative Research",
    "MLOps",
  ],
  description: site.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${personal.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  authors: [{ name: personal.name, url: site.url }],
  creator: personal.name,
  keywords: [
    personal.name,
    "Machine Learning Engineer",
    "AI Engineer",
    "LLM systems",
    "MLOps",
    "PyTorch",
    "multi-party computation",
    "from scratch",
    "Uniiq",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: personal.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${newsreader.variable} ${plexMono.variable} min-h-screen bg-paper font-serif text-ink antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
