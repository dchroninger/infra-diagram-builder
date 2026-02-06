import { Save, Upload, Download, Undo2, Redo2, Image, Sun, Moon } from 'lucide-react';
import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useDiagramStore } from '../../store/diagramStore';
import { useHistoryStore } from '../../store/historyStore';
import { useThemeStore } from '../../store/themeStore';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Diagram } from '../../types/diagram';

export function Toolbar() {
  const { nodes, edges, setNodes, setEdges } = useDiagramStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const { diagrams, currentDiagramId, saveDiagram, loadDiagram, setCurrentDiagramId } =
    useLocalStorage();
  const { getNodes } = useReactFlow();
  const { theme, toggleTheme } = useThemeStore();

  const handleSave = () => {
    const name = currentDiagramId
      ? diagrams.find((d) => d.id === currentDiagramId)?.name ?? 'Untitled'
      : prompt('Enter diagram name:', 'Untitled') ?? 'Untitled';
    saveDiagram(name, nodes, edges);
  };

  const handleExport = () => {
    const diagram: Omit<Diagram, 'createdAt' | 'updatedAt'> = {
      id: currentDiagramId ?? `diagram-${Date.now()}`,
      name: 'Exported Diagram',
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
        type: 'orthogonal' as const,
        data: e.data!,
      })),
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const blob = new Blob([JSON.stringify(diagram, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const diagram = JSON.parse(event.target?.result as string) as Diagram;
          if (!diagram.nodes || !diagram.edges) {
            alert('Invalid diagram format');
            return;
          }
          setNodes(diagram.nodes as typeof nodes);
          setEdges(diagram.edges as typeof edges);
        } catch {
          alert('Failed to parse diagram file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDiagramChange = (id: string) => {
    if (id === 'new') {
      setNodes([]);
      setEdges([]);
      setCurrentDiagramId(null);
    } else {
      loadDiagram(id);
    }
  };

  const handleExportPng = async () => {
    const exportTheme = window.confirm('Export in dark mode?\n\nOK = Dark mode\nCancel = Light mode')
      ? 'dark'
      : 'light';

    const bgColor = exportTheme === 'dark' ? '#1f2937' : '#f9fafb';

    const nodesBounds = getNodesBounds(getNodes());
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    const padding = 40;
    const width = nodesBounds.width + padding * 2;
    const height = nodesBounds.height + padding * 2;

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: bgColor,
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`,
        },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagram.png';
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <select
        value={currentDiagramId ?? 'new'}
        onChange={(e) => handleDiagramChange(e.target.value)}
        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="new">New Diagram</option>
        {diagrams.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <button
        onClick={handleSave}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Save"
      >
        <Save className="w-4 h-4" />
        Save
      </button>

      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Export JSON"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={handleImport}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Import JSON"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>

      <button
        onClick={handleExportPng}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Export PNG"
      >
        <Image className="w-4 h-4" />
        PNG
      </button>

      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <button
        onClick={undo}
        disabled={!canUndo()}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={redo}
        disabled={!canRedo()}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
    </div>
  );
}
