# Panduan untuk AI coding agent

Toko online produk digital dengan OrderHero Headless Commerce API v1 sebagai satu-satunya backend.
Baca `README.md` untuk struktur folder dan cara mengubah tampilan.

## Aturan yang tidak boleh dilanggar

1. **Semua panggilan ke OrderHero hanya lewat `lib/orderhero.ts`** (ditandai `server-only`). Kunci
   `ORDERHERO_SECRET_KEY` tidak boleh masuk kode browser atau env `NEXT_PUBLIC_`, dan nilainya tidak
   boleh ditulis ke file yang ter-commit (`.env.example` harus tetap kosong).
2. **Jangan menghitung atau mengirim harga.** Total selalu dari `POST /checkout/quote`; body yang memuat
   `price`, `total`, `discount`, dst. ditolak API.
3. **Metode bayar dari `GET /checkout/payment-methods`**, tampilkan `label` dan urutannya apa adanya.
4. **Order tidak boleh dobel.** Satu percobaan checkout memakai satu `Idempotency-Key` dan satu
   `external_reference` (lihat `components/checkout/useCheckoutAttempt.ts`). Bila hasil tidak pasti,
   baca order yang ada lewat `GET /orders/{external_reference}`; jangan membuat order baru.
5. **Data pembeli tidak pernah ke browser.** Data order hanya keluar lewat `toPublicStatus` di
   `lib/order-public.ts` (allowlist). Menambah field berarti menambahnya di sana dan di test-nya.
6. **Tanpa database, tanpa penyimpanan file, tanpa webhook, tanpa mock.** Status dibaca dengan polling
   lewat `app/api/pesanan/[ref]/route.ts`.
7. **Tidak ada mode test di API.** Jangan membuat order, kode bayar, atau konfirmasi transfer saat
   menguji tanpa izin pemilik toko. Yang aman dipanggil: `GET /meta`, katalog, metode bayar,
   `GET /orders/{ref}`, dan `POST /checkout/quote`.
8. **Alamat toko untuk `status_url`/`return_url`** diambil dari env/Vercel (`lib/site-url.ts`), bukan
   dari header permintaan.
9. **Jangan mengarang endpoint.** Belum ada di API v1: refund, membuat resi, mengubah produk/stok/kupon,
   pajak, mata uang selain IDR. Cek `https://api.orderhero.id/v1/openapi.json` dan
   `GET /meta` → `data.features` sebelum memakai fitur baru.

## Sebelum selesai

Jalankan `npm run check` (lint, type check, test) dan `npm run build`.

## Dokumentasi API

- https://docs.orderhero.id/docs/developer/headless/quickstart.md
- https://docs.orderhero.id/docs/developer/api/error-codes.md
- OpenAPI: https://api.orderhero.id/v1/openapi.json

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
