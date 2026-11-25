'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'
import { THEME_COLOR, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}

/** Berlangganan perubahan atribut data-theme di <html>. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

/** Tombol terang/gelap di header. Tema awal sudah dipasang skrip di <head> (lib/theme.ts). */
export function ThemeToggle() {
  // null saat render server: ikon baru ditentukan setelah terpasang di browser.
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, currentTheme, () => null)

  useEffect(() => {
    // Tanpa pilihan tersimpan, ikuti perubahan pengaturan perangkat secara langsung.
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null
      try {
        saved = localStorage.getItem(THEME_STORAGE_KEY)
      } catch {}
      if (!saved) apply(e.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
  }

  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {/* Kedua ikon dirender; yang aktif muncul dengan putaran halus. */}
      <SunIcon className={cn('absolute h-5 w-5 transition-all duration-300', dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0')} />
      <MoonIcon className={cn('absolute h-5 w-5 transition-all duration-300', dark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
    </button>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}
