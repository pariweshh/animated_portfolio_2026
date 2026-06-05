import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://yourportfolio.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pariwesh Tamrakar — AI Engineer & Developer",
  description:
    "AI Engineer and Developer specializing in React, Next.js, TypeScript, and Generative AI. Explore an immersive 3D WebGL portfolio.",
  authors: [{ name: "Pariwesh Tamrakar" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Pariwesh Tamrakar — AI Engineer & Developer",
    description:
      "AI Engineer and Developer specializing in React, Next.js, TypeScript, and Generative AI. Explore an immersive 3D WebGL portfolio.",
    siteName: "Pariwesh Tamrakar Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pariwesh Tamrakar — AI Engineer & Developer",
    description:
      "AI Engineer and Developer specializing in React, Next.js, TypeScript, and Generative AI. Explore an immersive 3D WebGL portfolio.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Pariwesh Tamrakar",
    jobTitle: "AI Engineer & Developer",
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Three.js",
      "Node.js",
      "Python",
      "Generative AI",
      "Claude Code",
      "Redux",
    ],
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
