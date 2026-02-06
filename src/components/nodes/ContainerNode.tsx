import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '../../types/diagram';

export function ContainerNode({ id, data, selected }: NodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Top} id="top" className="w-3 h-3" isConnectableEnd />
      <BaseNode
        id={id}
        data={data as NodeData}
        selected={selected}
        className="rounded-lg border-2 border-dashed border-gray-400"
      >
        <span className="absolute top-2 left-3 text-xs text-gray-500">
          {(data as NodeData).label}
        </span>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3" isConnectableEnd />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3" isConnectableEnd />
      <Handle type="source" position={Position.Left} id="left" className="w-3 h-3" isConnectableEnd />
    </>
  );
}
