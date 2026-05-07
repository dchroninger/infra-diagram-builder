import type { MouseEvent } from 'react'
import type { DiagramEdge, DiagramNode, EdgeId, NodeId } from '../types'
import { bestPorts, bezierPath, portPos } from './geometry'

interface Props {
  edge: DiagramEdge
  nodes: Record<NodeId, DiagramNode>
  selected: boolean
  animatedEdges: boolean
  onClick: (e: MouseEvent, id: EdgeId) => void
}

export function EdgeView({ edge, nodes, selected, animatedEdges, onClick }: Props) {
  const a = nodes[edge.from]
  const b = nodes[edge.to]
  if (!a || !b) return null
  const sides = bestPorts(a, b)
  const pa = portPos(a, sides.from)
  const pb = portPos(b, sides.to)
  const d = bezierPath(pa, pb)
  const arrowId = `arrow-${edge.id}`
  const arrowOpenId = `arrowo-${edge.id}`
  const kind = edge.kind ?? 'flow'
  const isFlow = kind === 'flow'
  const isBidir = kind === 'bidir'
  const isRef = kind === 'ref'

  const mx = (pa.x + pb.x) / 2
  const my = (pa.y + pb.y) / 2
  const labelText = edge.label ?? ''
  const labelW = Math.max(28, labelText.length * 6.6 + 14)
  const labelH = 18

  const animated = animatedEdges && !isRef

  return (
    <g
      className={`kn-edge kn-edge-${kind} ${selected ? 'is-selected' : ''}`}
      onClick={(e) => onClick(e, edge.id)}
    >
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
        <marker id={arrowOpenId} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 1 1 L 10 6 L 1 11" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <path d={d} stroke="transparent" strokeWidth="14" fill="none" style={{ cursor: 'pointer', pointerEvents: 'stroke' }} />
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={selected ? (isRef ? 1.6 : 2.4) : isRef ? 1.2 : 1.8}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={isRef ? 'none' : '5 5'}
        strokeOpacity={isRef ? 0.7 : 1}
        markerEnd={`url(#${isRef ? arrowOpenId : arrowId})`}
        markerStart={isBidir ? `url(#${isRef ? arrowOpenId : arrowId})` : undefined}
        style={{ pointerEvents: 'none' }}
      >
        {animated && isFlow && (
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.6s" repeatCount="indefinite" />
        )}
        {animated && isBidir && (
          <animate
            attributeName="stroke-dashoffset"
            values="0; -10; -10; 0; 0"
            keyTimes="0; 0.45; 0.5; 0.95; 1"
            dur="6s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {labelText && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={mx - labelW / 2}
            y={my - labelH / 2}
            width={labelW}
            height={labelH}
            rx="9"
            fill="var(--bg-1)"
            stroke="var(--border-soft)"
          />
          <text
            x={mx}
            y={my + 3.5}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fill="var(--text-muted)"
          >
            {labelText}
          </text>
        </g>
      )}
    </g>
  )
}
