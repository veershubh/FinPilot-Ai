import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/layout/Navbar';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Toaster } from 'sonner';

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
    <html lang="en" className="dark bg-gradient-primary min-h-screen">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <PageWrapper title="FinPilot AI">
          {children}
        </PageWrapper>
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
