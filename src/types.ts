export type DiagramId = string
export type NodeId = string
export type EdgeId = string

export type EdgeKind = 'flow' | 'bidir' | 'ref'
export type PortSide = 't' | 'r' | 'b' | 'l'

export type ThemeMode = 'dark' | 'light'
export type AccentName = 'mauve' | 'pink' | 'blue' | 'teal' | 'peach' | 'green'
export type BrandName = 'Kumo' | 'Mochi' | 'Lattice'

export interface KVPair {
  k: string
  v: string
}

export interface DiagramNode {
  id: NodeId
  type: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  notes?: string
  meta?: KVPair[]
  locked?: boolean
  subdiagramId?: DiagramId
}

export interface DiagramEdge {
  id: EdgeId
  from: NodeId
  to: NodeId
  fromSide?: PortSide
  toSide?: PortSide
  label?: string
  kind?: EdgeKind
}

export interface Diagram {
  id: DiagramId
  name: string
  desc: string
  color: string
  starred: boolean
  shared: boolean
  updatedAt: number
  parentDiagramId?: DiagramId
  parentNodeId?: NodeId
  nodes: Record<NodeId, DiagramNode>
  edges: Record<EdgeId, DiagramEdge>
}

export interface Tweaks {
  theme: ThemeMode
  accent: AccentName
  brand: BrandName
}

export interface Selection {
  nodes: Set<NodeId>
  edges: Set<EdgeId>
}

export interface View {
  x: number
  y: number
  zoom: number
}
