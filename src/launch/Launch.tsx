import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { TemplateKind } from '../store'
import type { BrandName, Diagram, DiagramId, ThemeMode } from '../types'
import { CAT_COLOR_VAR, NODE_TYPES } from '../nodes'
import { BrandMark, CloudGlyph, IconSearch } from '../canvas/icons'

type Active = 'all' | 'recent' | 'starred' | 'shared' | 'trash' | string

interface Props {
  brand: BrandName
  // theme + accent are read by tweaks panel; not used here directly but kept for parity
  theme: ThemeMode
}

export function Launch({ brand }: Props) {
  const diagrams = useStore((s) => s.diagrams)
  const setOpenId = useStore((s) => s.setOpenId)
  const createDiagram = useStore((s) => s.createDiagram)
  const deleteDiagram = useStore((s) => s.deleteDiagram)

  const [filter, setFilter] = useState('')
  const [active, setActive] = useState<Active>('all')

  const list = useMemo(() => {
    let arr = Object.values(diagrams)
    if (active === 'starred') arr = arr.filter((d) => d.starred)
    else if (active === 'recent') arr = [...arr].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8)
    else if (active === 'shared') arr = arr.filter((d) => d.shared)
    else if (active === 'all') arr = [...arr].sort((a, b) => b.updatedAt - a.updatedAt)
    if (filter.trim()) {
      const q = filter.toLowerCase()
      arr = arr.filter(
        (d) => d.name.toLowerCase().includes(q) || (d.desc || '').toLowerCase().includes(q),
      )
    }
    return arr
  }, [diagrams, active, filter])

  const allCount = Object.keys(diagrams).length
  const starredCount = Object.values(diagrams).filter((d) => d.starred).length
  const sharedCount = Object.values(diagrams).filter((d) => d.shared).length

  const totalNodes = Object.values(diagrams).reduce((s, d) => s + Object.keys(d.nodes || {}).length, 0)
  const totalEdges = Object.values(diagrams).reduce((s, d) => s + Object.keys(d.edges || {}).length, 0)

  const onCreate = (kind?: TemplateKind) => {
    createDiagram(kind ?? 'blank')
  }

  return (
    <div className="kn-launch">
      <aside className="kn-l-side">
        <div className="kn-l-brand">
          <BrandMark brand={brand} size={64} interactive />
          <div className="kn-l-brand-name">{brand.toLowerCase()}</div>
        </div>

        <button className="kn-l-new" onClick={() => onCreate()}>
          <span className="kn-l-new-plus">＋</span>
          <span>New diagram</span>
          <span className="kn-kbd">⌘N</span>
        </button>

        <div className="kn-l-search">
          <IconSearch />
          <input placeholder="search…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        <nav className="kn-l-nav">
          <NavItem id="all" label="All diagrams" active={active} onClick={setActive} icon="grid" count={allCount} />
          <NavItem id="recent" label="Recent" active={active} onClick={setActive} icon="clock" />
          <NavItem id="starred" label="Starred" active={active} onClick={setActive} icon="star" count={starredCount} />
          <NavItem id="shared" label="Shared" active={active} onClick={setActive} icon="share" count={sharedCount} />
          <NavItem id="trash" label="Trash" active={active} onClick={setActive} icon="trash" />
        </nav>

        <div className="kn-l-sect">Workspaces</div>
        <nav className="kn-l-nav">
          <NavItem id="ws-personal" label="Personal" active={active} onClick={setActive} swatch="var(--pink)" />
          <NavItem id="ws-side" label="Side projects" active={active} onClick={setActive} swatch="var(--lavender)" />
          <NavItem id="ws-arch" label="Architecture" active={active} onClick={setActive} swatch="var(--teal)" />
        </nav>

        <div className="kn-l-sect">Templates</div>
        <nav className="kn-l-nav">
          <NavItem id="tpl-uml" label="UML class diagram" active={active} onClick={() => onCreate('uml')} icon="tpl-uml" />
          <NavItem id="tpl-msa" label="Microservices" active={active} onClick={() => onCreate('msa')} icon="tpl-msa" />
          <NavItem id="tpl-seq" label="Sequence flow" active={active} onClick={() => onCreate('seq')} icon="tpl-seq" />
          <NavItem id="tpl-net" label="Network topology" active={active} onClick={() => onCreate('net')} icon="tpl-net" />
        </nav>

      </aside>

      <main className="kn-l-main">
        <header className="kn-l-hd">
          <div>
            <div className="kn-l-eyebrow">{titleFor(active)}</div>
            <h1 className="kn-l-title">
              {greeting()}, <span className="kn-l-title-accent">friend</span>
            </h1>
            <p className="kn-l-tagline">
              draw the systems in your head — softly. drop a node, pull a thread, see it bloom.
            </p>
          </div>
          <div className="kn-l-stats">
            <Stat label="diagrams" value={allCount} />
            <Stat label="nodes" value={totalNodes} />
            <Stat label="connections" value={totalEdges} />
          </div>
        </header>

        <div className="kn-l-quickstart">
          <QuickTile
            title="Blank canvas"
            desc="start fresh"
            color="var(--mauve)"
            glyph={<CloudGlyph size={36} />}
            onClick={() => onCreate('blank')}
          />
          <QuickTile
            title="Microservices"
            desc="api gw, services, db"
            color="var(--blue)"
            glyph={<TemplateGlyph kind="msa" />}
            onClick={() => onCreate('msa')}
          />
          <QuickTile
            title="UML classes"
            desc="oop modelling"
            color="var(--pink)"
            glyph={<TemplateGlyph kind="uml" />}
            onClick={() => onCreate('uml')}
          />
          <QuickTile
            title="Network topology"
            desc="cdn → lb → hosts"
            color="var(--teal)"
            glyph={<TemplateGlyph kind="net" />}
            onClick={() => onCreate('net')}
          />
        </div>

        <div className="kn-l-row">
          <h2>Your diagrams</h2>
          <div className="kn-l-row-tools">
            <button className="kn-pill is-on">grid</button>
            <button className="kn-pill">list</button>
          </div>
        </div>

        <div className="kn-l-grid">
          {list.map((d) => (
            <DiagramCard
              key={d.id}
              diagram={d}
              onOpen={(id) => setOpenId(id)}
              onDelete={(id) => deleteDiagram(id)}
            />
          ))}
          {list.length === 0 && (
            <div className="kn-l-empty">
              <div className="kn-l-empty-bubble">
                <CloudGlyph size={56} />
              </div>
              <h3>nothing here yet</h3>
              <p>create your first diagram to get started</p>
              <button className="kn-l-primary" onClick={() => onCreate('blank')}>
                New diagram
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface NavItemProps {
  id: string
  label: string
  active: Active
  onClick: (id: Active) => void
  count?: number
  swatch?: string
  icon?: NavIconKind
}

function NavItem({ id, label, active, onClick, count, swatch, icon }: NavItemProps) {
  return (
    <button className={`kn-l-nav-item ${active === id ? 'is-on' : ''}`} onClick={() => onClick(id)}>
      {swatch && <span className="kn-l-nav-swatch" style={{ background: swatch }} />}
      {icon && <NavIcon icon={icon} />}
      <span className="kn-l-nav-label">{label}</span>
      {count != null && count > 0 && <span className="kn-l-nav-count">{count}</span>}
    </button>
  )
}

type NavIconKind = 'grid' | 'clock' | 'star' | 'share' | 'trash' | 'tpl-uml' | 'tpl-msa' | 'tpl-seq' | 'tpl-net'

const NAV_STROKE = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function NavIcon({ icon }: { icon: NavIconKind }) {
  const m: Record<NavIconKind, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="5" height="5" rx="1" {...NAV_STROKE} />
        <rect x="10" y="3" width="5" height="5" rx="1" {...NAV_STROKE} />
        <rect x="3" y="10" width="5" height="5" rx="1" {...NAV_STROKE} />
        <rect x="10" y="10" width="5" height="5" rx="1" {...NAV_STROKE} />
      </>
    ),
    clock: (
      <>
        <circle cx="9" cy="9" r="6" {...NAV_STROKE} />
        <path d="M9 5v4l2.5 1.5" {...NAV_STROKE} />
      </>
    ),
    star: <path d="m9 3 1.8 3.7 4.1.6-3 2.9.7 4.1L9 12.4l-3.6 1.9.7-4.1-3-2.9 4.1-.6Z" {...NAV_STROKE} />,
    share: (
      <>
        <circle cx="13" cy="4" r="2" {...NAV_STROKE} />
        <circle cx="5" cy="9" r="2" {...NAV_STROKE} />
        <circle cx="13" cy="14" r="2" {...NAV_STROKE} />
        <path d="m11.4 5 -4.8 3M11.4 13l-4.8-3" {...NAV_STROKE} />
      </>
    ),
    trash: <path d="M3 5h12M7 5V3.5A.5.5 0 0 1 7.5 3h3a.5.5 0 0 1 .5.5V5M5 5l.7 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L13 5" {...NAV_STROKE} />,
    'tpl-uml': (
      <>
        <rect x="2" y="3" width="6" height="4" rx="1" {...NAV_STROKE} />
        <rect x="10" y="11" width="6" height="4" rx="1" {...NAV_STROKE} />
        <path d="M5 7v3h8" {...NAV_STROKE} />
      </>
    ),
    'tpl-msa': (
      <>
        <circle cx="4" cy="9" r="2" {...NAV_STROKE} />
        <circle cx="14" cy="5" r="2" {...NAV_STROKE} />
        <circle cx="14" cy="13" r="2" {...NAV_STROKE} />
        <path d="M6 8.4 12 5.6M6 9.6l6 2.8" {...NAV_STROKE} />
      </>
    ),
    'tpl-seq': <path d="M4 3v12M9 3v12M14 3v12M4 6h5M9 10h5M4 13h10" {...NAV_STROKE} />,
    'tpl-net': (
      <>
        <circle cx="9" cy="3.5" r="1.5" {...NAV_STROKE} />
        <circle cx="3.5" cy="14" r="1.5" {...NAV_STROKE} />
        <circle cx="9" cy="14" r="1.5" {...NAV_STROKE} />
        <circle cx="14.5" cy="14" r="1.5" {...NAV_STROKE} />
        <path d="M9 5v3M9 8 4 13M9 8l5 5M9 8v5" {...NAV_STROKE} />
      </>
    ),
  }
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      {m[icon]}
    </svg>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="kn-l-stat-v">{value}</div>
      <div className="kn-l-stat-l">{label}</div>
    </div>
  )
}

