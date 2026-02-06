import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbox } from './components/Toolbox/Toolbox';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { Toolbar } from './components/panels/Toolbar';
import { useHistory } from './hooks/useHistory';
import { useThemeStore } from './store/themeStore';

function AppContent() {
  useHistory();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Toolbox />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
