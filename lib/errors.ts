// Pesan untuk pembeli, dicocokkan dari kode `error` (kodenya stabil; `message` API boleh berubah).

const MESSAGES: Record<string, string> = {
  // Konfigurasi toko: pembeli tidak bisa memperbaikinya sendiri
  CONFIG_MISSING: 'Toko belum siap menerima pesanan. Silakan hubungi penjual.',
  UNAUTHORIZED: 'Toko sedang tidak bisa diakses. Silakan hubungi penjual.',
  SECRET_KEY_FROM_BROWSER: 'Toko sedang tidak bisa diakses. Silakan hubungi penjual.',
  SCOPE_NOT_ALLOWED: 'Toko sedang tidak bisa diakses. Silakan hubungi penjual.',
  KEY_CREATOR_REVOKED: 'Toko sedang tidak bisa diakses. Silakan hubungi penjual.',
  FEATURE_NOT_AVAILABLE: 'Toko sedang tidak bisa diakses. Silakan hubungi penjual.',
  QUOTA_EXCEEDED: 'Toko sedang tidak bisa menerima pesanan baru. Silakan hubungi penjual.',

  // Sementara
  RATE_LIMITED: 'Toko sedang ramai. Mohon tunggu sebentar lalu coba lagi.',
  RATE_LIMITER_UNAVAILABLE: 'Layanan sedang sibuk. Coba lagi sebentar lagi.',
  UPSTREAM_UNAVAILABLE: 'Layanan sedang terganggu. Coba lagi sebentar lagi.',
  INTERNAL_ERROR: 'Terjadi gangguan di server. Coba lagi sebentar lagi.',
  NETWORK_ERROR: 'Koneksi ke server terputus. Periksa internetmu lalu coba lagi.',
  IDEMPOTENCY_IN_PROGRESS: 'Pesananmu masih diproses. Tunggu beberapa detik lalu tekan tombolnya lagi.',
  IDEMPOTENCY_OUTCOME_UNKNOWN:
    'Kami belum bisa memastikan pesananmu sebelumnya. Tunggu sebentar lalu coba lagi; pesanan tidak akan dobel.',
  IDEMPOTENCY_KEY_REUSED: 'Isi pesanan berubah. Tekan tombolnya sekali lagi untuk melanjutkan.',

  // Keranjang
  ITEMS_REQUIRED: 'Keranjangmu masih kosong.',
  TOO_MANY_ITEMS: 'Terlalu banyak produk dalam satu pesanan (maksimal 50).',
  PRODUCT_NOT_FOUND: 'Ada produk di keranjang yang sudah tidak tersedia. Hapus lalu coba lagi.',
  PRODUCT_INACTIVE: 'Ada produk di keranjang yang sedang tidak dijual. Hapus lalu coba lagi.',
  VARIANT_NOT_FOUND: 'Varian yang dipilih sudah tidak tersedia. Pilih ulang dari halaman produk.',
  VARIANT_REQUIRED: 'Produk ini punya varian. Pilih variannya dulu dari halaman produk.',
  INVALID_QUANTITY: 'Jumlah harus antara 1 sampai 100.',
  PRICE_UNAVAILABLE: 'Harga produk ini belum tersedia. Silakan hubungi penjual.',
  PWYW_NOT_SUPPORTED: 'Ada produk berharga bebas di keranjang. Hapus dari keranjang, lalu beli lewat tombol di halaman produknya.',
  OUT_OF_STOCK: 'Stok tidak cukup. Kurangi jumlahnya lalu coba lagi.',
  LICENSE_KEYS_UNAVAILABLE: 'Stok produk ini sedang habis. Coba lagi nanti.',
  DIGITAL_CONTENT_TYPE_REQUIRED: 'Produk ini belum siap dijual. Silakan hubungi penjual.',
  DIGITAL_CONTENT_REQUIRED: 'Produk ini belum siap dijual. Silakan hubungi penjual.',
  SHIPPING_ADDRESS_REQUIRED: 'Toko ini hanya melayani produk digital. Hapus produk fisik dari keranjang.',

  // Kupon
  COUPON_INVALID: 'Kode kupon tidak berlaku untuk pesanan ini.',
  COUPON_LIMIT_REACHED: 'Kuota kupon baru saja habis. Total dihitung ulang tanpa kupon.',

  // Pembeli
  CUSTOMER_NAME_REQUIRED: 'Nama wajib diisi.',
  CUSTOMER_CONTACT_REQUIRED: 'Email dan nomor WhatsApp wajib diisi.',
  INVALID_EMAIL: 'Format email belum benar.',
  INVALID_INPUT: 'Ada isian yang memuat karakter tidak diizinkan. Periksa lagi isianmu.',

  // Pembayaran
  PAYMENT_METHOD_REQUIRED: 'Pilih metode pembayaran dulu.',
  PAYMENT_METHOD_UNAVAILABLE: 'Metode pembayaran itu sedang tidak tersedia. Pilih metode lain.',
  CHANNEL_NOT_SUPPORTED: 'Metode pembayaran itu sedang tidak tersedia. Pilih metode lain.',
  CHANNEL_UNDER_MAINTENANCE: 'Metode pembayaran itu sedang dalam pemeliharaan. Pilih metode lain.',
  GATEWAY_NOT_CONFIGURED: 'Metode pembayaran itu sedang tidak tersedia. Pilih metode lain.',
  DOKU_CHECKOUT_DISABLED: 'Metode pembayaran itu sedang tidak tersedia. Pilih metode lain.',
  AMOUNT_BELOW_MINIMUM: 'Total pesanan di bawah batas minimum metode pembayaran ini. Pilih metode lain.',
  PAYMENT_CREATE_FAILED: 'Kode pembayaran gagal dibuat. Coba lagi atau pilih metode lain.',
  MAX_PAYMENT_ATTEMPTS: 'Kode pembayaran sudah terlalu sering dibuat ulang hari ini. Gunakan kode yang terakhir atau coba lagi besok.',
  ALREADY_PAID: 'Pesanan ini sudah lunas. Tidak perlu membayar lagi.',
  ORDER_CANCELLED: 'Pesanan ini sudah dibatalkan. Silakan buat pesanan baru.',
  ORDER_CLOSED: 'Batas waktu pesanan ini sudah lewat. Silakan buat pesanan baru.',

  // Order
  // Konfirmasi transfer manual
  NOT_MANUAL_TRANSFER: 'Pesanan ini tidak dibayar lewat transfer manual; statusnya diperbarui otomatis.',
  SENDER_NAME_REQUIRED: 'Isi nama pemilik rekening pengirim.',
  PROOF_FILE_INVALID: 'Bukti transfer harus berupa JPG, PNG, WebP, atau PDF.',
  PROOF_FILE_TOO_LARGE: 'Ukuran bukti transfer terlalu besar (maksimal 4 MB).',
  PAYLOAD_TOO_LARGE: 'Ukuran bukti transfer terlalu besar (maksimal 4 MB).',
  PROOF_UPLOAD_FAILED: 'Bukti gagal diunggah dan konfirmasi belum tercatat. Coba kirim lagi.',
  CONFIRMATION_PENDING: 'Konfirmasimu sudah kami terima dan sedang menunggu verifikasi.',
  CONFIRMATION_ALREADY_VERIFIED: 'Pembayaran pesanan ini sudah diverifikasi.',

  ORDER_NOT_FOUND: 'Pesanan tidak ditemukan.',
  NOT_FOUND: 'Data tidak ditemukan.',
  INVALID_REFERENCE: 'Tautan pesanan tidak valid.',
  INVALID_RETURN_URL: 'Toko belum siap menerima pesanan. Silakan hubungi penjual.',
  INVALID_STATUS_URL: 'Toko belum siap menerima pesanan. Silakan hubungi penjual.',
  INVALID_EXPIRES_IN: 'Toko belum siap menerima pesanan. Silakan hubungi penjual.',
}

const FALLBACK = 'Terjadi kesalahan. Coba lagi sebentar lagi.'

export function buyerMessage(code: string, extra?: Record<string, unknown>): string {
  if (code === 'OUT_OF_STOCK' && typeof extra?.available === 'number') {
    return extra.available > 0
      ? `Stok tidak cukup, tersisa ${extra.available}. Kurangi jumlahnya lalu coba lagi.`
      : 'Maaf, stok produk ini sudah habis.'
  }
  return MESSAGES[code] ?? FALLBACK
}
