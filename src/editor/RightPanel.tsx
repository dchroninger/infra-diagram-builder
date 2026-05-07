import { useMemo } from 'react'
import { CAT_COLOR_VAR, NODE_CATEGORIES, NODE_TYPES } from '../nodes'
import { NodeGlyph } from '../NodeGlyph'
import { useMascotAnchor } from '../mascot/store'
import type { DiagramEdge, DiagramNode, EdgeId, EdgeKind, KVPair, NodeId, Selection } from '../types'

type Tab = 'properties' | 'layers'

interface Props {
  tab: Tab
  setTab: (t: Tab) => void
  selectedNode: DiagramNode | null
  selectedEdge: DiagramEdge | null
  updateNode: (patch: Partial<DiagramNode>) => void
  updateEdge: (patch: Partial<DiagramEdge>) => void
  nodes: Record<NodeId, DiagramNode>
  edges: Record<EdgeId, DiagramEdge>
  selection: Selection
  setSelection: (s: Selection) => void
  animatedEdges: boolean
  setAnimatedEdges: (v: boolean) => void
  onDrillInto: (nodeId: NodeId) => void
}

export function RightPanel({
  tab,
  setTab,
  selectedNode,
  selectedEdge,
  updateNode,
  updateEdge,
  nodes,
  edges,
  selection,
  setSelection,
  animatedEdges,
  setAnimatedEdges,
  onDrillInto,
}: Props) {
  const mascotAnchor = useMascotAnchor('props-footer')
  return (
    <aside className="kn-rpanel">
      <div className="kn-rpanel-tabs">
        <button className={tab === 'properties' ? 'is-on' : ''} onClick={() => setTab('properties')}>
          Properties
        </button>
        <button className={tab === 'layers' ? 'is-on' : ''} onClick={() => setTab('layers')}>
          Layers
        </button>
      </div>
      <div className="kn-rpanel-body">
        {tab === 'properties' && (
          <PropertiesView
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            updateNode={updateNode}
            updateEdge={updateEdge}
            animatedEdges={animatedEdges}
            setAnimatedEdges={setAnimatedEdges}
            onDrillInto={onDrillInto}
          />
        )}
        {tab === 'layers' && (
          <LayersView nodes={nodes} edges={edges} selection={selection} setSelection={setSelection} />
        )}
      </div>
      <div ref={mascotAnchor} className="kn-rpanel-mascot" />
    </aside>
  )
}

interface FieldProps {
  label: string
  inline?: boolean
  children: React.ReactNode
}

