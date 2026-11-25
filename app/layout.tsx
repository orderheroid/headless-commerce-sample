import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'

import { CartPill } from '@/components/layout/CartPill'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { storeName } from '@/lib/store'
import { THEME_COLOR, themeInitScript } from '@/lib/theme'

import './globals.css'

// Ganti font di sini. Satu keluarga untuk isi dan judul; judul (class font-display) dibuat tebal dan
// rapat di app/globals.css. Untuk font judul berbeda, muat font kedua dan isi variabel --font-heading.
const font = Geist({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const name = await storeName()
  return { title: { default: name, template: `%s | ${name}` }, description: `Produk digital dari ${name}` }
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: THEME_COLOR.light }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const name = await storeName()
  return (
    // data-theme dipasang skrip di <head> sebelum hidrasi, jadi atributnya memang berbeda dari HTML server.
    <html lang="id" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <SiteHeader storeName={name} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">{children}</main>
        <SiteFooter storeName={name} />
        <CartPill />
      </body>
    </html>
  )
}
