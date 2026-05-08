import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-JHS33Q7EMR";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "FitBMI AI",
  description: "AI-assisted BMI and health analysis",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased text-on-background">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
