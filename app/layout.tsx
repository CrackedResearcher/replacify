import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://replacify.vercel.app"),
  title: "Thats Replacify",
  description:
    "because AI is coming for everything — and we thought it’d be fun to tell you if your job is next.",
  openGraph: {
    title: "Thats Replacify",
    description:
      "because AI is coming for everything — and we thought it’d be fun to tell you if your job is next.",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Replacify AI Job Predictions",
      },
    ],
    siteName: "Replacify",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thats Replacify",
    description:
      "because AI is coming for everything — and we thought it’d be fun to tell you if your job is next.",
    images: ["/opengraph.png"],
  },
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
        <Toaster  />
      </body>
    </html>
  );
}