function Field({ label, inline, children }: FieldProps) {
  return (
    <label className={`kn-field ${inline ? 'kn-field-inline' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

interface PropsViewProps {
  selectedNode: DiagramNode | null
  selectedEdge: DiagramEdge | null
  updateNode: (patch: Partial<DiagramNode>) => void
  updateEdge: (patch: Partial<DiagramEdge>) => void
  animatedEdges: boolean
  setAnimatedEdges: (v: boolean) => void
  onDrillInto: (nodeId: NodeId) => void
}

function PropertiesView({
  selectedNode,
  selectedEdge,
  updateNode,
  updateEdge,
  animatedEdges,
  setAnimatedEdges,
  onDrillInto,
}: PropsViewProps) {
  if (selectedNode) {
    const def = NODE_TYPES[selectedNode.type]
    return (
      <div className="kn-props">
        <div className="kn-props-hd">
          <div className="kn-props-icon" style={{ color: `var(${CAT_COLOR_VAR[def.cat]})` }}>
            <NodeGlyph type={def.icon} size={24} />
          </div>
          <div>
            <div className="kn-props-type">{def.label}</div>
            <div className="kn-props-id">id: {selectedNode.id}</div>
          </div>
        </div>
        <Field label="Label">
          <input value={selectedNode.label || ''} onChange={(e) => updateNode({ label: e.target.value })} />
        </Field>
        <Field label="Subtitle">
          <input value={selectedNode.sub || ''} onChange={(e) => updateNode({ sub: e.target.value })} />
        </Field>
        <div className="kn-row-h" style={{ marginTop: 6 }}>
          <span>{selectedNode.subdiagramId ? 'open subdiagram' : 'create subdiagram'}</span>
          <button className="kn-pill" onClick={() => onDrillInto(selectedNode.id)}>
            ↳ open
          </button>
        </div>
        <div className="kn-props-row">
          <Field label="X" inline>
            <input
              type="number"
              value={Math.round(selectedNode.x)}
              onChange={(e) => updateNode({ x: Number(e.target.value) })}
            />
          </Field>
          <Field label="Y" inline>
            <input
              type="number"
              value={Math.round(selectedNode.y)}
              onChange={(e) => updateNode({ y: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="kn-props-row">
          <Field label="W" inline>
            <input
              type="number"
              value={Math.round(selectedNode.w)}
              onChange={(e) => updateNode({ w: Number(e.target.value) })}
            />
          </Field>
          <Field label="H" inline>
            <input
              type="number"
              value={Math.round(selectedNode.h)}
              onChange={(e) => updateNode({ h: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="kn-row-h">
          <span>locked</span>
          <button
            className="kn-toggle"
            data-on={selectedNode.locked ? '1' : '0'}
            onClick={() => updateNode({ locked: !selectedNode.locked })}
          >
            <i />
          </button>
        </div>
        <div className="kn-props-sect">Notes</div>
        <textarea
          className="kn-props-notes"
          placeholder="describe this node…"
          value={selectedNode.notes || ''}
          onChange={(e) => updateNode({ notes: e.target.value })}
        />
        <div className="kn-props-sect">Metadata</div>
        <KVList items={selectedNode.meta || []} onChange={(meta) => updateNode({ meta })} />
      </div>
    )
  }
  if (selectedEdge) {
    return (
      <div className="kn-props">
        <div className="kn-props-hd">
          <div className="kn-props-icon">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 17 C 8 17 14 5 19 5" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="kn-props-type">Connection</div>
            <div className="kn-props-id">id: {selectedEdge.id}</div>
          </div>
        </div>
        <Field label="Label">
          <input
            value={selectedEdge.label || ''}
            onChange={(e) => updateEdge({ label: e.target.value })}
            placeholder="e.g. http, grpc, queue"
          />
        </Field>
        <Field label="Kind">
          <div className="kn-seg">
            {(['flow', 'bidir', 'ref'] as EdgeKind[]).map((k) => (
              <button
                key={k}
                className={`kn-seg-btn ${(selectedEdge.kind ?? 'flow') === k ? 'is-on' : ''}`}
                onClick={() => updateEdge({ kind: k })}
              >
                {k}
              </button>
            ))}
          </div>
        </Field>
        <div className="kn-row-h" style={{ marginTop: 12 }}>
          <span>animated data flow</span>
          <button className="kn-toggle" data-on={animatedEdges ? '1' : '0'} onClick={() => setAnimatedEdges(!animatedEdges)}>
            <i />
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="kn-props-empty">
      <h4>nothing selected</h4>
      <p>select a node or connection to edit its properties</p>
      <div className="kn-props-sect">Canvas</div>
      <div className="kn-row-h">
        <span>animated data flow</span>
        <button className="kn-toggle" data-on={animatedEdges ? '1' : '0'} onClick={() => setAnimatedEdges(!animatedEdges)}>
          <i />
        </button>
      </div>
      <div className="kn-props-sect">Shortcuts</div>
      <div className="kn-shortcuts">
        <div>
          <span className="kn-sc-keys">
            <kbd>drag</kbd>
          </span>
          <span className="kn-sc-desc">port → port to connect</span>
        </div>
        <div>
          <span className="kn-sc-keys">
            <kbd>⌘</kbd>
            <span className="kn-sc-plus">+</span>
            <kbd>D</kbd>
          </span>
          <span className="kn-sc-desc">duplicate</span>
        </div>
        <div>
          <span className="kn-sc-keys">
            <kbd>⌘</kbd>
            <span className="kn-sc-plus">+</span>
            <kbd>A</kbd>
          </span>
          <span className="kn-sc-desc">select all</span>
        </div>
        <div>
          <span className="kn-sc-keys">
            <kbd>F</kbd>
          </span>
          <span className="kn-sc-desc">fit to view</span>
        </div>
        <div>
          <span className="kn-sc-keys">
            <kbd>⌫</kbd>
          </span>
          <span className="kn-sc-desc">delete</span>
        </div>
        <div>
          <span className="kn-sc-keys">
            <kbd>esc</kbd>
          </span>
          <span className="kn-sc-desc">deselect</span>
        </div>
      </div>
    </div>
  )
}

function KVList({ items, onChange }: { items: KVPair[]; onChange: (next: KVPair[]) => void }) {
  return (
    <div className="kn-kv">
      {items.map((it, i) => (
        <div key={i} className="kn-kv-row">
          <input
            value={it.k}
            placeholder="key"
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...it, k: e.target.value }
              onChange(next)
            }}
          />
          <input
            value={it.v}
            placeholder="value"
            onChange={(e) => {
              const next = [...items]
              next[i] = { ...it, v: e.target.value }
              onChange(next)
            }}
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} title="Remove">
            ×
          </button>
        </div>
      ))}
      <button className="kn-kv-add" onClick={() => onChange([...items, { k: '', v: '' }])}>
        + add metadata
      </button>
    </div>
  )
}

interface LayersProps {
  nodes: Record<NodeId, DiagramNode>
  edges: Record<EdgeId, DiagramEdge>
  selection: Selection
  setSelection: (s: Selection) => void
}

function LayersView({ nodes, edges, selection, setSelection }: LayersProps) {
  const groups = useMemo(() => {
    const g: Record<string, DiagramNode[]> = {}
    for (const n of Object.values(nodes)) {
      const cat = NODE_TYPES[n.type]?.cat ?? 'other'
      ;(g[cat] ||= []).push(n)
    }
    return g
  }, [nodes])
  const edgeArr = Object.values(edges)
  return (
    <div className="kn-layers">
      {NODE_CATEGORIES.map((cat) => {
        const items = groups[cat.id]
        if (!items?.length) return null
        return (
          <div key={cat.id} className="kn-layer-group">
            <div className="kn-layer-h">
              <span className="kn-pal-dot" style={{ background: `var(${CAT_COLOR_VAR[cat.id]})` }} />
              {cat.label}
              <span className="kn-pal-count">{items.length}</span>
            </div>
            {items.map((n) => (
              <div
                key={n.id}
                className={`kn-layer-row ${selection.nodes.has(n.id) ? 'is-on' : ''}`}
                onClick={(e) =>
                  setSelection({
                    nodes: e.shiftKey ? new Set([...selection.nodes, n.id]) : new Set([n.id]),
                    edges: new Set(),
                  })
                }
              >
                <span className="kn-layer-icon" style={{ color: `var(${CAT_COLOR_VAR[cat.id]})` }}>
                  <NodeGlyph type={NODE_TYPES[n.type].icon} size={14} />
                </span>
                <span className="kn-layer-name">{n.label}</span>
                <span className="kn-layer-id">{n.id.slice(0, 4)}</span>
              </div>
            ))}
          </div>
        )
      })}
      {edgeArr.length > 0 && (
        <div className="kn-layer-group">
          <div className="kn-layer-h">
            <span className="kn-pal-dot" style={{ background: 'var(--text-subtle)' }} />
            Connections
            <span className="kn-pal-count">{edgeArr.length}</span>
          </div>
          {edgeArr.map((e) => (
            <div
              key={e.id}
              className={`kn-layer-row ${selection.edges.has(e.id) ? 'is-on' : ''}`}
              onClick={() => setSelection({ nodes: new Set(), edges: new Set([e.id]) })}
            >
              <span className="kn-layer-icon">→</span>
              <span className="kn-layer-name">
                {nodes[e.from]?.label} → {nodes[e.to]?.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
