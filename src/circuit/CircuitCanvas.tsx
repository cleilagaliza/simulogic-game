import { useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  EdgeProps,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ToggleSwitchNode from './nodes/ToggleSwitchNode';
import PushButtonNode from './nodes/PushButtonNode';
import LedNode from './nodes/LedNode';
import GateNode from './nodes/GateNode';
import { propagateSignals, getEdgeSignalState } from './signalEngine';
import { CircuitNodeData, LedColor, LogicValue } from './types';
import type { Node } from 'reactflow';

const nodeTypes = {
  toggleSwitch: ToggleSwitchNode,
  pushButton: PushButtonNode,
  led: LedNode,
  not: GateNode,
  and: GateNode,
  or: GateNode,
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
    case 'led': return { type: 'led', color: 'red' as LedColor, value: 0 };
    case 'not': return { type: 'not', inputs: [0], output: 1 };
    case 'and': return { type: 'and', inputs: [0, 0], output: 0 };
    case 'or': return { type: 'or', inputs: [0, 0], output: 0 };
    default: return { type: 'toggleSwitch', value: 0 };
  }
}

let nodeId = 0;
const getId = () => `node_${++nodeId}`;

function CircuitCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CircuitNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // Signal propagation on any change
  const runPropagation = useCallback(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const updated = propagateSignals(currentNodes as Node<CircuitNodeData>[], currentEdges);
        // Update edge data for visual feedback
        const newEdges = currentEdges.map(edge => ({
          ...edge,
          data: { active: getEdgeSignalState(edge, updated) },
        }));

        // Only set if changed
        const edgesChanged = newEdges.some((e, i) => e.data?.active !== currentEdges[i]?.data?.active);
        if (edgesChanged) {
          setTimeout(() => setEdges(newEdges), 0);
        }
        return currentEdges;
      });
      const propagated = propagateSignals(currentNodes as Node<CircuitNodeData>[], edges);
      return propagated;
    });
  }, [setNodes, setEdges, edges]);

  // Listen for toggle events from nodes
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
      setEdges(eds => addEdge({ ...params, type: 'signal', data: { active: false } }, eds));
      setTimeout(runPropagation, 20);
    },
    [setEdges, runPropagation]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !rfInstance.current || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node<CircuitNodeData> = {
        id: getId(),
        type,
        position,
        data: createNodeData(type),
      };

      setNodes(nds => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Re-propagate when edges change
  useEffect(() => {
    runPropagation();
  }, [edges.length]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
}

export default function CircuitCanvas() {
  return (
    <ReactFlowProvider>
      <CircuitCanvasInner />
    </ReactFlowProvider>
  );
}
