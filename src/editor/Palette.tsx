import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { CAT_COLOR_VAR, NODE_CATEGORIES, NODE_TYPES } from '../nodes'
import { NodeGlyph } from '../NodeGlyph'
import { IconSearch } from '../canvas/icons'

const COLLAPSED_KEY = 'kumo:pal-collapsed'

interface Props {
  onDragStart: (e: DragEvent<HTMLDivElement>, type: string) => void
}

export function Palette({ onDragStart }: Props) {
  const [filter, setFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_KEY)
      if (raw) return new Set(JSON.parse(raw) as string[])
    } catch {
      // ignore
    }
    return new Set(NODE_CATEGORIES.map((c) => c.id))
  })

  const toggleCat = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
      } catch {
        // ignore
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    if (!filter.trim()) return NODE_CATEGORIES
    const q = filter.toLowerCase()
    return NODE_CATEGORIES
      .map((c) => ({
        ...c,
        types: c.types.filter((t) => {
          const def = NODE_TYPES[t]
          return (
            def.label.toLowerCase().includes(q) ||
            def.sub.toLowerCase().includes(q) ||
            t.toLowerCase().includes(q)
          )
        }),
      }))
      .filter((c) => c.types.length > 0)
  }, [filter])

  return (
    <aside className="kn-palette">
      <div className="kn-palette-search">
        <IconSearch />
        <input placeholder="search nodes…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <span className="kn-kbd">/</span>
      </div>
      <div className="kn-palette-body">
        {filtered.map((cat) => {
          const isCollapsed = collapsed.has(cat.id) && !filter.trim()
          return (
            <div key={cat.id} className={`kn-pal-cat ${isCollapsed ? 'is-collapsed' : ''}`}>
              <button className="kn-pal-cat-h" onClick={() => toggleCat(cat.id)} type="button">
                <svg className="kn-pal-chev" width="10" height="10" viewBox="0 0 10 10">
                  <path d="M3 1.5 6.5 5 3 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="kn-pal-dot" style={{ background: `var(${CAT_COLOR_VAR[cat.id]})` }} />
                {cat.label}
                <span className="kn-pal-count">{cat.types.length}</span>
              </button>
              {!isCollapsed && (
                <div className="kn-pal-grid">
                  {cat.types.map((t) => {
                    const def = NODE_TYPES[t]
                    return (
                      <div
                        key={t}
                        className="kn-pal-item"
                        draggable
                        onDragStart={(e) => onDragStart(e, t)}
                        title={`${def.label} — ${def.sub}`}
                      >
                        <div className="kn-pal-icon" style={{ color: `var(${CAT_COLOR_VAR[cat.id]})` }}>
                          <NodeGlyph type={def.icon} size={16} />
                        </div>
                        <div className="kn-pal-label">{def.label}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="kn-palette-foot">
        <kbd>drag</kbd> onto canvas to add
      </div>
    </aside>
  )
}