interface QuickTileProps {
  title: string
  desc: string
  color: string
  glyph: React.ReactNode
  onClick: () => void
}

function QuickTile({ title, desc, color, glyph, onClick }: QuickTileProps) {
  return (
    <button
      className="kn-l-quick"
      onClick={onClick}
      style={{ ['--qt-color' as string]: color } as React.CSSProperties}
    >
      <div className="kn-l-quick-glyph">{glyph}</div>
      <div className="kn-l-quick-text">
        <div className="kn-l-quick-title">{title}</div>
        <div className="kn-l-quick-desc">{desc}</div>
      </div>
      <div className="kn-l-quick-arrow">→</div>
    </button>
  )
}

function TemplateGlyph({ kind }: { kind: 'msa' | 'uml' | 'net' }) {
  if (kind === 'msa')
    return (
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
        <rect x="2" y="14" width="10" height="8" rx="2" fill="var(--node-net)" opacity="0.9" />
        <rect x="20" y="3" width="10" height="8" rx="2" fill="var(--node-service)" opacity="0.9" />
        <rect x="20" y="25" width="10" height="8" rx="2" fill="var(--node-service)" opacity="0.9" />
        <ellipse cx="38" cy="14" rx="4" ry="3" fill="var(--node-data)" opacity="0.9" />
        <ellipse cx="38" cy="22" rx="4" ry="3" fill="var(--node-data)" opacity="0.9" />
        <path
          d="M12 18 Q 16 7 20 7M12 18 Q 16 29 20 29M30 7 Q 34 10 34 14M30 29 Q 34 26 34 22"
          stroke="var(--text-faint)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="2 2"
        />
      </svg>
    )
  if (kind === 'uml')
    return (
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
        <rect x="2" y="3" width="14" height="10" rx="1" fill="var(--node-data)" opacity="0.9" />
        <rect x="2" y="3" width="14" height="3" fill="var(--node-data)" />
        <rect x="26" y="20" width="14" height="13" rx="1" fill="var(--node-service)" opacity="0.9" />
        <rect x="26" y="20" width="14" height="3" fill="var(--node-service)" />
        <path d="M9 13 V 18 H 33 V 20" stroke="var(--text-faint)" strokeWidth="1" fill="none" />
      </svg>
    )
  return (
    <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
      <circle cx="22" cy="6" r="3.5" fill="var(--node-edge)" opacity="0.9" />
      <rect x="16" y="14" width="12" height="6" rx="2" fill="var(--node-net)" opacity="0.9" />
      <rect x="4" y="26" width="10" height="6" rx="2" fill="var(--node-server)" opacity="0.9" />
      <rect x="17" y="26" width="10" height="6" rx="2" fill="var(--node-server)" opacity="0.9" />
      <rect x="30" y="26" width="10" height="6" rx="2" fill="var(--node-server)" opacity="0.9" />
      <path
        d="M22 9.5 V 14M22 20 v 2 M9 22 V 26 M22 22 V 26 M35 22 V 26 M9 22 H 35"
        stroke="var(--text-faint)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

function DiagramCard({
  diagram,
  onOpen,
  onDelete,
}: {
  diagram: Diagram
  onOpen: (id: DiagramId) => void
  onDelete: (id: DiagramId) => void
}) {
  const [menu, setMenu] = useState(false)
  const counts = {
    nodes: Object.keys(diagram.nodes || {}).length,
    edges: Object.keys(diagram.edges || {}).length,
  }
  return (
    <div className="kn-l-card" onClick={() => onOpen(diagram.id)}>
      <div
        className="kn-l-card-thumb"
        style={{ ['--thumb-bg' as string]: diagram.color || 'var(--lavender)' } as React.CSSProperties}
      >
        <DiagramThumb diagram={diagram} />
        {diagram.starred && <div className="kn-l-card-star">★</div>}
      </div>
      <div className="kn-l-card-body">
        <div className="kn-l-card-row">
          <div className="kn-l-card-name">{diagram.name}</div>
          <button
            className="kn-l-card-menu"
            onClick={(e) => {
              e.stopPropagation()
              setMenu(!menu)
            }}
          >
            ⋯
          </button>
        </div>
        <div className="kn-l-card-meta">
          <span>{counts.nodes} nodes</span>
          <span>·</span>
          <span>{counts.edges} edges</span>
          <span>·</span>
          <span>{relTime(diagram.updatedAt)}</span>
        </div>
        {menu && (
          <div className="kn-l-card-menu-pop" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                onDelete(diagram.id)
                setMenu(false)
              }}
            >
              Delete
            </button>
            <button onClick={() => setMenu(false)}>Duplicate</button>
            <button onClick={() => setMenu(false)}>Star</button>
          </div>
        )}
      </div>
    </div>
  )
}

