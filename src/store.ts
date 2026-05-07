import { create } from 'zustand'
import type {
  Diagram,
  DiagramEdge,
  DiagramId,
  DiagramNode,
  EdgeId,
  NodeId,
  Tweaks,
} from './types'
import { NODE_TYPES } from './nodes'

const DIAGRAMS_KEY = 'kumo:diagrams:v2'
const TWEAKS_KEY = 'kumo:tweaks:v1'

export const TWEAK_DEFAULTS: Tweaks = {
  theme: 'dark',
  accent: 'blue',
  brand: 'Kumo',
}

const uid = () => Math.random().toString(36).slice(2, 9)

// ── Templates ──────────────────────────────────────────────────────────
type DiagramShell = Pick<Diagram, 'nodes' | 'edges'>

function makeNode(id: NodeId, type: string, x: number, y: number, label: string, sub?: string): DiagramNode {
  const def = NODE_TYPES[type]
  return { id, type, x, y, w: def.w, h: def.h, label, sub: sub ?? def.sub }
}

function makeEdge(from: NodeId, to: NodeId, label = ''): DiagramEdge {
  return { id: uid(), from, to, label, kind: 'flow' }
}

function templateMicroservices(): DiagramShell {
  const ids = { user: uid(), cdn: uid(), gw: uid(), auth: uid(), api: uid(), worker: uid(), pg: uid(), redis: uid(), kafka: uid() }
  const nodes = Object.fromEntries([
    makeNode(ids.user, 'user', 60, 200, 'User', 'web + mobile'),
    makeNode(ids.cdn, 'cdn', 280, 200, 'CDN', 'edge'),
    makeNode(ids.gw, 'gateway', 480, 200, 'API Gateway', 'kong'),
    makeNode(ids.auth, 'service', 720, 80, 'Auth', 'oauth + jwt'),
    makeNode(ids.api, 'service', 720, 220, 'API', 'core service'),
    makeNode(ids.worker, 'worker', 720, 380, 'Worker', 'jobs'),
    makeNode(ids.pg, 'postgres', 980, 220, 'Postgres', 'primary db'),
    makeNode(ids.redis, 'redis', 980, 100, 'Redis', 'session cache'),
    makeNode(ids.kafka, 'kafka', 980, 380, 'Kafka', 'event bus'),
  ].map((n) => [n.id, n]))
  const edges = Object.fromEntries([
    makeEdge(ids.user, ids.cdn, 'https'),
    makeEdge(ids.cdn, ids.gw),
    makeEdge(ids.gw, ids.auth, 'auth'),
    makeEdge(ids.gw, ids.api, 'rpc'),
    makeEdge(ids.api, ids.pg, 'sql'),
    makeEdge(ids.api, ids.redis, 'cache'),
    makeEdge(ids.api, ids.kafka, 'publish'),
    makeEdge(ids.kafka, ids.worker, 'consume'),
    makeEdge(ids.worker, ids.pg),
  ].map((e) => [e.id, e]))
  return { nodes, edges }
}

function templateNet(): DiagramShell {
  const ids = { user: uid(), dns: uid(), cdn: uid(), lb: uid(), s1: uid(), s2: uid(), s3: uid(), db: uid() }
  const nodes = Object.fromEntries([
    makeNode(ids.user, 'browser', 60, 240, 'Client', 'browser'),
    makeNode(ids.dns, 'dns', 280, 100, 'DNS', 'route 53'),
    makeNode(ids.cdn, 'cdn', 280, 240, 'CDN', 'cloudfront'),
    makeNode(ids.lb, 'loadbalancer', 500, 240, 'Load Balancer', 'alb'),
    makeNode(ids.s1, 'docker', 740, 120, 'app-1', 'container'),
    makeNode(ids.s2, 'docker', 740, 240, 'app-2', 'container'),
    makeNode(ids.s3, 'docker', 740, 360, 'app-3', 'container'),
    makeNode(ids.db, 'postgres', 980, 240, 'Database', 'rds'),
  ].map((n) => [n.id, n]))
  const edges = Object.fromEntries([
    makeEdge(ids.user, ids.dns, 'lookup'),
    makeEdge(ids.user, ids.cdn, 'http'),
    makeEdge(ids.cdn, ids.lb),
    makeEdge(ids.lb, ids.s1),
    makeEdge(ids.lb, ids.s2),
    makeEdge(ids.lb, ids.s3),
    makeEdge(ids.s1, ids.db),
    makeEdge(ids.s2, ids.db),
    makeEdge(ids.s3, ids.db),
  ].map((e) => [e.id, e]))
  return { nodes, edges }
}

