'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

import { ButtonLink, Icon, Notice, Skeleton } from '@/components/ui'

/** QR rendered from `qris_payload` in the browser. */
export function QrisCode({ payload, fileName = 'qris.png' }: { payload: string; fileName?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 640 })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [payload])

  if (failed) return <Notice>The QR code could not be displayed. Use the OrderHero payment page below.</Notice>

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Always white, in dark mode too: the QR must be dark on light so cameras can read it. */}
      <div className="w-full max-w-72 rounded-2xl border border-line bg-white p-3 shadow-sm">
        {src ? (
          <img src={src} alt="QRIS code for payment" className="aspect-square w-full" />
        ) : (
          <Skeleton className="aspect-square w-full" />
        )}
      </div>
      {src && (
        <ButtonLink href={src} download={fileName} variant="ghost" size="sm">
          <Icon name="download" className="h-4 w-4" /> Save QR image
        </ButtonLink>
      )}
      <p className="text-center text-sm text-fg-muted">Scan with any e-wallet or mobile banking app that supports QRIS.</p>
    </div>
  )
}
