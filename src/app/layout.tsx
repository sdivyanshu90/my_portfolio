import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { getConfig } from "@/lib/config-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Load Inter font for non-Apple devices
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

const config = getConfig();
const siteUrl = config.meta.siteUrl;
const ogImageUrl = new URL(config.meta.ogImage, siteUrl).toString();
const socialLinks = Object.values(config.social).filter(Boolean);
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: config.personal.name,
  jobTitle: config.personal.title,
  url: siteUrl,
  image: new URL(config.personal.avatar, siteUrl).toString(),
  sameAs: socialLinks,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: config.education.completed1.institution,
  },
  worksFor: config.experience[0]
    ? {
        "@type": "Organization",
        name: config.experience[0].company,
      }
    : undefined,
  knowsAbout: [
    ...config.skills.programming.slice(0, 4),
    ...config.skills.ml_ai.slice(0, 6),
    ...config.skills.web_development.slice(0, 4),
  ],
  description: config.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${config.personal.name} - ${config.personal.title}`,
    template: `%s | ${config.personal.name}`,
  },
  description: config.meta.description,
  keywords: [
    config.personal.name,
    ...config.personal.targetRoles,
    ...config.skills.ml_ai.slice(0, 8),
    ...config.skills.web_development.slice(0, 6),
  ],
  authors: [
    {
      name: config.personal.name,
      url: siteUrl,
    },
  ],
  creator: config.personal.name,
  publisher: config.personal.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: `${config.personal.name} - ${config.personal.title}`,
    description: config.meta.description,
    siteName: `${config.personal.name} Portfolio`,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${config.personal.name} portfolio preview`,
        type: "image/png",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Portfolio Website",
  verification: config.meta.googleSiteVerification
    ? {
        google: config.meta.googleSiteVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          spaceGrotesk.variable,
          jetbrainsMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <main className="flex min-h-screen flex-col">{children}</main>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
