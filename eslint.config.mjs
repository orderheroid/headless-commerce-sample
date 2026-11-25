import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  {
    rules: {
      // Product images and channel logos come from merchant domains that are not known in advance,
      // so this store uses a plain <img> (see components/ui/ProductImage.tsx).
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
