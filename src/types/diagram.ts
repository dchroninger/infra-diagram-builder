export type NodeType =
  | 'container'
  | 'database'
  | 'messageBus'
  | 'microservice'
  | 'externalService'
  | 'userClient'
  | 'cache';

export interface NodeData extends Record<string, unknown> {
  label: string;
  color: string;
  width: number;
  height: number;
}

export interface EdgeData extends Record<string, unknown> {
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  thickness: number;
  arrows: 'none' | 'start' | 'end' | 'both';
}

export interface Diagram {
  id: string;
  name: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: 'orthogonal';
  data: EdgeData;
}
