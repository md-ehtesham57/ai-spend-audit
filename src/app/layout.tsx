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
  title: "AI Spend Audit — Find out where you're overspending on AI tools",
  description:
    "Free tool for startup founders and engineering managers to audit their AI tool spend and find savings.",
  openGraph: {
    title: "AI Spend Audit",
    description: "Find out where you're overspending on AI tools — in 60 seconds.",
    type: "website",
    siteName: "AI Spend Audit",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit",
    description: "Find out where you're overspending on AI tools — in 60 seconds.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
