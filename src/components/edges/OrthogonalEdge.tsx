import { getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import type { EdgeData } from '../../types/diagram';

export function OrthogonalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as EdgeData | undefined;
  const style = edgeData?.style ?? 'solid';
  const thickness = edgeData?.thickness ?? 2;
  const arrows = edgeData?.arrows ?? 'end';
  const label = edgeData?.label;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
  });

  const strokeDasharray =
    style === 'dashed' ? '8 4' : style === 'dotted' ? '2 4' : undefined;

  const markerId = `marker-${id}`;
  const markerStartId = `marker-start-${id}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          className="edge-marker"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <marker
          id={markerStartId}
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          className="edge-marker"
        >
          <path d="M 10 0 L 0 5 L 10 10 z" />
        </marker>
      </defs>
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={thickness}
        strokeDasharray={strokeDasharray}
        markerEnd={arrows === 'end' || arrows === 'both' ? `url(#${markerId})` : undefined}
        markerStart={arrows === 'start' || arrows === 'both' ? `url(#${markerStartId})` : undefined}
        className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-600 shadow-sm"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
