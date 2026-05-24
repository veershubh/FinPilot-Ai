import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FinPilot AI - Your AI Co-Pilot for Smarter Financial Decisions",
  description:
    "Master your money with precision-engineered AI intelligence. Seamlessly track expenses, optimize EMIs, and build a future-proof budget with real-time financial insights.",
  keywords: "fintech, AI, financial planning, EMI calculator, budget planner, expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
