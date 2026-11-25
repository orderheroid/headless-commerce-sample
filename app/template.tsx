/**
 * The template remounts on every page change: page content appears with a subtle fade.
 * The header and footer (in the layout) are not animated.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>
}
