import type { BrandName } from '../types'

export const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8 3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

export const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 10V2m0 0L5 5m3-3 3 3M3 11v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export function CloudGlyph({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M18 44 C 8 44 6 30 16 28 C 16 18 28 14 34 22 C 42 16 54 22 52 32 C 60 32 60 44 50 44 Z"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="34" r="2" fill="var(--accent)" />
      <circle cx="40" cy="34" r="2" fill="var(--accent)" />
      <path d="M28 39 Q 32 42 36 39" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function BrandMark({ brand, size = 24 }: { brand: BrandName; size?: number }) {
  if (brand === 'Mochi') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="26" height="26" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="11" cy="14" r="1.6" fill="var(--accent)" />
        <circle cx="21" cy="14" r="1.6" fill="var(--accent)" />
        <path d="M12 20 Q 16 23 20 20" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (brand === 'Lattice') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="9" cy="9" r="3" fill="var(--accent)" />
        <circle cx="23" cy="9" r="3" fill="var(--accent)" opacity="0.7" />
        <circle cx="9" cy="23" r="3" fill="var(--accent)" opacity="0.7" />
        <circle cx="23" cy="23" r="3" fill="var(--accent)" />
        <path d="M9 9h14M9 9v14M23 9v14M9 23h14" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
      </svg>
    )
  }
  return <CloudGlyph size={size} />
}

export function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="6" width="9" height="6" rx="1" fill="currentColor" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}
