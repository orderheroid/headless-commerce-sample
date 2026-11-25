'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { createOrderAction } from '@/app/checkout/actions'
import { Assurances } from '@/components/layout/Assurances'
import { Button, ButtonLink, Card, CardHeader, Icon, Notice, Skeleton } from '@/components/ui'
import { clearCart, toCartLines, useCart } from '@/lib/cart'
import { rupiah } from '@/lib/format'
import { useNow } from '@/lib/hooks'
import type { PaymentMethod } from '@/lib/types'
import { validateBuyer, type BuyerInput } from '@/lib/validation'

import { BUYER_FIELD_IDS, BuyerSection } from './BuyerSection'
import { CartSection } from './CartSection'
import { CouponField } from './CouponField'
import { OrderSummary } from './OrderSummary'
import { PaymentSection } from './PaymentSection'
import { useCheckoutAttempt } from './useCheckoutAttempt'
import { useQuote } from './useQuote'

type Props = { methods: PaymentMethod[]; defaultMethod: string | null }

const EMPTY_BUYER: BuyerInput = { name: '', email: '', phone: '' }

export function CheckoutForm({ methods, defaultMethod }: Props) {
  const { items: cart, ready } = useCart()
  const lines = useMemo(() => toCartLines(cart), [cart])
  const attempt = useCheckoutAttempt()
  const router = useRouter()

  // ---------------------------------------------------------------- buyer's choices
  const [method, setMethod] = useState(
    () => methods.find((m) => m.code === defaultMethod)?.code ?? methods.find((m) => m.is_default)?.code ?? methods[0]?.code ?? '',
  )
  const [coupon, setCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [buyer, setBuyer] = useState<BuyerInput>(EMPTY_BUYER)
  const [touched, setTouched] = useState<Partial<Record<keyof BuyerInput, boolean>>>({})
  const [showAllErrors, setShowAllErrors] = useState(false)

  const allErrors = validateBuyer(buyer)
  const visibleErrors = Object.fromEntries(
    Object.entries(allErrors).filter(([field]) => showAllErrors || touched[field as keyof BuyerInput]),
  )

  // ---------------------------------------------------------------- total from the API
  const { quote, error: quoteError, loading: quoting, refresh: refreshQuote } = useQuote({
    enabled: ready,
    lines,
    paymentMethod: method,
    couponCode: coupon,
    onCouponRejected: (message) => {
      setCouponError(message)
      setCoupon(null)
    },
  })

  // ---------------------------------------------------------------- submit order
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [blockedUntil, setBlockedUntil] = useState(0)
  const now = useNow(1000)
  const waitSeconds = Math.max(0, Math.ceil((blockedUntil - now) / 1000))
  const canSubmit = !!quote && !quoting && !submitting && waitSeconds === 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (Object.keys(allErrors).length > 0) {
      setShowAllErrors(true)
      const first = (Object.keys(BUYER_FIELD_IDS) as (keyof BuyerInput)[]).find((f) => allErrors[f])
      if (first) document.getElementById(BUYER_FIELD_IDS[first])?.focus()
      return
    }
    const keys = attempt.current()
    if (!keys || !canSubmit) return
    setSubmitting(true)
    setSubmitError(null)

    const send = (k: NonNullable<ReturnType<typeof attempt.current>>) =>
      createOrderAction({ items: lines, ...buyer, paymentMethod: method, couponCode: coupon ?? undefined, ...k })

    try {
      let result = await send(keys)
      if (!result.ok && result.rotateIdempotencyKey) {
        attempt.rotateIdempotencyKey()
        result = await send(attempt.current()!)
      }

      if (result.ok) {
        clearCart()
        attempt.finish()
        router.push(`/orders/${result.reference}`) // payment code is shown on the status page
        return // button stays "processing" until the page navigates
      }

      if (result.code === 'COUPON_LIMIT_REACHED' || result.code === 'COUPON_INVALID') {
        setCoupon(null)
        setCouponError(result.message)
      }
      if (result.code === 'RATE_LIMITED' && result.retryAfter) setBlockedUntil(Date.now() + result.retryAfter * 1000)
      if (result.code === 'OUT_OF_STOCK') refreshQuote()
      setSubmitError(result.message)
    } catch {
      // Outcome unknown. Key and reference stay the same, so the button is safe to press again.
      setSubmitError('Connection lost before the order was confirmed. Press the button again; your order will not be duplicated.')
    }
    setSubmitting(false)
  }

  // ---------------------------------------------------------------- view
  if (!ready) {
    return (
      <div className="grid gap-4 md:grid-cols-[1fr_380px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (cart.length === 0) return <EmptyCart />

  const submitLabel = submitting ? 'Processing order…' : waitSeconds > 0 ? `Wait ${waitSeconds}s` : quoting ? 'Calculating total…' : 'Pay now'

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 pb-28 md:grid-cols-[1fr_380px] md:items-start md:gap-6 md:pb-0">
      <div className="grid gap-4">
        <CartSection step={1} items={cart} disabled={submitting} />
        <BuyerSection
          step={2}
          value={buyer}
          onChange={setBuyer}
          errors={visibleErrors}
          onBlur={(f) => setTouched((t) => ({ ...t, [f]: true }))}
          disabled={submitting}
        />
        <PaymentSection step={3} methods={methods} value={method} onChange={setMethod} disabled={submitting} />
      </div>

      <div className="grid gap-4 md:sticky md:top-20">
        <Card>
          <CardHeader title="Order summary" />
          <div className="space-y-4">
            <CouponField
              applied={coupon && quote?.coupon ? quote.coupon.code : null}
              onApply={(code) => {
                setCouponError(null)
                setCoupon(code)
              }}
              onRemove={() => setCoupon(null)}
              error={couponError}
              onClearError={() => setCouponError(null)}
              disabled={submitting}
            />
            <OrderSummary quote={quote} loading={quoting} error={quoteError} />
            {submitError && <Notice>{submitError}</Notice>}
            {/* Wide screens only; on mobile the button is in the bottom bar. Wrapped in a <div> because the
                `hidden` class on the button loses to Button's built-in `inline-flex`. */}
            <div className="hidden md:block">
              <Button type="submit" size="lg" block disabled={!canSubmit}>
                {submitLabel}
              </Button>
            </div>
            <p className="text-center text-xs text-fg-subtle">Next, your QRIS code or payment number is shown right away.</p>
          </div>
        </Card>
        <Assurances className="px-1" />
      </div>

      {/* Mobile pay bar: total and button always visible. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-fg-subtle">Total</p>
            <p className="truncate text-lg font-bold tabular-nums text-accent">{quote ? rupiah(quote.total) : '—'}</p>
          </div>
          <Button type="submit" size="lg" disabled={!canSubmit} className="min-w-40">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

function EmptyCart() {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name="cart" className="h-7 w-7" />
      </span>
      <p className="mt-4 font-semibold text-fg">Your cart is empty</p>
      <p className="mt-1 text-sm text-fg-subtle">Pick a product first, then come back here to pay.</p>
      <ButtonLink href="/" className="mt-5">
        Browse products
      </ButtonLink>
    </div>
  )
}
