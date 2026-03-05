import { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono, Geist } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-latin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

const geist = Geist({
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ملاعب | Malaaib",
  description: "احجز ملعبك الآن — Réservez votre terrain maintenant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geist.variable} ${ibmPlexMono.variable} ${ibmPlexSansArabic.variable} antialiased font-arabic`}
      >
        {children}
      </body>
    </html>
  );
}
