import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Bukti transfer manual (maks. 4 MB, lihat config/site.ts) dikirim lewat server action.
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
