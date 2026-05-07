import { useRef } from 'react'
import { CAT_COLOR_VAR, NODE_TYPES } from '../nodes'
import type { DiagramEdge, DiagramNode, EdgeId, NodeId, View } from '../types'

interface Props {
  nodes: Record<NodeId, DiagramNode>
  edges: Record<EdgeId, DiagramEdge>
  view: View
  canvasSize: { w: number; h: number }
  setView: (updater: (v: View) => View) => void
}

const MM_W = 200
const MM_H = 130

export function Minimap({ nodes, view, canvasSize, setView }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const ns = Object.values(nodes)
  if (ns.length === 0) {
    return <div className="kn-minimap kn-minimap-empty">minimap</div>
  }

  const minX = Math.min(...ns.map((n) => n.x)) - 100
  const minY = Math.min(...ns.map((n) => n.y)) - 100
  const maxX = Math.max(...ns.map((n) => n.x + n.w)) + 100
  const maxY = Math.max(...ns.map((n) => n.y + n.h)) + 100
  const w = maxX - minX
  const h = maxY - minY
  const scale = Math.min(MM_W / w, MM_H / h)
  const offsetX = (MM_W - w * scale) / 2
  const offsetY = (MM_H - h * scale) / 2

  const viewportRect = canvasSize.w > 0
    ? {
        x: (-view.x / view.zoom - minX) * scale + offsetX,
        y: (-view.y / view.zoom - minY) * scale + offsetY,
        w: (canvasSize.w / view.zoom) * scale,
        h: (canvasSize.h / view.zoom) * scale,
      }
    : null

  const onMmDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect()
    const move = (ev: PointerEvent) => {
      const px = ev.clientX - r.left - offsetX
      const py = ev.clientY - r.top - offsetY
      const wx = px / scale + minX
      const wy = py / scale + minY
      setView((v) => ({ ...v, x: canvasSize.w / 2 - wx * v.zoom, y: canvasSize.h / 2 - wy * v.zoom }))
    }
    move(e.nativeEvent)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="kn-minimap" ref={ref} onPointerDown={onMmDown}>
      <svg width={MM_W} height={MM_H}>
        {ns.map((n) => (
          <rect
            key={n.id}
            x={offsetX + (n.x - minX) * scale}
            y={offsetY + (n.y - minY) * scale}
            width={n.w * scale}
            height={n.h * scale}
            rx="2"
            fill={`var(${CAT_COLOR_VAR[NODE_TYPES[n.type].cat]})`}
            opacity="0.7"
          />
        ))}
        {viewportRect && (
          <rect
            x={viewportRect.x}
            y={viewportRect.y}
            width={viewportRect.w}
            height={viewportRect.h}
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth="1"
          />
        )}
      </svg>
    </div>
  )
}
