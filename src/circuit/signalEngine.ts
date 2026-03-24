import { Node, Edge } from 'reactflow';
import { CircuitNodeData, LogicValue } from './types';

export function propagateSignals(
  nodes: Node<CircuitNodeData>[],
  edges: Edge[]
): Node<CircuitNodeData>[] {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, data: { ...n.data } }]));
  
  const incomingEdges = new Map<string, { sourceId: string; targetHandle: string }[]>();
  for (const edge of edges) {
    const list = incomingEdges.get(edge.target) || [];
    list.push({ sourceId: edge.source, targetHandle: edge.targetHandle || '' });
    incomingEdges.set(edge.target, list);
  }

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    for (const node of nodeMap.values()) {
      const incoming = incomingEdges.get(node.id) || [];

      if (node.data.type === 'led') {
        const inputVal = getInputValue(incoming, nodeMap);
        if (node.data.value !== inputVal) {
          node.data = { ...node.data, value: inputVal };
          changed = true;
        }
      } else if (node.data.type === 'not') {
        const inputVal = getInputValue(incoming, nodeMap);
        const output: LogicValue = inputVal === 1 ? 0 : 1;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: [inputVal], output };
          changed = true;
        }
      } else if (node.data.type === 'and') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const output: LogicValue = inputVals.length > 0 && inputVals.every(v => v === 1) ? 1 : 0;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      } else if (node.data.type === 'or') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const output: LogicValue = inputVals.some(v => v === 1) ? 1 : 0;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      } else if (node.data.type === 'nand') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const output: LogicValue = inputVals.length > 0 && inputVals.every(v => v === 1) ? 0 : 1;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      } else if (node.data.type === 'nor') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const output: LogicValue = inputVals.some(v => v === 1) ? 0 : 1;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      } else if (node.data.type === 'xor') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const ones = inputVals.filter(v => v === 1).length;
        const output: LogicValue = ones % 2 === 1 ? 1 : 0;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      } else if (node.data.type === 'xnor') {
        const inputVals = getMultiInputValues(incoming, nodeMap);
        const ones = inputVals.filter(v => v === 1).length;
        const output: LogicValue = ones % 2 === 0 ? 1 : 0;
        if (node.data.output !== output) {
          node.data = { ...node.data, inputs: inputVals, output };
          changed = true;
        }
      }
    }
  }

  return Array.from(nodeMap.values());
}

function getOutputValue(node: Node<CircuitNodeData>): LogicValue {
  switch (node.data.type) {
    case 'toggleSwitch':
    case 'pushButton':
      return node.data.value;
    case 'voltageSource':
      return 1;
    case 'not':
    case 'and':
    case 'or':
    case 'nand':
    case 'nor':
    case 'xor':
    case 'xnor':
      return node.data.output;
    case 'led':
      return node.data.value;
    default:
      return 0;
  }
}

function getInputValue(
  incoming: { sourceId: string; targetHandle: string }[],
  nodeMap: Map<string, Node<CircuitNodeData>>
): LogicValue {
  if (incoming.length === 0) return 0;
  const sourceNode = nodeMap.get(incoming[0].sourceId);
  return sourceNode ? getOutputValue(sourceNode) : 0;
}

function getMultiInputValues(
  incoming: { sourceId: string; targetHandle: string }[],
  nodeMap: Map<string, Node<CircuitNodeData>>
): LogicValue[] {
  return incoming.map(inc => {
    const sourceNode = nodeMap.get(inc.sourceId);
    return sourceNode ? getOutputValue(sourceNode) : 0;
  });
}

export function getEdgeSignalState(
  edge: Edge,
  nodes: Node<CircuitNodeData>[]
): boolean {
  const sourceNode = nodes.find(n => n.id === edge.source);
  if (!sourceNode) return false;
  return getOutputValue(sourceNode) === 1;
}
