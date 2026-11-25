// Tema terang/gelap. Pilihan pembeli disimpan di localStorage; tanpa pilihan, ikut pengaturan perangkat.
// Tema dipasang sebagai atribut <html data-theme="light|dark"> (lihat app/globals.css).

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'toko:tema'

/** Warna bilah browser HP per tema (meta theme-color). */
export const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#0b0c0f' }

/**
 * Skrip kecil yang dijalankan di <head> SEBELUM halaman tergambar, supaya mode gelap tidak berkedip
 * putih dulu. Harus mandiri (tanpa import) karena disisipkan sebagai teks.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`
