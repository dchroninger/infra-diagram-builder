import { useEffect, useRef } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { useHistoryStore } from '../store/historyStore';

export function useHistory() {
  const { nodes, edges } = useDiagramStore();
  const { pushState } = useHistoryStore();
  const isInitialized = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      pushState(nodes, edges);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, pushState]);
}
