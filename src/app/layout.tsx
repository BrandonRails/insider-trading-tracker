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

export const metadata: Metadata = {
  title: "Insider Pulse - Track Insider & Politician Trades in Real Time",
  description: "Stay ahead of the market with actionable insights from insider and politician trades. Real-time SEC filings and financial disclosures.",
  keywords: "insider trading, politician trades, SEC filings, congress trades, stock trades, financial analytics, market insights",
  authors: [{ name: "Insider Pulse Team" }],
  openGraph: {
    title: "Insider Pulse - Track Insider & Politician Trades in Real Time",
    description: "Stay ahead of the market with actionable insights from insider and politician trades",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insider Pulse - Track Insider & Politician Trades in Real Time",
    description: "Stay ahead of the market with actionable insights from insider and politician trades",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
