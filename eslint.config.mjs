import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  {
    rules: {
      // Gambar produk dan logo kanal berasal dari domain merchant yang tidak diketahui sebelumnya,
      // jadi toko ini memakai <img> biasa (lihat components/ui/ProductImage.tsx).
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
