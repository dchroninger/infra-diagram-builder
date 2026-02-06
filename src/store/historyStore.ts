import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { NodeData, EdgeData } from '../types/diagram';
import { useDiagramStore } from './diagramStore';

interface HistoryState {
  past: { nodes: Node<NodeData>[]; edges: Edge<EdgeData>[] }[];
  future: { nodes: Node<NodeData>[]; edges: Edge<EdgeData>[] }[];

  pushState: (nodes: Node<NodeData>[], edges: Edge<EdgeData>[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushState: (nodes, edges) => {
    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY + 1), { nodes, edges }],
      future: [],
    }));
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const { nodes, edges } = useDiagramStore.getState();
    const previous = past[past.length - 1];

    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future],
    });

    useDiagramStore.getState().setNodes(previous.nodes);
    useDiagramStore.getState().setEdges(previous.edges);
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const { nodes, edges } = useDiagramStore.getState();
    const next = future[0];

    set({
      past: [...past, { nodes, edges }],
      future: future.slice(1),
    });

    useDiagramStore.getState().setNodes(next.nodes);
    useDiagramStore.getState().setEdges(next.edges);
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] }),
}));
