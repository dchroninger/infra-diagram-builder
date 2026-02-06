import { useDiagramStore } from '../../store/diagramStore';
import type { EdgeData } from '../../types/diagram';

export function PropertiesPanel() {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    updateNodeData,
    updateEdgeData,
  } = useDiagramStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Select an element to edit properties</p>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-4">
          Node Properties
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { label: e.target.value })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedNode.data.color}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { color: e.target.value })
                }
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedNode.data.color}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { color: e.target.value })
                }
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Width
              </label>
              <input
                type="number"
                value={selectedNode.data.width}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { width: Number(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Height
              </label>
              <input
                type="number"
                value={selectedNode.data.height}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { height: Number(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    const edgeData = selectedEdge.data as EdgeData;
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-4">
          Edge Properties
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Label
            </label>
            <input
              type="text"
              value={edgeData.label ?? ''}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, { label: e.target.value || undefined })
              }
              placeholder="Optional label"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Line Style
            </label>
            <select
              value={edgeData.style}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, {
                  style: e.target.value as EdgeData['style'],
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={edgeData.color}
                onChange={(e) =>
                  updateEdgeData(selectedEdge.id, { color: e.target.value })
                }
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={edgeData.color}
                onChange={(e) =>
                  updateEdgeData(selectedEdge.id, { color: e.target.value })
                }
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Thickness
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={edgeData.thickness}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, { thickness: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{edgeData.thickness}px</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Arrows
            </label>
            <select
              value={edgeData.arrows}
              onChange={(e) =>
                updateEdgeData(selectedEdge.id, {
                  arrows: e.target.value as EdgeData['arrows'],
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None</option>
              <option value="start">Start</option>
              <option value="end">End</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
