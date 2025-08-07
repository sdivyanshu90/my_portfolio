import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Load Inter font for non-Apple devices
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default:
      "Divanshu Sharma - Full-stack Developer, ML Engineer & AI Engineer | Professional Portfolio",
    template: "%s | Divanshu Sharma Portfolio",
  },
  description:
    "Professional portfolio of Divanshu Sharma - Full-stack Developer, ML Engineer & AI Engineer. Research Consultant at WorldQuant BRAIN.",
  keywords: [
    "Divanshu Sharma",
    "Full-stack Developer",
    "Python Developer",
    "AI Engineer",
    "Portfolio",
    "Software Developer",
    "Machine Learning",
    "Web Development",
    "Next.js",
    "React",
    "FastAPI",
    "Django",
    "Automation",
    "LangChain",
    "AI Chatbot",
    "Professional Portfolio",
    "Developer Portfolio",
    "Tech Portfolio",
    "Internship",
    "Web Scraping",
    "API Development",
  ],
  authors: [
    {
      name: "Divanshu Sharma",
      url: "",
    },
  ],
  creator: "Divanshu Sharma",
  publisher: "Divanshu Sharma",
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
    url: "",
    title:
      "Divanshu Sharma - Full-stack Developer, ML Engineer & AI Engineer | Professional Portfolio",
    description:
      "Professional portfolio showcasing AI-powered projects, and full-stack development. Available for internships.",
    siteName: "Divanshu Sharma Portfolio",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Divanshu Sharma - Professional Portfolio with AI Chatbot",
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
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.svg?v=2",
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Portfolio Website",
  other: {
    "google-site-verification": "your-google-verification-code-here",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Divanshu Sharma",
              jobTitle: "Full-stack Developer, ML Engineer & AI Engineer",
              url: "",
              image: "./public/profile.jpg",
              sameAs: [
                "https://github.com/sdivyanshu90",
                "https://linkedin.com/in/divsha22",
              ],
              worksFor: {
                "@type": "Organization",
                name: "WorldQuant BRAIN",
              },
              alumniOf: {
                "@type": "Organization",
                name: "MU",
              },
              knowsAbout: [
                "Python Development",
                "AI Engineering",
                "Machine Learning",
                "Web Development",
                "Full Stack Development",
              ],
              description:
                "Full-stack Developer & AI Engineer with expertise in building AI-powered solutions. Research Consultant at WorldQuant BRAIN.",
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
