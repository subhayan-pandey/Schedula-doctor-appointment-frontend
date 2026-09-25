"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ChatbotProvider from "@/app/ChatbotProvider";

/**
 * The Admin Portal has its own layout (Sidebar + Header, from Phase 1C)
 * and no use for the public site's Navbar, Footer, or support chat
 * widget. Everything else in the root layout (ReduxProvider,
 * ThemeProvider, ToastContainer, the theme-init script) still applies
 * to /admin/* routes as normal — only this public chrome is gated.
 */
export default function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <>
      <Navbar />

      <div className="flex-1">{children}</div>

      <Footer />

      <ChatbotProvider />
    </>
  );
}
