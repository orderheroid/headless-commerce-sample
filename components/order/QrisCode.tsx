'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

import { ButtonLink, Icon, Notice, Skeleton } from '@/components/ui'

/** QR dirender dari `qris_payload` di browser (qris_image_url tidak pernah terisi di data nyata). */
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

  if (failed) return <Notice>QR gagal ditampilkan. Gunakan halaman pembayaran OrderHero di bawah.</Notice>

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Selalu putih, juga di mode gelap: QR harus gelap di atas terang supaya terbaca kamera. */}
      <div className="w-full max-w-72 rounded-2xl border border-line bg-white p-3 shadow-sm">
        {src ? (
          <img src={src} alt="Kode QRIS untuk pembayaran" className="aspect-square w-full" />
        ) : (
          <Skeleton className="aspect-square w-full" />
        )}
      </div>
      {src && (
        <ButtonLink href={src} download={fileName} variant="ghost" size="sm">
          <Icon name="download" className="h-4 w-4" /> Simpan gambar QR
        </ButtonLink>
      )}
      <p className="text-center text-sm text-fg-muted">Scan dengan aplikasi e-wallet atau m-banking apa pun yang mendukung QRIS.</p>
    </div>
  )
}
