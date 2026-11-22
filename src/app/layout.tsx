import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { CAMPAIGN_THEMES } from "@/core/constants/lookup.constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Products Lookup — Multi-Engine Catalog & Citation Inspector",
  description:
    "Audit product visibility, pricing accuracy, and source citations across AI search engines.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-campaign={CAMPAIGN_THEMES.BLACK_FRIDAY}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
