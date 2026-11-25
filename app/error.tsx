'use client'

import { Button, ButtonLink } from '@/components/ui'

/** Page error boundary: unexpected errors do not show a blank screen. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-4xl tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-fg-muted">This page failed to load. Try again in a moment.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go to home page
        </ButtonLink>
      </div>
    </div>
  )
}
