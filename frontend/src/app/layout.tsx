import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "StudyPulse AI",
  description: "Adaptive study planner for students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('studypulse-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
      </head>
      <body className={`${manrope.variable} ${playfair.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
