import { NODE_TYPES } from '../nodes'
import { NodeGlyph } from '../NodeGlyph'
import type { DiagramEdge, DiagramNode, EdgeId, NodeId, Selection } from '../types'
import type { Pt } from '../canvas/geometry'

export interface ContextMenuTarget {
  x: number
  y: number
  target: 'canvas' | 'node'
  nodeId?: NodeId
  world?: Pt
}

interface Props {
  ctx: ContextMenuTarget
  nodes: Record<NodeId, DiagramNode>
  setNodes: (fn: (ns: Record<NodeId, DiagramNode>) => Record<NodeId, DiagramNode>) => void
  setEdges: (fn: (es: Record<EdgeId, DiagramEdge>) => Record<EdgeId, DiagramEdge>) => void
  selection: Selection
  setSelection: (s: Selection) => void
  onClose: () => void
}

const uid = () => Math.random().toString(36).slice(2, 9)

interface Item {
  label?: string
  kbd?: string
  onClick?: () => void
  icon?: string
  danger?: boolean
  sep?: boolean
  sect?: boolean
}

export function ContextMenu({ ctx, setNodes, setEdges, selection, setSelection, onClose }: Props) {
  const items: Item[] = []
  if (ctx.target === 'node') {
    items.push(
      {
        label: 'Duplicate',
        kbd: '⌘D',
        onClick: () => {
          const newIds = new Set<NodeId>()
          setNodes((ns) => {
            const next = { ...ns }
            for (const id of selection.nodes) {
              const n = ns[id]
              if (!n) continue
              const nid = uid()
              newIds.add(nid)
              next[nid] = { ...n, id: nid, x: n.x + 24, y: n.y + 24 }
            }
            return next
          })
          setSelection({ nodes: newIds, edges: new Set() })
        },
      },
      { label: 'Bring to front', onClick: () => {} },
      { sep: true },
      {
        label: 'Delete',
        kbd: '⌫',
        danger: true,
        onClick: () => {
          setNodes((ns) => {
            const next = { ...ns }
            for (const id of selection.nodes) delete next[id]
            return next
          })
          setEdges((es) => {
            const next: Record<EdgeId, DiagramEdge> = {}
            for (const [k, e] of Object.entries(es)) {
              if (selection.nodes.has(e.from) || selection.nodes.has(e.to)) continue
              next[k] = e
            }
            return next
          })
          setSelection({ nodes: new Set(), edges: new Set() })
        },
      },
    )
  } else {
    const types = ['service', 'postgres', 'redis', 'loadbalancer', 'user', 'docker', 'kafka', 'cdn']
    items.push({ label: 'Add node', sect: true })
    for (const t of types) {
      const def = NODE_TYPES[t]
      items.push({
        label: def.label,
        icon: t,
        onClick: () => {
          const id = uid()
          const world = ctx.world!
          setNodes((ns) => ({
            ...ns,
            [id]: {
              id,
              type: t,
              x: world.x - def.w / 2,
              y: world.y - def.h / 2,
              w: def.w,
              h: def.h,
              label: def.label,
              sub: def.sub,
            },
          }))
          setSelection({ nodes: new Set([id]), edges: new Set() })
        },
      })
    }
  }
  return (
    <div className="kn-ctxmenu" style={{ left: ctx.x, top: ctx.y }} onMouseDown={(e) => e.stopPropagation()}>
      {items.map((it, i) => {
        if (it.sep) return <div key={i} className="kn-ctx-sep" />
        if (it.sect) return <div key={i} className="kn-ctx-sect">{it.label}</div>
        return (
          <button
            key={i}
            className={`kn-ctx-item ${it.danger ? 'is-danger' : ''}`}
            onClick={() => {
              it.onClick?.()
              onClose()
            }}
          >
            {it.icon && (
              <span className="kn-ctx-icon">
                <NodeGlyph type={NODE_TYPES[it.icon].icon} size={14} />
              </span>
            )}
            <span>{it.label}</span>
            {it.kbd && <span className="kn-kbd">{it.kbd}</span>}
          </button>
        )
      })}
    </div>
  )
}