function DiagramThumb({ diagram }: { diagram: Diagram }) {
  const ns = Object.values(diagram.nodes || {})
  if (ns.length === 0) {
    return (
      <div className="kn-l-thumb-empty">
        <CloudGlyph size={36} />
      </div>
    )
  }
  const minX = Math.min(...ns.map((n) => n.x))
  const minY = Math.min(...ns.map((n) => n.y))
  const maxX = Math.max(...ns.map((n) => n.x + n.w))
  const maxY = Math.max(...ns.map((n) => n.y + n.h))
  const w = maxX - minX
  const h = maxY - minY
  const pad = 20
  const vw = 280
  const vh = 140
  const scale = Math.min((vw - pad * 2) / w, (vh - pad * 2) / h)
  const ox = (vw - w * scale) / 2 - minX * scale
  const oy = (vh - h * scale) / 2 - minY * scale
  const edges = Object.values(diagram.edges || {})
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="xMidYMid meet">
      {edges.map((e) => {
        const a = diagram.nodes[e.from]
        const b = diagram.nodes[e.to]
        if (!a || !b) return null
        const ax = ox + (a.x + a.w / 2) * scale
        const ay = oy + (a.y + a.h / 2) * scale
        const bx = ox + (b.x + b.w / 2) * scale
        const by = oy + (b.y + b.h / 2) * scale
        const dx = Math.max(20, Math.abs(bx - ax) * 0.5)
        return (
          <path
            key={e.id}
            d={`M ${ax},${ay} C ${ax + dx},${ay} ${bx - dx},${by} ${bx},${by}`}
            stroke="var(--text-faint)"
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />
        )
      })}
      {ns.map((n) => (
        <rect
          key={n.id}
          x={ox + n.x * scale}
          y={oy + n.y * scale}
          width={n.w * scale}
          height={n.h * scale}
          rx={6}
          ry={6}
          fill={`var(${CAT_COLOR_VAR[NODE_TYPES[n.type]?.cat] ?? '--accent'})`}
          opacity="0.85"
        />
      ))}
    </svg>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'still up'
  if (h < 12) return 'good morning'
  if (h < 18) return 'good afternoon'
  return 'good evening'
}

function titleFor(id: Active): string {
  const m: Record<string, string> = {
    all: 'home',
    recent: 'recent',
    starred: 'starred',
    shared: 'shared',
    trash: 'trash',
  }
  return m[id] ?? 'workspace'
}

function relTime(ts: number): string {
  const d = (Date.now() - ts) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}d ago`
  return new Date(ts).toLocaleDateString()
}
