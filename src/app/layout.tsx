import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DomainProvider } from "@/lib/domain-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Malaaib — Football Field Booking",
  description: "Search and book football fields near you",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const isPro = host.startsWith("pro.");

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <DomainProvider isPro={isPro}>
            {!isPro && <Navbar />}
            <main className={isPro ? "flex-1" : "flex-1 max-w-6xl mx-auto w-full px-4 py-6"}>{children}</main>
            {!isPro && <Footer />}
          </DomainProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
