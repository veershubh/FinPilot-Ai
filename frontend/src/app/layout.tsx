import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinPilot AI - Intelligent Financial Planning",
  description:
    "AI-powered financial planning system that helps you make smarter decisions about purchases, EMIs, budgets, and financial goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen">
          {/* Fixed sidebar */}
          <Sidebar />

          {/* Main content area — offset by sidebar width */}
          <main className="flex-1 ml-64">
            <Header />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
