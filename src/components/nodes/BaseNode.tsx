import { NodeResizer } from '@xyflow/react';
import type { NodeData } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface BaseNodeProps {
  id: string;
  data: NodeData;
  selected?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BaseNode({
  id,
  data,
  selected,
  children,
  className = '',
  style = {},
}: BaseNodeProps) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);

  return (
    <>
      <NodeResizer
        minWidth={60}
        minHeight={40}
        isVisible={selected}
        lineClassName="border-blue-500"
        handleClassName="w-2 h-2 bg-white border-2 border-blue-500 rounded-sm"
        onResize={(_, params) => {
          updateNodeData(id, { width: params.width, height: params.height });
        }}
      />
      <div
        className={`flex items-center justify-center text-center text-sm font-medium text-gray-700 ${className}`}
        style={{
          width: data.width,
          height: data.height,
          backgroundColor: data.color,
          ...style,
        }}
      >
        {children ?? data.label}
      </div>
    </>
  );
}
