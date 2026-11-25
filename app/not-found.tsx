import { ButtonLink } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-8xl leading-none text-accent-faint">404</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Page not found</h1>
      <p className="mt-2 text-fg-muted">The product or order you are looking for does not exist, or its link has changed.</p>
      <ButtonLink href="/" className="mt-6">
        View all products
      </ButtonLink>
    </div>
  )
}
