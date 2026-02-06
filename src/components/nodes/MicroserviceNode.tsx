import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Cog } from 'lucide-react';
import type { NodeData } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

export function MicroserviceNode({ id, data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);

  return (
    <>
      <NodeResizer
        minWidth={80}
        minHeight={60}
        isVisible={selected}
        lineClassName="border-blue-500"
        handleClassName="w-2 h-2 bg-white border-2 border-blue-500 rounded-sm"
        onResize={(_, params) => {
          updateNodeData(id, { width: params.width, height: params.height });
        }}
      />
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3" isConnectableEnd />
      <div
        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 rounded-lg border-2 border-emerald-400"
        style={{
          width: nodeData.width,
          height: nodeData.height,
          backgroundColor: nodeData.color,
        }}
      >
        <Cog className="w-6 h-6 text-emerald-600" />
        <span>{nodeData.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3" isConnectableEnd />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3" isConnectableEnd />
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3" isConnectableEnd />
    </>
  );
}
