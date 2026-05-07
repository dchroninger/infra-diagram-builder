import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, MouseEvent, PointerEvent } from 'react'
import { useStore } from '../store'
import type {
  BrandName,
  Diagram,
  DiagramEdge,
  DiagramNode,
  EdgeId,
  NodeId,
  PortSide,
  Selection,
  ThemeMode,
  View,
} from '../types'
import { isContainer, NODE_TYPES } from '../nodes'
import { useMascot, useMascotAnchor } from '../mascot/store'
import { bezierPath, clientToWorld, portPos } from '../canvas/geometry'
import { NodeView } from '../canvas/NodeView'
import { EdgeView } from '../canvas/EdgeView'
import type { ResizeHandle } from '../canvas/ResizeHandles'
import { Topbar } from './Topbar'
import { Palette } from './Palette'
import { RightPanel } from './RightPanel'
import { Minimap } from './Minimap'
import { ContextMenu, type ContextMenuTarget } from './ContextMenu'

const MIN_W = 80
const MIN_H = 56
const MIN_W_C = 200
const MIN_H_C = 140

const uid = () => Math.random().toString(36).slice(2, 9)

interface Props {
  diagram: Diagram
  brand: BrandName
  theme: ThemeMode
  toggleTheme: () => void
  crumbs: { id: string; name: string }[]
  onBack: () => void
  onCrumbJump: (idx: number) => void
}

