import type { Metadata } from "next";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";

import "./globals.css";

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",
    subsets: ["latin"],
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",
    subsets: ["latin"],
  });

export const metadata: Metadata = {
  title:
    "Schedula | Appointment operations starter",
  description:
    "A production-minded starter for doctor appointment booking workflows.",
};

const themeInitializationScript = `
(() => {
  try {
    const stored =
      localStorage.getItem("schedula:theme");

    const preference =
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
        ? stored
        : "system";

    const resolved =
      preference === "dark"
        ? "dark"
        : preference === "light"
          ? "light"
          : window.matchMedia(
              "(prefers-color-scheme: dark)",
            ).matches
            ? "dark"
            : "light";

    document.documentElement.dataset.theme =
      resolved;

    document.documentElement.style.colorScheme =
      resolved;
  } catch {
    document.documentElement.dataset.theme =
      "light";

    document.documentElement.style.colorScheme =
      "light";
  }
})();
`;

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="schedula-theme-initializer"
          strategy="beforeInteractive"
        >
          {themeInitializationScript}
        </Script>
      </head>

      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <Navbar />

          <div className="flex-1">
            {children}
          </div>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}