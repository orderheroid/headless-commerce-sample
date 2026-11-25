import { Icon, type IconName } from '@/components/ui'
import { cn } from '@/lib/cn'

export type StatusView = 'awaiting_payment' | 'awaiting_verification' | 'delivering' | 'delivery_delayed' | 'delivered' | 'paid_no_delivery' | 'closed'

const VIEWS: Record<StatusView, { icon: IconName; tone: string; title: string; body: React.ReactNode }> = {
  awaiting_payment: {
    icon: 'clock',
    tone: 'bg-accent-soft text-accent-strong',
    title: 'Menunggu pembayaran',
    body: 'Selesaikan pembayaran di bawah. Halaman ini diperbarui otomatis begitu pembayaranmu masuk.',
  },
  awaiting_verification: {
    icon: 'clock',
    tone: 'bg-accent-soft text-accent-strong',
    title: 'Menunggu verifikasi penjual',
    body: 'Konfirmasi transfermu sudah diterima. Verifikasi dilakukan manual oleh penjual dan bisa memakan waktu beberapa jam.',
  },
  delivering: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Pembayaran diterima',
    body: (
      <>
        Produkmu sedang dikirim ke <strong>email</strong> dan <strong>WhatsApp</strong> yang kamu isi saat memesan, biasanya dalam beberapa menit.
      </>
    ),
  },
  delivered: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Pembayaran diterima, produk sudah dikirim',
    body: (
      <>
        Cek <strong>email</strong> dan <strong>WhatsApp</strong> yang kamu isi saat memesan. Bila belum terlihat, periksa juga folder spam atau promosi.
      </>
    ),
  },
  delivery_delayed: {
    icon: 'alert',
    tone: 'bg-warning-soft text-warning',
    title: 'Pembayaran diterima, pengiriman tertunda',
    body: (
      <>
        Pengiriman produkmu masih diproses. Cek <strong>email</strong> dan <strong>WhatsApp</strong> (termasuk folder spam). Bila belum masuk juga,
        hubungi toko dengan menyebutkan nomor pesanan di atas.
      </>
    ),
  },
  paid_no_delivery: {
    icon: 'check-circle',
    tone: 'bg-success-soft text-success',
    title: 'Pembayaran diterima',
    body: 'Terima kasih! Pesananmu sudah kami terima.',
  },
  closed: {
    icon: 'info',
    tone: 'bg-muted text-fg',
    title: 'Pesanan ditutup',
    body: 'Batas waktu pembayaran sudah lewat atau pesanan dibatalkan. Tidak perlu membayar pesanan ini; silakan buat pesanan baru bila masih ingin membeli.',
  },
}

export function StatusBanner({ view }: { view: StatusView }) {
  const v = VIEWS[view]
  return (
    <div className={cn('flex gap-3 rounded-xl p-4', v.tone)} role="status" aria-live="polite">
      <Icon name={v.icon} className="mt-0.5 h-6 w-6 shrink-0" />
      <div>
        <p className="font-semibold">{v.title}</p>
        <p className="mt-1 text-sm">{v.body}</p>
      </div>
    </div>
  )
}
