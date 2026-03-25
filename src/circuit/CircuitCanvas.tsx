import { useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  EdgeProps,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Undo2, Redo2 } from 'lucide-react';

import ToggleSwitchNode from './nodes/ToggleSwitchNode';
import PushButtonNode from './nodes/PushButtonNode';
import VoltageSourceNode from './nodes/VoltageSourceNode';
import LedNode from './nodes/LedNode';
import GateNode from './nodes/GateNode';
import { propagateSignals, getEdgeSignalState } from './signalEngine';
import { CircuitNodeData, LedColor, LogicValue } from './types';
import { useUndoRedo } from './useUndoRedo';
import type { Node, Edge } from 'reactflow';

export interface CircuitCanvasRef {
  getState: () => { nodes: Node<CircuitNodeData>[]; edges: Edge[] };
  loadState: (nodes: Node<CircuitNodeData>[], edges: Edge[]) => void;
}

const nodeTypes = {
  toggleSwitch: ToggleSwitchNode,
  pushButton: PushButtonNode,
  voltageSource: VoltageSourceNode,
  led: LedNode,
  not: GateNode,
  and: GateNode,
  or: GateNode,
  nand: GateNode,
  nor: GateNode,
  xor: GateNode,
  xnor: GateNode,
};

function SignalEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data,
}: EdgeProps & { data?: { active?: boolean } }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isActive = data?.active ?? false;

  return (
    <g className={isActive ? 'edge-active' : ''}>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: isActive ? 'hsl(142, 70%, 45%)' : 'hsl(220, 15%, 65%)',
          strokeWidth: isActive ? 3 : 2,
          filter: isActive ? 'drop-shadow(0 0 4px hsl(142, 70%, 45%, 0.5))' : 'none',
        }}
        fill="none"
      />
    </g>
  );
}

const edgeTypes = { signal: SignalEdge };

function createNodeData(type: string): CircuitNodeData {
  switch (type) {
    case 'toggleSwitch': return { type: 'toggleSwitch', value: 0 };
    case 'pushButton': return { type: 'pushButton', value: 0 };
    case 'voltageSource': return { type: 'voltageSource', value: 1 };
    case 'led': return { type: 'led', color: 'red' as LedColor, value: 0 };
    case 'not': return { type: 'not', inputs: [0], output: 1 };
    case 'and': return { type: 'and', inputs: [0, 0], output: 0 };
    case 'or': return { type: 'or', inputs: [0, 0], output: 0 };
    case 'nand': return { type: 'nand', inputs: [0, 0], output: 1 };
    case 'nor': return { type: 'nor', inputs: [0, 0], output: 1 };
    case 'xor': return { type: 'xor', inputs: [0, 0], output: 0 };
    case 'xnor': return { type: 'xnor', inputs: [0, 0], output: 1 };
    default: return { type: 'toggleSwitch', value: 0 };
  }
}

let nodeId = 0;
const getId = () => `node_${++nodeId}`;

const CircuitCanvasInner = forwardRef<CircuitCanvasRef, {}>((_, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CircuitNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const [, forceUpdate] = useState(0);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(
    () => ({ nodes: nodesRef.current, edges: edgesRef.current }),
    ({ nodes: n, edges: e }) => {
      setNodes(n);
      setEdges(e);
      setTimeout(() => forceUpdate(c => c + 1), 0);
    }
  );

  // Signal propagation
  const runPropagation = useCallback(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const updated = propagateSignals(currentNodes as Node<CircuitNodeData>[], currentEdges);
        const newEdges = currentEdges.map(edge => ({
          ...edge,
          data: { active: getEdgeSignalState(edge, updated) },
        }));
        const edgesChanged = newEdges.some((e, i) => e.data?.active !== currentEdges[i]?.data?.active);
        if (edgesChanged) {
          setTimeout(() => setEdges(newEdges), 0);
        }
        return currentEdges;
      });
      const propagated = propagateSignals(currentNodes as Node<CircuitNodeData>[], edgesRef.current);
      return propagated;
    });
  }, [setNodes, setEdges]);

  useImperativeHandle(ref, () => ({
    getState: () => ({ nodes: nodesRef.current as Node<CircuitNodeData>[], edges: edgesRef.current as Edge[] }),
    loadState: (newNodes: Node<CircuitNodeData>[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
      setTimeout(() => {
        forceUpdate(c => c + 1);
        runPropagation();
      }, 50);
    },
  }));

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const { id, value } = (e as CustomEvent).detail;
      setNodes(nds =>
        nds.map(n =>
          n.id === id ? { ...n, data: { ...n.data, value: value as LogicValue } } : n
        )
      );
      setTimeout(runPropagation, 10);
    };

    const handleLedColor = (e: Event) => {
      const { id, color } = (e as CustomEvent).detail;
      setNodes(nds =>
        nds.map(n =>
          n.id === id ? { ...n, data: { ...n.data, color: color as LedColor } } : n
        )
      );
    };

    window.addEventListener('circuit-toggle', handleToggle);
    window.addEventListener('circuit-led-color', handleLedColor);
    return () => {
      window.removeEventListener('circuit-toggle', handleToggle);
      window.removeEventListener('circuit-led-color', handleLedColor);
    };
  }, [setNodes, runPropagation]);

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges(eds => addEdge({ ...params, type: 'signal', data: { active: false } }, eds));
      setTimeout(runPropagation, 20);
    },
    [setEdges, runPropagation, takeSnapshot]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !rfInstance.current || !reactFlowWrapper.current) return;

      takeSnapshot();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: createNodeData(type),
      } as Node<CircuitNodeData>;

      setNodes(nds => [...nds, newNode]);
    },
    [setNodes, takeSnapshot]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodesChange = useCallback((changes: any) => {
    const hasRemove = changes.some((c: any) => c.type === 'remove');
    if (hasRemove) takeSnapshot();
    onNodesChange(changes);
    if (hasRemove) setTimeout(runPropagation, 20);
  }, [onNodesChange, takeSnapshot, runPropagation]);

  const handleEdgesChange = useCallback((changes: any) => {
    const hasRemove = changes.some((c: any) => c.type === 'remove');
    if (hasRemove) takeSnapshot();
    onEdgesChange(changes);
    if (hasRemove) setTimeout(runPropagation, 20);
  }, [onEdgesChange, takeSnapshot, runPropagation]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  useEffect(() => {
    runPropagation();
  }, [edges.length]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <div className="absolute top-3 left-3 z-10 flex gap-1">
        <button
          onClick={() => { undo(); setTimeout(runPropagation, 20); }}
          disabled={!canUndo()}
          className="p-2 rounded-lg border transition-colors disabled:opacity-30"
          style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={() => { redo(); setTimeout(runPropagation, 20); }}
          disabled={!canRedo()}
          className="p-2 rounded-lg border transition-colors disabled:opacity-30"
          style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance) => { rfInstance.current = instance; }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'signal' }}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(215, 20%, 85%)" />
        <Controls />
        <MiniMap
          nodeStrokeColor="hsl(215, 80%, 48%)"
          nodeColor="hsl(0, 0%, 100%)"
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
});

CircuitCanvasInner.displayName = 'CircuitCanvasInner';

const CircuitCanvas = forwardRef<CircuitCanvasRef, {}>((_, ref) => (
  <ReactFlowProvider>
    <CircuitCanvasInner ref={ref} />
  </ReactFlowProvider>
));

CircuitCanvas.displayName = 'CircuitCanvas';
export default CircuitCanvas;
