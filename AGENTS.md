# Guide for AI coding agents

An online store for digital products with the OrderHero Headless Commerce API v1 as its only backend.
Read `README.md` for the folder structure and how to change the look.

## Rules that must not be broken

1. **All calls to OrderHero go through `lib/orderhero.ts` only** (marked `server-only`). The
   `ORDERHERO_SECRET_KEY` key must never reach browser code or a `NEXT_PUBLIC_` env, and its value must
   never be written to a committed file (`.env.example` must stay empty).
2. **Do not calculate or send prices.** Totals always come from `POST /checkout/quote`; a body containing
   `price`, `total`, `discount`, etc. is rejected by the API.
3. **Payment methods come from `GET /checkout/payment-methods`**; show `label` and the order as returned.
4. **Orders must never be duplicated.** One checkout attempt uses one `Idempotency-Key` and one
   `external_reference` (see `components/checkout/useCheckoutAttempt.ts`). When the outcome is uncertain,
   read the existing order via `GET /orders/{external_reference}`; do not create a new one.
5. **Buyer data never goes to the browser.** Order data only leaves through `toPublicStatus` in
   `lib/order-public.ts` (allowlist). Adding a field means adding it there and in its test.
6. **No database, no file storage, no webhooks, no mocks.** Status is read by polling through
   `app/api/orders/[ref]/route.ts`.
7. **The API has no test mode.** Do not create orders, payment codes, or transfer confirmations while
   testing without the store owner's permission. Safe to call: `GET /meta`, catalog, payment methods,
   `GET /orders/{ref}`, and `POST /checkout/quote`.
8. **The store address for `status_url`/`return_url`** comes from env/Vercel (`lib/site-url.ts`), not
   from request headers.
9. **Do not invent endpoints.** Not in API v1 yet: refunds, creating shipping labels, changing
   products/stock/coupons, tax, currencies other than IDR. Check `https://api.orderhero.id/v1/openapi.json`
   and `GET /meta` → `data.features` before using a new feature.

## Before finishing

Run `npm run check` (lint, type check, tests) and `npm run build`.

## API documentation

- https://docs.orderhero.id/docs/developer/headless/quickstart.md
- https://docs.orderhero.id/docs/developer/api/error-codes.md
- OpenAPI: https://api.orderhero.id/v1/openapi.json

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
