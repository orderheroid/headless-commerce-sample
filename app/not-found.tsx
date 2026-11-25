import { ButtonLink } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-8xl leading-none text-accent-faint">404</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-fg-muted">Produk atau pesanan yang kamu cari tidak ada, atau tautannya sudah berubah.</p>
      <ButtonLink href="/" className="mt-6">
        Lihat semua produk
      </ButtonLink>
    </div>
  )
}