function templateUml(): DiagramShell {
  const ids = { user: uid(), order: uid(), item: uid(), pay: uid() }
  const nodes = Object.fromEntries([
    makeNode(ids.user, 'user', 80, 80, 'User', 'class'),
    makeNode(ids.order, 'service', 380, 80, 'Order', 'aggregate root'),
    makeNode(ids.item, 'service', 680, 80, 'LineItem', 'value object'),
    makeNode(ids.pay, 'service', 380, 260, 'Payment', 'service'),
  ].map((n) => [n.id, n]))
  const edges = Object.fromEntries([
    makeEdge(ids.user, ids.order, 'places'),
    makeEdge(ids.order, ids.item, 'has *'),
    makeEdge(ids.order, ids.pay, 'paid by'),
  ].map((e) => [e.id, e]))
  return { nodes, edges }
}

const templateBlank = (): DiagramShell => ({ nodes: {}, edges: {} })

export type TemplateKind = 'blank' | 'msa' | 'uml' | 'net' | 'seq'

const TEMPLATES: Record<TemplateKind, () => DiagramShell> = {
  blank: templateBlank,
  msa: templateMicroservices,
  uml: templateUml,
  net: templateNet,
  seq: templateBlank,
}

const TEMPLATE_NAME: Record<TemplateKind, string> = {
  blank: 'Untitled diagram',
  msa: 'Microservices',
  uml: 'UML model',
  net: 'Network',
  seq: 'Sequence',
}

const TEMPLATE_COLOR: Record<TemplateKind, string> = {
  blank: 'var(--lavender)',
  msa: 'var(--blue)',
  uml: 'var(--pink)',
  net: 'var(--teal)',
  seq: 'var(--lavender)',
}

// ── Seed ───────────────────────────────────────────────────────────────
function seedDiagrams(): Record<DiagramId, Diagram> {
  const now = Date.now()
  const make = (
    id: DiagramId,
    name: string,
    desc: string,
    color: string,
    gen: () => DiagramShell,
    starred = false,
    ago = 0,
    shared = false,
  ): Diagram => ({
    id,
    name,
    desc,
    color,
    starred,
    shared,
    updatedAt: now - ago,
    ...gen(),
  })
  const items: Diagram[] = [
    make('d1', 'Order service', 'core checkout pipeline', 'var(--mauve)', templateMicroservices, true, 1000 * 60 * 12),
    make('d2', 'Public network', 'cdn → lb → containers', 'var(--blue)', templateNet, false, 1000 * 60 * 60 * 3, true),
    make('d3', 'Domain model', 'order aggregate w/ items', 'var(--pink)', templateUml, true, 1000 * 60 * 60 * 30),
    make('d4', 'Notifications', 'event-driven workers', 'var(--teal)', templateMicroservices, false, 1000 * 60 * 60 * 24 * 4),
    make('d5', 'Sandbox', 'scratchpad', 'var(--peach)', templateBlank, false, 1000 * 60 * 60 * 24 * 12),
    make('d6', 'New billing flow', 'wip', 'var(--green)', templateBlank, false, 1000 * 60 * 60 * 24 * 28),
  ]
  return Object.fromEntries(items.map((d) => [d.id, d]))
}

// ── Persistence ────────────────────────────────────────────────────────
function loadDiagrams(): Record<DiagramId, Diagram> | null {
  try {
    const raw = localStorage.getItem(DIAGRAMS_KEY)
    if (raw) return JSON.parse(raw) as Record<DiagramId, Diagram>
  } catch {
    // ignore
  }
  return null
}

function saveDiagrams(d: Record<DiagramId, Diagram>) {
  try {
    localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(d))
  } catch {
    // ignore
  }
}

function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(TWEAKS_KEY)
    if (raw) return { ...TWEAK_DEFAULTS, ...(JSON.parse(raw) as Partial<Tweaks>) }
  } catch {
    // ignore
  }
  return TWEAK_DEFAULTS
}

function saveTweaks(t: Tweaks) {
  try {
    localStorage.setItem(TWEAKS_KEY, JSON.stringify(t))
  } catch {
    // ignore
  }
}

// ── Store ──────────────────────────────────────────────────────────────
interface StoreState {
  diagrams: Record<DiagramId, Diagram>
  openStack: DiagramId[]
  tweaks: Tweaks

  // diagram CRUD
  createDiagram: (kind?: TemplateKind, openIt?: boolean) => DiagramId
  deleteDiagram: (id: DiagramId) => void
  patchDiagram: (id: DiagramId, patch: Partial<Diagram>) => void

  // node/edge mutations on a specific diagram
  mutateNodes: (id: DiagramId, fn: (ns: Record<NodeId, DiagramNode>) => Record<NodeId, DiagramNode>) => void
  mutateEdges: (id: DiagramId, fn: (es: Record<EdgeId, DiagramEdge>) => Record<EdgeId, DiagramEdge>) => void

