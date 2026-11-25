import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Manual transfer proof (max. 4 MB, see config/site.ts) is sent through a server action.
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
