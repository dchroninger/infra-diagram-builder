import type { NodeType } from '../../types/diagram';
import {
  Database,
  ArrowLeftRight,
  Cog,
  Cloud,
  User,
  Zap,
  Box,
} from 'lucide-react';

interface ToolboxItemProps {
  type: NodeType;
  label: string;
}

const icons: Record<NodeType, React.ReactNode> = {
  container: <Box className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  messageBus: <ArrowLeftRight className="w-5 h-5" />,
  microservice: <Cog className="w-5 h-5" />,
  externalService: <Cloud className="w-5 h-5" />,
  userClient: <User className="w-5 h-5" />,
  cache: <Zap className="w-5 h-5" />,
};

const colors: Record<NodeType, string> = {
  container: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-600',
  database: 'bg-pink-100 border-pink-300 dark:bg-pink-900/50 dark:border-pink-600',
  messageBus: 'bg-amber-100 border-amber-300 dark:bg-amber-900/50 dark:border-amber-600',
  microservice: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-600',
  externalService: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-600',
  userClient: 'bg-purple-100 border-purple-300 dark:bg-purple-900/50 dark:border-purple-600',
  cache: 'bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-600',
};

export function ToolboxItem({ type, label }: ToolboxItemProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${colors[type]}`}
    >
      <span className="text-gray-600 dark:text-gray-300">{icons[type]}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </div>
  );
}
