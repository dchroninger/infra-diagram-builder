import { useCallback, useEffect, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useDiagramStore } from '../store/diagramStore';
import type { Diagram, NodeData, EdgeData } from '../types/diagram';

const STORAGE_KEY = 'infra-builder-diagrams';

export function useLocalStorage() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const { setNodes, setEdges } = useDiagramStore();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDiagrams(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored diagrams');
      }
    }
  }, []);

  const saveDiagram = useCallback(
    (name: string, nodes: Node<NodeData>[], edges: Edge<EdgeData>[]) => {
      const now = new Date().toISOString();
      const diagram: Diagram = {
        id: currentDiagramId ?? `diagram-${Date.now()}`,
        name,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as Diagram['nodes'][0]['type'],
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'orthogonal',
          data: e.data!,
        })),
        viewport: { x: 0, y: 0, zoom: 1 },
        createdAt: currentDiagramId
          ? diagrams.find((d) => d.id === currentDiagramId)?.createdAt ?? now
          : now,
        updatedAt: now,
      };

      const newDiagrams = currentDiagramId
        ? diagrams.map((d) => (d.id === currentDiagramId ? diagram : d))
        : [...diagrams, diagram];

      setDiagrams(newDiagrams);
      setCurrentDiagramId(diagram.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDiagrams));
    },
    [currentDiagramId, diagrams]
  );

  const loadDiagram = useCallback(
    (id: string) => {
      const diagram = diagrams.find((d) => d.id === id);
      if (!diagram) return;

      setNodes(diagram.nodes as unknown as Node<NodeData>[]);
      setEdges(diagram.edges as unknown as Edge<EdgeData>[]);
      setCurrentDiagramId(id);
    },
    [diagrams, setNodes, setEdges]
  );

  const deleteDiagram = useCallback(
    (id: string) => {
      const newDiagrams = diagrams.filter((d) => d.id !== id);
      setDiagrams(newDiagrams);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDiagrams));
      if (currentDiagramId === id) {
        setCurrentDiagramId(null);
        setNodes([]);
        setEdges([]);
      }
    },
    [diagrams, currentDiagramId, setNodes, setEdges]
  );

  return {
    diagrams,
    currentDiagramId,
    setCurrentDiagramId,
    saveDiagram,
    loadDiagram,
    deleteDiagram,
  };
}
