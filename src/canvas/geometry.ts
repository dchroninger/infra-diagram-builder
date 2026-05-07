import type { DiagramNode, PortSide } from '../types'

export interface Pt {
  x: number
  y: number
}

export function bezierPath(a: Pt, b: Pt): string {
  const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5)
  return `M ${a.x},${a.y} C ${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
}

export function portPos(node: DiagramNode, side: PortSide): Pt {
  const { x, y, w, h } = node
  switch (side) {
    case 'r':
      return { x: x + w, y: y + h / 2 }
    case 'l':
      return { x, y: y + h / 2 }
    case 't':
      return { x: x + w / 2, y }
    case 'b':
      return { x: x + w / 2, y: y + h }
  }
}

export function bestPorts(a: DiagramNode, b: DiagramNode): { from: PortSide; to: PortSide } {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
  const dx = bc.x - ac.x
  const dy = bc.y - ac.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { from: dx > 0 ? 'r' : 'l', to: dx > 0 ? 'l' : 'r' }
  }
  return { from: dy > 0 ? 'b' : 't', to: dy > 0 ? 't' : 'b' }
}

export function clientToWorld(
  e: { clientX: number; clientY: number },
  canvasEl: HTMLElement,
  view: { x: number; y: number; zoom: number },
): Pt {
  const rect = canvasEl.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left - view.x) / view.zoom,
    y: (e.clientY - rect.top - view.y) / view.zoom,
  }
}
