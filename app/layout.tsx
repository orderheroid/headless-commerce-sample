import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'

import { CartPill } from '@/components/layout/CartPill'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { storeName } from '@/lib/store'
import { THEME_COLOR, themeInitScript } from '@/lib/theme'

import './globals.css'

// Change the font here. One family for body and headings; headings (class font-display) are made bold and
// tight in app/globals.css. For a different heading font, load a second font and set the --font-heading variable.
const font = Geist({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const name = await storeName()
  return { title: { default: name, template: `%s | ${name}` }, description: `Digital products from ${name}` }
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: THEME_COLOR.light }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const name = await storeName()
  return (
    // data-theme is set by a script in <head> before hydration, so the attribute intentionally differs from the server HTML.
    <html lang="en" className={font.variable} suppressHydrationWarning>
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
