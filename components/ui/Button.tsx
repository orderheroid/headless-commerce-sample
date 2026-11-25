import Link from 'next/link'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'link'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  /** Primary action: store blue. */
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-line-strong disabled:text-fg-faint',
  /** Alternative primary action: ink color (inverted in dark mode). */
  ink: 'bg-fg text-canvas hover:opacity-90 disabled:bg-line-strong disabled:text-fg-faint',
  secondary: 'border border-line-strong bg-surface text-fg hover:border-fg disabled:text-fg-faint disabled:hover:border-line-strong',
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg disabled:text-fg-faint',
  link: 'text-accent underline underline-offset-4 hover:text-accent-strong disabled:text-fg-faint',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
}

type StyleProps = { variant?: Variant; size?: Size; block?: boolean }

/** Button classes, shared by <Button> and <ButtonLink>. */
export function buttonClass({ variant = 'primary', size = 'md', block = false }: StyleProps = {}, extra?: string) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
    variant !== 'link' && sizes[size],
    variants[variant],
    block && 'w-full',
    extra,
  )
}

export function Button({ variant, size, block, className, type = 'button', ...props }: ComponentProps<'button'> & StyleProps) {
  return <button type={type} className={buttonClass({ variant, size, block }, className)} {...props} />
}

/** Button-styled link. Internal paths ("/…") use next/link; anything else (https:, data:, #anchor) a plain <a>. */
export function ButtonLink({ variant, size, block, className, href, ...props }: ComponentProps<'a'> & StyleProps & { href: string }) {
  const cls = buttonClass({ variant, size, block }, className)
  if (!href.startsWith('/')) return <a href={href} className={cls} {...props} />
  return <Link href={href} className={cls} {...props} />
}
