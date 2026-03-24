import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';

interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo(
  getState: () => Snapshot,
  setState: (snapshot: Snapshot) => void
) {
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);

  const takeSnapshot = useCallback(() => {
    past.current.push(structuredClone(getState()));
    future.current = [];
  }, [getState]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(structuredClone(getState()));
    setState(prev);
  }, [getState, setState]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(structuredClone(getState()));
    setState(next);
  }, [getState, setState]);

  const canUndo = () => past.current.length > 0;
  const canRedo = () => future.current.length > 0;

  return { takeSnapshot, undo, redo, canUndo, canRedo };
}
