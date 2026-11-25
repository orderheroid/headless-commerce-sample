// =============================================================================
// Pengaturan toko. Ubah di sini dulu sebelum mengubah komponen.
// Warna ada di app/globals.css (@theme → --color-brand-*), font di app/layout.tsx.
// =============================================================================

export const site = {
  /** Dipakai bila GET /meta belum punya `store_name` (isi Profil Bisnis di dashboard OrderHero). */
  fallbackName: 'Toko Digital',
  /** Format angka dan tanggal. */
  locale: 'id-ID',
  timeZone: 'Asia/Jakarta',

  home: {
    /** Teks kecil di atas judul; `{store}` diganti nama toko. */
    eyebrow: 'Toko digital {store}',
    /** Judul dua bagian: bagian kedua dicetak miring dengan garis stabilo. */
    title: 'Produk digital,',
    titleAccent: 'langsung sampai.',
    subtitle: 'Pilih produk, bayar dengan cara yang kamu suka, dan terima produknya otomatis di email dan WhatsApp-mu.',
    primaryCta: 'Lihat produk',
    secondaryCta: 'Cara beli',
    featuredTitle: 'Pilihan unggulan',
    featuredCount: 6,
    catalogTitle: 'Semua produk',
    searchPlaceholder: 'Cari produk…',
    /** Produk yang ditampilkan per langkah scroll di katalog. */
    pageSize: 12,
    howToBuyTitle: 'Cara beli',
    howToBuy: [
      { title: 'Pilih produk', text: 'Tambahkan produk ke keranjang, lalu buka checkout.' },
      { title: 'Bayar', text: 'Scan QRIS, transfer ke virtual account, atau bayar di gerai.' },
      { title: 'Terima produk', text: 'Produk dikirim otomatis ke email dan WhatsApp-mu setelah lunas.' },
    ],
  },

  /** Poin kepercayaan yang tampil di halaman produk dan checkout. */
  assurances: [
    { icon: 'bolt', text: 'Dikirim otomatis setelah lunas' },
    { icon: 'mail', text: 'Ke email dan WhatsApp-mu' },
    { icon: 'shield', text: 'Pembayaran aman lewat OrderHero' },
  ],

  footer: 'Produk digital dikirim ke email dan WhatsApp setelah pembayaran lunas.',
  /** Font: lihat app/layout.tsx. Warna: lihat app/globals.css. */
} as const

export const checkoutConfig = {
  /** Jeda sebelum total dihitung ulang setelah keranjang/kupon/metode berubah (disarankan ±400 ms). */
  quoteDebounceMs: 400,
  /**
   * Keranjang berisi produk yang stoknya dihitung: order belum dibayar ditutup setelah sekian menit
   * (`expires_in_minutes`, 15–1.440) supaya stok tidak tertahan order palsu. Produk lain: 24 jam.
   */
  stockHoldMinutes: 60,
} as const

export const orderStatusConfig = {
  /** Batas ukuran bukti transfer manual. Di bawah batas body Vercel (4,5 MB); API menerima sampai 5 MB. */
  proofMaxBytes: 4 * 1024 * 1024,
  proofTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  /** Interval polling halaman status (disarankan 5–10 detik). */
  pollMs: 10_000,
  /** Setelah ini polling berhenti dan diganti tombol "Periksa status". */
  maxPollMs: 30 * 60_000,
  /** Setelah tenggat order, tetap periksa sebentar untuk pembayaran menit terakhir. */
  graceAfterCloseMs: 10 * 60_000,
  /** Lunas tetapi belum terkirim lebih dari ini (bila API belum mengirim `delivery.status`). */
  deliverySlowMs: 5 * 60_000,
} as const

export type AssuranceIcon = (typeof site.assurances)[number]['icon']
