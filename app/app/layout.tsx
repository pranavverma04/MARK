import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
import Shell from "@/components/Shell";
import Preloader from "@/components/Preloader";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], axes: ["opsz"] });
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "MARK",
  description:
    "MARK reads every document in an AICTE application, proves it is real, checks it against the Approval Process Handbook, and shows the reviewer exactly why. Ghost faculty, edited affidavits and land mismatches surface in seconds, with evidence.",
  applicationName: "MARK",
  icons: { icon: "/brand/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#efe8da",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-[var(--sheet-strong)] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Background />
        <Shell>{children}</Shell>
        <Preloader />
      </body>
    </html>
  );
}
