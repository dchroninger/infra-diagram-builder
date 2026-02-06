import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import type { NodeData, EdgeData, NodeType } from '../types/diagram';

const GRID_SIZE = 20;

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

interface DiagramState {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<EdgeData>>[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  updateEdgeData: (edgeId: string, data: Partial<EdgeData>) => void;

  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;

  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge<EdgeData>[]) => void;
}

interface NodeDefaults {
  color: string;
  width: number;
  height: number;
}

const defaultNodeData: Record<NodeType, NodeDefaults> = {
  container: { color: '#e0e7ff', width: 300, height: 200 },
  database: { color: '#fce7f3', width: 100, height: 120 },
  messageBus: { color: '#fef3c7', width: 180, height: 60 },
  microservice: { color: '#d1fae5', width: 120, height: 100 },
  externalService: { color: '#e0e7ff', width: 120, height: 100 },
  userClient: { color: '#f3e8ff', width: 100, height: 100 },
  cache: { color: '#ffedd5', width: 100, height: 80 },
};

const nodeLabels: Record<NodeType, string> = {
  container: 'Container',
  database: 'Database',
  messageBus: 'Message Bus',
  microservice: 'Service',
  externalService: 'External API',
  userClient: 'User',
  cache: 'Cache',
};

let nodeIdCounter = 1;

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const newEdge: Edge<EdgeData> = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'orthogonal',
      data: {
        style: 'solid',
        color: '#64748b',
        thickness: 2,
        arrows: 'end',
      },
    } as Edge<EdgeData>;
    set({ edges: addEdge(newEdge, get().edges) as Edge<EdgeData>[] });
  },

  addNode: (type, position) => {
    const id = `node-${nodeIdCounter++}`;
    const defaults = defaultNodeData[type];
    const newNode: Node<NodeData> = {
      id,
      type,
      position: {
        x: snapToGrid(position.x),
        y: snapToGrid(position.y),
      },
      zIndex: type === 'container' ? 0 : 10,
      data: {
        label: nodeLabels[type],
        color: defaults.color,
        width: defaults.width,
        height: defaults.height,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  updateEdgeData: (edgeId, data) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data!, ...data } as EdgeData } : edge
      ),
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
