import type { PointerEvent } from 'react'
import { CAT_COLOR_VAR, NODE_TYPES, shapeClip } from '../nodes'
import { NodeGlyph } from '../NodeGlyph'
import type { DiagramNode, NodeId, PortSide } from '../types'
import { ResizeHandles, type ResizeHandle } from './ResizeHandles'
import { LockIcon } from './icons'

interface Props {
  node: DiagramNode
  selected: boolean
  hover: boolean
  showPorts: boolean
  onPointerDown: (e: PointerEvent<HTMLDivElement>, id: NodeId) => void
  onPortDown: (e: PointerEvent<HTMLDivElement>, id: NodeId, side: PortSide) => void
  onResizeStart: (e: PointerEvent<HTMLDivElement>, id: NodeId, handle: ResizeHandle) => void
  onContext: (e: React.MouseEvent<HTMLDivElement>, id: NodeId) => void
  onPointerEnter?: (id: NodeId) => void
  onPointerLeave?: (id: NodeId) => void
}

const PORT_SIDES: PortSide[] = ['t', 'r', 'b', 'l']

export function NodeView({
  node,
  selected,
  hover,
  showPorts,
  onPointerDown,
  onPortDown,
  onResizeStart,
  onContext,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const def = NODE_TYPES[node.type]
  if (!def) return null
  const colorVar = CAT_COLOR_VAR[def.cat]
  const shape = def.shape
  const isCyl = shape === 'cylinder'
  const isHex = shape === 'hex'
  const isDia = shape === 'diamond'
  const isPar = shape === 'parallel'
  const isGroupShape = shape === 'group'
  const isContainerShape = shape === 'container'
  const isZoneShape = shape === 'zone'
  const clip = shapeClip(shape)
  const locked = !!node.locked

  return (
    <div
      className={`kn-node ${selected ? 'is-selected' : ''} ${hover ? 'is-hover' : ''} ${locked ? 'is-locked' : ''} cat-${def.cat} shape-${shape}`}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        cursor: locked ? 'default' : 'grab',
        userSelect: 'none',
        ['--node-color' as string]: `var(${colorVar})`,
      }}
      onPointerDown={(e) => onPointerDown(e, node.id)}
      onContextMenu={(e) => onContext(e, node.id)}
      onPointerEnter={() => onPointerEnter?.(node.id)}
      onPointerLeave={() => onPointerLeave?.(node.id)}
      data-node-id={node.id}
      data-container={def.container ? '1' : '0'}
    >
      {isCyl && (
        <svg className="kn-shape" viewBox={`0 0 ${node.w} ${node.h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--node-color)" stopOpacity="0.18" />
              <stop offset="1" stopColor="var(--node-color)" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <path
            d={`M 12 18 Q 12 4 ${node.w / 2} 4 Q ${node.w - 12} 4 ${node.w - 12} 18 L ${node.w - 12} ${node.h - 18} Q ${node.w - 12} ${node.h - 4} ${node.w / 2} ${node.h - 4} Q 12 ${node.h - 4} 12 ${node.h - 18} Z`}
            fill={`url(#grad-${node.id})`}
            stroke="var(--node-color)"
            strokeWidth="1.5"
          />
          <ellipse
            cx={node.w / 2}
            cy="18"
            rx={(node.w - 24) / 2}
            ry="14"
            fill="var(--surface-1)"
            stroke="var(--node-color)"
            strokeWidth="1.5"
          />
        </svg>
      )}
      {(isHex || isDia || isPar) && <div className="kn-shape kn-poly" style={{ clipPath: clip }} />}
      {isGroupShape && <div className="kn-shape kn-group" />}
      {isZoneShape && <div className="kn-shape kn-zone" />}
      {isContainerShape && <div className="kn-shape kn-container" />}
      {!isCyl && !isHex && !isDia && !isPar && !isGroupShape && !isZoneShape && !isContainerShape && (
        <div className="kn-shape kn-card" />
      )}

      {isGroupShape || isContainerShape || isZoneShape ? (
        <div className="kn-c-header">
          <div className="kn-c-icon" style={{ color: `var(${colorVar})` }}>
            <NodeGlyph type={def.icon} size={14} />
          </div>
          <div className="kn-c-label">{node.label || def.label}</div>
          <div className="kn-c-sub">{node.sub || def.sub}</div>
          {locked && (
            <span className="kn-c-lock">
              <LockIcon />
            </span>
          )}
        </div>
      ) : (
        <div className="kn-content">
          <div className="kn-icon">
            <NodeGlyph type={def.icon} />
          </div>
          <div className="kn-text">
            <div className="kn-label">{node.label || def.label}</div>
            <div className="kn-sub">{node.sub || def.sub}</div>
          </div>
          {locked && (
            <span className="kn-lock-mark">
              <LockIcon />
            </span>
          )}
        </div>
      )}

      {showPorts && !locked &&
        PORT_SIDES.map((side) => (
          <div
            key={side}
            className={`kn-port kn-port-${side}`}
            onPointerDown={(e) => {
              e.stopPropagation()
              onPortDown(e, node.id, side)
            }}
          />
        ))}

      {selected && (
        <ResizeHandles onStart={(e, h) => onResizeStart(e, node.id, h)} locked={locked} />
      )}
    </div>
  )
}
