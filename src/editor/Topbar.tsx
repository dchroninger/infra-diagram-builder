import { Fragment } from 'react'
import type { BrandName, ThemeMode } from '../types'
import { BrandMark, IconExport, IconMoon, IconSun } from '../canvas/icons'

interface Crumb {
  id: string
  name: string
}

interface Props {
  brand: BrandName
  theme: ThemeMode
  toggleTheme: () => void
  crumbs: Crumb[]
  onBack: () => void
  onCrumbJump: (idx: number) => void
}

export function Topbar({ brand, theme, toggleTheme, crumbs, onBack, onCrumbJump }: Props) {
  return (
    <div className="kn-topbar">
      <div className="kn-topbar-l">
        <button className="kn-back" onClick={onBack} title={crumbs.length > 1 ? 'Back one level' : 'Back to diagrams'}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12 6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="kn-divider" />
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <BrandMark brand={brand} size={22} />
        </div>
        <div className="kn-crumb">
          <span className="kn-crumb-dim">{brand}</span>
          <span className="kn-crumb-sep">/</span>
          {crumbs.map((c, i) => (
            <Fragment key={c.id || i}>
              {i > 0 && <span className="kn-crumb-sep">/</span>}
              {i < crumbs.length - 1 ? (
                <button className="kn-crumb-link" onClick={() => onCrumbJump(i)}>
                  {c.name}
                </button>
              ) : (
                <span>{c.name}</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="kn-topbar-c">
        <span className="kn-status">
          <span className="kn-status-dot" /> auto-saved
        </span>
      </div>
      <div className="kn-topbar-r">
        <button className="kn-tb-btn" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button className="kn-tb-btn" title="Export">
          <IconExport />
        </button>
      </div>
    </div>
  )
}
