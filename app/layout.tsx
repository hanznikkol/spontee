import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spontee.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spontee — Make Group Decisions Together",
    template: "%s | Spontee",
  },
  description:
    "Spontee makes group decisions easy. Create a room, invite your friends, and vote together to find one recommendation everyone can agree on.",
  keywords: [
    "group decision making",
    "where to eat",
    "group voting app",
    "swipe to decide",
    "restaurant picker",
    "hangout decider",
    "spontee",
  ],
  authors: [
    {
      name: "Hanz Nikkol Maas",
      url: "https://hanznikkolmaas.vercel.app",
    },
  ],
  creator: "Hanz Nikkol Maas",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Spontee",
    title: "Spontee — Make Group Decisions Together",
    description:
      "Spontee makes group decisions easy. Create a room, invite your friends, and vote together to find one recommendation everyone can agree on.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Spontee — Make Group Decisions Together",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Spontee — Make Group Decisions Together",
    description:
      "Spontee makes group decisions easy. Create a room, invite your friends, and vote together to find one recommendation everyone can agree on.",
    images: ["/icon-512.png"],
    creator: "@hanznikkol",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className=" min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
