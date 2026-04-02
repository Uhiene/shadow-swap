import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrystalBackground from "@/components/CrystalBackground";
import GuardianTour from "@/components/GuardianTour";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShadowSwap — Trade Large. Stay Hidden.",
  description:
    "Decentralized confidential OTC trading. Hide your order sizes from MEV bots using iExec Nox confidential tokens.",
  keywords: ["OTC", "DeFi", "MEV protection", "confidential trading", "crypto"],
  icons: {
    icon: "/favicon-512x512.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body
        suppressHydrationWarning
        style={{
          background: "var(--bg-void)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body), Sora, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Providers>
          <CrystalBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <GuardianTour />
          </div>
        </Providers>
      </body>
    </html>
  );
}
