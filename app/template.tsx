/**
 * Template dipasang ulang setiap pindah halaman: isi halaman muncul dengan fade halus.
 * Header dan footer (di layout) tidak ikut beranimasi.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>
}