  // breadcrumb navigation
  setOpenId: (id: DiagramId | null) => void
  pushOpen: (id: DiagramId) => void
  popOpen: () => void
  jumpTo: (idx: number) => void
  drillInto: (nodeId: NodeId) => void

  // tweaks
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void
}

export const useStore = create<StoreState>((set, get) => ({
  diagrams: loadDiagrams() ?? seedDiagrams(),
  openStack: [],
  tweaks: loadTweaks(),

  createDiagram: (kind = 'blank', openIt = true) => {
    const id = 'd' + uid()
    const tpl = TEMPLATES[kind]()
    const d: Diagram = {
      id,
      name: TEMPLATE_NAME[kind],
      desc: '',
      color: TEMPLATE_COLOR[kind],
      starred: false,
      shared: false,
      updatedAt: Date.now(),
      ...tpl,
    }
    set((s) => {
      const diagrams = { ...s.diagrams, [id]: d }
      saveDiagrams(diagrams)
      return { diagrams, openStack: openIt ? [id] : s.openStack }
    })
    return id
  },

  deleteDiagram: (id) => {
    set((s) => {
      const diagrams = { ...s.diagrams }
      delete diagrams[id]
      saveDiagrams(diagrams)
      const openStack = s.openStack.filter((x) => x !== id)
      return { diagrams, openStack }
    })
  },

  patchDiagram: (id, patch) => {
    set((s) => {
      const cur = s.diagrams[id]
      if (!cur) return s
      const diagrams = { ...s.diagrams, [id]: { ...cur, ...patch, updatedAt: Date.now() } }
      saveDiagrams(diagrams)
      return { diagrams }
    })
  },

  mutateNodes: (id, fn) => {
    set((s) => {
      const cur = s.diagrams[id]
      if (!cur) return s
      const nodes = fn(cur.nodes)
      if (nodes === cur.nodes) return s
      const diagrams = { ...s.diagrams, [id]: { ...cur, nodes, updatedAt: Date.now() } }
      saveDiagrams(diagrams)
      return { diagrams }
    })
  },

  mutateEdges: (id, fn) => {
    set((s) => {
      const cur = s.diagrams[id]
      if (!cur) return s
      const edges = fn(cur.edges)
      if (edges === cur.edges) return s
      const diagrams = { ...s.diagrams, [id]: { ...cur, edges, updatedAt: Date.now() } }
      saveDiagrams(diagrams)
      return { diagrams }
    })
  },

  setOpenId: (id) => set({ openStack: id == null ? [] : [id] }),
  pushOpen: (id) =>
    set((s) => (s.openStack[s.openStack.length - 1] === id ? s : { openStack: [...s.openStack, id] })),
  popOpen: () => set((s) => ({ openStack: s.openStack.slice(0, -1) })),
  jumpTo: (idx) => set((s) => ({ openStack: s.openStack.slice(0, idx + 1) })),

  drillInto: (nodeId) => {
    const s = get()
    const openId = s.openStack[s.openStack.length - 1]
    const open = openId ? s.diagrams[openId] : null
    const node = open?.nodes[nodeId]
    if (!open || !node) return
    if (node.subdiagramId && s.diagrams[node.subdiagramId]) {
      get().pushOpen(node.subdiagramId)
      return
    }
    const sid = 'd' + uid()
    const sub: Diagram = {
      id: sid,
      name: node.label || 'Subdiagram',
      desc: 'subdiagram of ' + open.name,
      color: open.color,
      nodes: {},
      edges: {},
      parentDiagramId: open.id,
      parentNodeId: nodeId,
      starred: false,
      shared: false,
      updatedAt: Date.now(),
    }
    set((cur) => {
      const parent = cur.diagrams[open.id]
      const updatedParent: Diagram = {
        ...parent,
        nodes: {
          ...parent.nodes,
          [nodeId]: { ...parent.nodes[nodeId], subdiagramId: sid },
        },
        updatedAt: Date.now(),
      }
      const diagrams = { ...cur.diagrams, [sid]: sub, [open.id]: updatedParent }
      saveDiagrams(diagrams)
      return { diagrams, openStack: [...cur.openStack, sid] }
    })
  },

  setTweak: (key, value) => {
    set((s) => {
      const tweaks = { ...s.tweaks, [key]: value }
      saveTweaks(tweaks)
      return { tweaks }
    })
  },
}))

// ── Selectors ──────────────────────────────────────────────────────────
export const selectOpenId = (s: StoreState): DiagramId | null =>
  s.openStack[s.openStack.length - 1] ?? null

export const selectOpenDiagram = (s: StoreState): Diagram | null => {
  const id = selectOpenId(s)
  return id ? (s.diagrams[id] ?? null) : null
}
