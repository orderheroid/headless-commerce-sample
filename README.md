# Toko Headless OrderHero (contoh)

Toko online produk digital dengan **OrderHero Headless Commerce API v1** sebagai satu-satunya backend.
Next.js App Router, TypeScript, Tailwind v4. Tanpa database, tanpa webhook.

## Menjalankan

```bash
cp .env.example .env.local   # isi ORDERHERO_SECRET_KEY (ohsk_live_…)
npm install
npm run dev
```

Butuh Node 20.9 atau lebih baru.

| Perintah | Guna |
| --- | --- |
| `npm run dev` | server pengembangan |
| `npm run check` | lint + type check + test (jalankan sebelum commit; CI menjalankan yang sama) |
| `npm run build` | build produksi |

| Env | Wajib | Keterangan |
| --- | --- | --- |
| `ORDERHERO_SECRET_KEY` | ya | Kunci secret. Scope cukup `catalog:read` + `checkout:write`. Hanya di server. |
| `ORDERHERO_API_URL` | tidak | Bawaan `https://api.orderhero.id/v1`. Wajib https. |
| `SITE_URL` | di luar Vercel | Alamat toko (https). Dipakai untuk tautan status di WA/email OrderHero. |

> Tidak ada mode test di API v1: setiap order adalah order sungguhan.

## Batasan contoh ini

- Hanya produk **digital** (tanpa alamat dan ongkir).
- Produk harga bebas (bayar sesukanya) diarahkan ke form order OrderHero, karena API tidak menerima harga dari klien.
- Tanpa captcha: perlindungan spam mengandalkan batas per pembeli dari OrderHero. Tambahkan rate limit di hosting.
- Headless Commerce masih beta dan khusus paket Enterprise.

## Mengubah tampilan dan isi

| Ingin mengubah | Buka |
| --- | --- |
| Teks beranda, poin kepercayaan, langkah "Cara beli", interval polling | `config/site.ts` |
| Warna utama, warna terang/gelap | `app/globals.css` (`--color-brand-*`, `:root`, `[data-theme='dark']`) |
| Font | `app/layout.tsx` (isi) dan `.font-display` di `app/globals.css` (judul) |
| Bentuk tombol, kartu, field, pilihan | `components/ui/` |
| Susunan bagian beranda | `app/page.tsx` |
| Pesan galat untuk pembeli | `lib/errors.ts` |

## Struktur

```
app/                      rute (tipis: ambil data, susun komponen)
  page.tsx                beranda + katalog (cache 300 detik)
  produk/[slug]/          detail produk
  checkout/               halaman + server action (quote, buat order)
  pesanan/[ref]/          status pesanan + server action (kode bayar baru)
  api/pesanan/[ref]/      route status yang di-polling browser
components/
  ui/                     komponen dasar (Button, Card, Field, ChoiceList, …)
  layout/                 header, footer, tema, pil keranjang
  home/ catalog/ product/ checkout/ order/   satu folder per fitur
config/site.ts            pengaturan toko
lib/
  orderhero.ts            SATU-SATUNYA berkas yang memanggil API (server-only)
  catalog.ts              produk API → data tampilan
  order-public.ts         satu-satunya pintu data order ke browser (tanpa data pembeli)
  order-status.ts         aturan lunas / tertutup / kedaluwarsa
  cart.ts                 keranjang di localStorage (tanpa harga)
  validation.ts           validasi pembeli (dipakai browser dan server)
```

## Aturan yang dijaga kode ini

- Kunci secret hanya dibaca di `lib/orderhero.ts`; tidak pernah masuk bundle browser.
- Harga tidak pernah dihitung atau dikirim dari browser; total selalu dari `POST /checkout/quote`.
- Metode bayar dari `GET /checkout/payment-methods`, label dan urutan apa adanya.
- Satu percobaan checkout = satu `Idempotency-Key` + satu `external_reference` (sessionStorage);
  bila hasil tidak pasti, order dibaca ulang, bukan dibuat lagi.
- Kode bayar (QRIS, VA, gerai) dan rekening transfer manual ditampilkan di `/pesanan/{ref}`; status di-polling tiap 10 detik.
- Bukti transfer diteruskan langsung ke OrderHero; toko ini tidak menyimpan berkas.
- Route status hanya mengirim field di `lib/order-public.ts`; data pembeli tidak pernah ke browser.
- Alamat toko untuk `status_url` diambil dari env/Vercel, bukan dari header permintaan.

Fitur API yang dipakai bisa dicek di `GET /meta` → `data.features`.
