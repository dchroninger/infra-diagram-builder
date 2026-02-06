import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ToolboxItem } from './ToolboxItem';
import type { NodeType } from '../../types/diagram';

const nodeItems: { type: NodeType; label: string }[] = [
  { type: 'container', label: 'Container' },
  { type: 'microservice', label: 'Microservice' },
  { type: 'database', label: 'Database' },
  { type: 'cache', label: 'Cache' },
  { type: 'messageBus', label: 'Message Bus' },
  { type: 'externalService', label: 'External Service' },
  { type: 'userClient', label: 'User/Client' },
];

export function Toolbox() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 z-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {!collapsed && (
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-4">
            Components
          </h2>
          <div className="flex flex-col gap-2">
            {nodeItems.map((item) => (
              <ToolboxItem key={item.type} type={item.type} label={item.label} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
