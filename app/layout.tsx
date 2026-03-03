import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-latin',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ملاعب | Malaaib',
  description: 'احجز ملعبك الآن — Réservez votre terrain maintenant',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} antialiased font-arabic`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
