// Light/dark theme. The buyer's choice is stored in localStorage; with no choice, it follows the device setting.
// The theme is applied as the attribute <html data-theme="light|dark"> (see app/globals.css).

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'toko:tema'

/** Mobile browser bar color per theme (meta theme-color). */
export const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#0b0c0f' }

/**
 * Small script that runs in <head> BEFORE the page paints, so dark mode does not flash
 * white first. Must be self-contained (no imports) because it is injected as text.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`