export function Editor({ diagram, brand, theme, toggleTheme, crumbs, onBack, onCrumbJump }: Props) {
  const mutateNodes = useStore((s) => s.mutateNodes)
  const mutateEdges = useStore((s) => s.mutateEdges)
  const drillInto = useStore((s) => s.drillInto)
  const did = diagram.id

  const setNodes = useCallback(
    (fn: (ns: Record<NodeId, DiagramNode>) => Record<NodeId, DiagramNode>) => {
      mutateNodes(did, fn)
    },
    [did, mutateNodes],
  )
  const setEdges = useCallback(
    (fn: (es: Record<EdgeId, DiagramEdge>) => Record<EdgeId, DiagramEdge>) => {
      mutateEdges(did, fn)
    },
    [did, mutateEdges],
  )

  const nodes = diagram.nodes
  const edges = diagram.edges

  const canvasMascotAnchor = useMascotAnchor('canvas-center')
  const { setActive: setMascotActive } = useMascot()
  const nodeCount = Object.keys(nodes).length
  useEffect(() => {
    setMascotActive(nodeCount === 0 ? 'canvas-center' : 'props-footer')
  }, [nodeCount, setMascotActive])

  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 })
  const [selection, setSelection] = useState<Selection>({ nodes: new Set(), edges: new Set() })
  const [hoverNode, setHoverNode] = useState<NodeId | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null)
  const [draftEdge, setDraftEdge] = useState<{ ax: number; ay: number; bx: number; by: number } | null>(null)
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const [rightTab, setRightTab] = useState<'properties' | 'layers'>('properties')
  const [animatedEdges, setAnimatedEdges] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Track canvas size for minimap + fit calculations
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setCanvasSize({ w: r.width, h: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Fit to view ────────────────────────────────────────────────────
  const fitView = useCallback(() => {
    const ns = Object.values(nodes)
    if (!ns.length) {
      setView({ x: 0, y: 0, zoom: 1 })
      return
    }
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const minX = Math.min(...ns.map((n) => n.x))
    const minY = Math.min(...ns.map((n) => n.y))
    const maxX = Math.max(...ns.map((n) => n.x + n.w))
    const maxY = Math.max(...ns.map((n) => n.y + n.h))
    const rect = canvasEl.getBoundingClientRect()
    const pad = 80
    const zx = (rect.width - pad * 2) / (maxX - minX)
    const zy = (rect.height - pad * 2) / (maxY - minY)
    const zoom = Math.min(1.2, Math.min(zx, zy))
    setView({
      x: rect.width / 2 - ((minX + maxX) / 2) * zoom,
      y: rect.height / 2 - ((minY + maxY) / 2) * zoom,
      zoom,
    })
  }, [nodes])

  // Initial fit once canvas has measured dimensions and the diagram has nodes.
  // setView in an effect is intentional — we sync to DOM-measured size.
  const fitOnceRef = useRef(false)
  useEffect(() => {
    if (fitOnceRef.current) return
    if (canvasSize.w === 0) return
    if (Object.keys(nodes).length === 0) return
    fitOnceRef.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fitView()
  }, [nodes, fitView, canvasSize])

  // ── Pan/zoom (wheel) ───────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const factor = Math.exp(-e.deltaY * 0.01)
        setView((v) => {
          const newZoom = Math.max(0.2, Math.min(3, v.zoom * factor))
          const k = newZoom / v.zoom
          return { x: mx - (mx - v.x) * k, y: my - (my - v.y) * k, zoom: newZoom }
        })
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Canvas pointer down (pan with alt/middle, marquee otherwise) ────
  const onCanvasPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target !== canvasRef.current) return
    setContextMenu(null)
    if (e.button === 1 || e.altKey) {
      const start = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }
      const move = (ev: PointerEvent | globalThis.PointerEvent) =>
        setView((v) => ({ ...v, x: start.vx + ev.clientX - start.x, y: start.vy + ev.clientY - start.y }))
      const up = () => {
        window.removeEventListener('pointermove', move as EventListener)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move as EventListener)
      window.addEventListener('pointerup', up)
      return
    }
    if (e.button !== 0) return
    const start = clientToWorld(e, canvasRef.current!, view)
    setSelection({ nodes: new Set(), edges: new Set() })
    setMarquee({ x0: start.x, y0: start.y, x1: start.x, y1: start.y })
    const move = (ev: globalThis.PointerEvent) => {
      const p = clientToWorld(ev, canvasRef.current!, view)
      setMarquee({ x0: start.x, y0: start.y, x1: p.x, y1: p.y })
    }
    const up = (ev: globalThis.PointerEvent) => {
      const p = clientToWorld(ev, canvasRef.current!, view)
      const minX = Math.min(start.x, p.x)
      const maxX = Math.max(start.x, p.x)
      const minY = Math.min(start.y, p.y)
      const maxY = Math.max(start.y, p.y)
      const hits = new Set<NodeId>()
      for (const n of Object.values(nodes)) {
        if (n.x + n.w >= minX && n.x <= maxX && n.y + n.h >= minY && n.y <= maxY) hits.add(n.id)
      }
      setSelection({ nodes: hits, edges: new Set() })
      setMarquee(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onCanvasContext = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: 'canvas',
      world: clientToWorld(e, canvasRef.current!, view),
    })
  }

  // ── Node drag ──────────────────────────────────────────────────────
  const onNodePointerDown = (e: PointerEvent<HTMLDivElement>, nodeId: NodeId) => {
    e.stopPropagation()
    if (e.button === 2) return
    if (nodes[nodeId]?.locked) return
    const additive = e.shiftKey || e.metaKey
    let sel = selection.nodes
    if (!sel.has(nodeId)) {
      sel = additive ? new Set([...sel, nodeId]) : new Set([nodeId])
      setSelection({ nodes: sel, edges: new Set() })
    } else if (additive) {
      const next = new Set(sel)
      next.delete(nodeId)
      sel = next
      setSelection({ nodes: next, edges: new Set() })
    }
    const start = { x: e.clientX, y: e.clientY }
    const startPositions: Record<NodeId, { x: number; y: number }> = {}
    for (const id of sel) startPositions[id] = { x: nodes[id].x, y: nodes[id].y }
    const move = (ev: globalThis.PointerEvent) => {
      const dx = (ev.clientX - start.x) / view.zoom
      const dy = (ev.clientY - start.y) / view.zoom
      setNodes((ns) => {
        const next = { ...ns }
        for (const id of sel) {
          const sp = startPositions[id]
          if (!next[id] || !sp) continue
          next[id] = { ...next[id], x: sp.x + dx, y: sp.y + dy }
        }
        return next
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onNodeContext = (e: MouseEvent<HTMLDivElement>, nodeId: NodeId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selection.nodes.has(nodeId)) {
      setSelection({ nodes: new Set([nodeId]), edges: new Set() })
    }
    setContextMenu({ x: e.clientX, y: e.clientY, target: 'node', nodeId })
  }

  // ── Resize ─────────────────────────────────────────────────────────
  const onResizeStart = (e: PointerEvent<HTMLDivElement>, nodeId: NodeId, handle: ResizeHandle) => {
    e.stopPropagation()
    e.preventDefault()
    const node = nodes[nodeId]
    if (!node || node.locked) return
    const def = NODE_TYPES[node.type]
    const containerNode = !!def?.container
    const minW = containerNode ? MIN_W_C : MIN_W
    const minH = containerNode ? MIN_H_C : MIN_H
    const start = { x: e.clientX, y: e.clientY, w: node.w, h: node.h, nx: node.x, ny: node.y }
    const move = (ev: globalThis.PointerEvent) => {
      const dx = (ev.clientX - start.x) / view.zoom
      const dy = (ev.clientY - start.y) / view.zoom
      let nx = start.nx
      let ny = start.ny
      let w = start.w
      let h = start.h
      if (handle.includes('e')) w = Math.max(minW, start.w + dx)
      if (handle.includes('s')) h = Math.max(minH, start.h + dy)
      if (handle.includes('w')) {
        const newW = Math.max(minW, start.w - dx)
        nx = start.nx + (start.w - newW)
        w = newW
      }
      if (handle.includes('n')) {
        const newH = Math.max(minH, start.h - dy)
        ny = start.ny + (start.h - newH)
        h = newH
      }
      setNodes((ns) => ({ ...ns, [nodeId]: { ...ns[nodeId], x: nx, y: ny, w, h } }))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ── Port drag → create edge ────────────────────────────────────────
  const onPortDown = (e: PointerEvent<HTMLDivElement>, nodeId: NodeId, side: PortSide) => {
    e.stopPropagation()
    const startPort = portPos(nodes[nodeId], side)
    setDraftEdge({ ax: startPort.x, ay: startPort.y, bx: startPort.x, by: startPort.y })
    const move = (ev: globalThis.PointerEvent) => {
      const p = clientToWorld(ev, canvasRef.current!, view)
      setDraftEdge((d) => (d ? { ...d, bx: p.x, by: p.y } : null))
    }
    const up = (ev: globalThis.PointerEvent) => {
      const target = document.elementFromPoint(ev.clientX, ev.clientY)
      const nodeEl = target?.closest('[data-node-id]') as HTMLElement | null
      const targetId = nodeEl?.dataset.nodeId
      if (targetId && targetId !== nodeId) {
        const id = uid()
        setEdges((es) => ({
          ...es,
          [id]: { id, from: nodeId, to: targetId, label: '', kind: 'flow' },
        }))
      }
      setDraftEdge(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ── Drop from palette ──────────────────────────────────────────────
  const onPaletteDragStart = (e: DragEvent<HTMLDivElement>, type: string) => {
    e.dataTransfer.setData('application/x-kumo-node', type)
    e.dataTransfer.effectAllowed = 'copy'
  }
  const onCanvasDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/x-kumo-node')
    if (!type || !NODE_TYPES[type]) return
    const def = NODE_TYPES[type]
    const p = clientToWorld(e, canvasRef.current!, view)
    const id = uid()
    setNodes((ns) => ({
      ...ns,
      [id]: {
        id,
        type,
        x: p.x - def.w / 2,
        y: p.y - def.h / 2,
        w: def.w,
        h: def.h,
        label: def.label,
        sub: def.sub,
      },
    }))
    setSelection({ nodes: new Set([id]), edges: new Set() })
  }

  // ── Edge click ─────────────────────────────────────────────────────
  const onEdgeClick = (e: MouseEvent, edgeId: EdgeId) => {
    e.stopPropagation()
    const additive = e.shiftKey || e.metaKey
    setSelection((s) => ({
      nodes: additive ? s.nodes : new Set(),
      edges: additive ? new Set([...s.edges, edgeId]) : new Set([edgeId]),
    }))
  }

  // ── Keyboard ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selection.nodes.size === 0 && selection.edges.size === 0) return
        setNodes((ns) => {
          const next = { ...ns }
          for (const id of selection.nodes) delete next[id]
          return next
        })
        setEdges((es) => {
          const next: Record<EdgeId, DiagramEdge> = {}
          for (const [k, e2] of Object.entries(es)) {
            if (selection.edges.has(k)) continue
            if (selection.nodes.has(e2.from) || selection.nodes.has(e2.to)) continue
            next[k] = e2
          }
          return next
        })
        setSelection({ nodes: new Set(), edges: new Set() })
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        setSelection({ nodes: new Set(Object.keys(nodes)), edges: new Set() })
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selection.nodes.size) {
        e.preventDefault()
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
      }
      if (e.key === 'Escape') {
        setSelection({ nodes: new Set(), edges: new Set() })
        setContextMenu(null)
      }
      if (e.key === 'f') fitView()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection, nodes, fitView, setNodes, setEdges])

  // ── Context menu auto-close ────────────────────────────────────────
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('mousedown', close, { capture: true })
    return () => window.removeEventListener('mousedown', close, { capture: true })
  }, [contextMenu])

  // ── Single selected derived ────────────────────────────────────────
  const selectedNode = selection.nodes.size === 1 ? nodes[[...selection.nodes][0]] ?? null : null
  const selectedEdge = selection.edges.size === 1 ? edges[[...selection.edges][0]] ?? null : null

  const updateNode = (patch: Partial<DiagramNode>) => {
    if (!selectedNode) return
    setNodes((ns) => ({ ...ns, [selectedNode.id]: { ...ns[selectedNode.id], ...patch } }))
  }
  const updateEdge = (patch: Partial<DiagramEdge>) => {
    if (!selectedEdge) return
    setEdges((es) => ({ ...es, [selectedEdge.id]: { ...es[selectedEdge.id], ...patch } }))
  }

  // ── Sorted nodes (containers first) ────────────────────────────────
  const sortedNodes = useMemo(() => {
    return Object.values(nodes).sort((a, b) => {
      const ac = isContainer(a.type) ? 0 : 1
      const bc = isContainer(b.type) ? 0 : 1
      return ac - bc
    })
  }, [nodes])

  // ── Grid background ────────────────────────────────────────────────
  const gridSize = 24
  const gridStyle = {
    backgroundImage: 'radial-gradient(circle, var(--grid-dot) 1.2px, transparent 1.6px)',
    backgroundSize: `${gridSize * view.zoom}px ${gridSize * view.zoom}px`,
    backgroundPosition: `${view.x}px ${view.y}px`,
  }

  return (
    <div className="kn-editor">
      <Topbar
        brand={brand}
        theme={theme}
        toggleTheme={toggleTheme}
        crumbs={crumbs}
        onBack={onBack}
        onCrumbJump={onCrumbJump}
      />
      <div className="kn-workspace">
        <Palette onDragStart={onPaletteDragStart} />
        <div className="kn-canvas-wrap" onContextMenu={(e) => e.preventDefault()}>
          <div
            ref={canvasRef}
            className="kn-canvas kn-grid"
            style={gridStyle}
            onPointerDown={onCanvasPointerDown}
            onContextMenu={onCanvasContext}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={onCanvasDrop}
          >
            <div
              className="kn-world"
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
                transformOrigin: '0 0',
              }}
            >
              <svg
                className="kn-edges"
                width="10000"
                height="10000"
                style={{ position: 'absolute', left: -5000, top: -5000, pointerEvents: 'none' }}
              >
                <g transform="translate(5000 5000)" style={{ pointerEvents: 'auto' }}>
                  {Object.values(edges).map((edge) => (
                    <EdgeView
                      key={edge.id}
                      edge={edge}
                      nodes={nodes}
                      selected={selection.edges.has(edge.id)}
                      animatedEdges={animatedEdges}
                      onClick={onEdgeClick}
                    />
                  ))}
                  {draftEdge && (
                    <path
                      d={bezierPath({ x: draftEdge.ax, y: draftEdge.ay }, { x: draftEdge.bx, y: draftEdge.by })}
                      stroke="var(--accent)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              </svg>

              {sortedNodes.map((node) => (
                <NodeView
                  key={node.id}
                  node={node}
                  selected={selection.nodes.has(node.id)}
                  hover={hoverNode === node.id}
                  showPorts={selection.nodes.has(node.id) || hoverNode === node.id || !!draftEdge}
                  onPointerDown={onNodePointerDown}
                  onPortDown={onPortDown}
                  onResizeStart={onResizeStart}
                  onContext={onNodeContext}
                  onPointerEnter={(id) => setHoverNode(id)}
                  onPointerLeave={(id) => setHoverNode((h) => (h === id ? null : h))}
                />
              ))}

              {marquee && (
                <div
                  className="kn-marquee"
                  style={{
                    left: Math.min(marquee.x0, marquee.x1),
                    top: Math.min(marquee.y0, marquee.y1),
                    width: Math.abs(marquee.x1 - marquee.x0),
                    height: Math.abs(marquee.y1 - marquee.y0),
                  }}
                />
              )}
            </div>

            {Object.keys(nodes).length === 0 && (
              <div className="kn-empty-canvas">
                <div ref={canvasMascotAnchor} className="kn-empty-cloud" />
                <h3>start by dragging a node</h3>
                <p>pick anything from the left palette, or right-click to add</p>
              </div>
            )}
          </div>

          <div className="kn-zoom-ctl">
            <button onClick={() => setView((v) => ({ ...v, zoom: Math.min(3, v.zoom * 1.25) }))} title="Zoom in">
              +
            </button>
            <button onClick={fitView} title="Fit to view">
              {Math.round(view.zoom * 100)}%
            </button>
            <button onClick={() => setView((v) => ({ ...v, zoom: Math.max(0.2, v.zoom / 1.25) }))} title="Zoom out">
              −
            </button>
          </div>

          <Minimap nodes={nodes} edges={edges} view={view} canvasSize={canvasSize} setView={setView} />
        </div>

        <RightPanel
          tab={rightTab}
          setTab={setRightTab}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          updateNode={updateNode}
          updateEdge={updateEdge}
          nodes={nodes}
          edges={edges}
          selection={selection}
          setSelection={setSelection}
          animatedEdges={animatedEdges}
          setAnimatedEdges={setAnimatedEdges}
          onDrillInto={drillInto}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          ctx={contextMenu}
          nodes={nodes}
          setNodes={setNodes}
          setEdges={setEdges}
          selection={selection}
          setSelection={setSelection}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
