import type { Node, Edge } from 'reactflow';
import type { CircuitNodeData, LogicValue } from '@/circuit/types';
import { propagateSignals } from '@/circuit/signalEngine';
import type { TestCase } from './levels';

export interface VerifyResult {
  passed: number;
  total: number;
  score: number;
  stars: number;
  success: boolean;
}

export function verifyCircuit(
  nodes: Node<CircuitNodeData>[],
  edges: Edge[],
  testCases: TestCase[]
): VerifyResult {
  const switches = nodes
    .filter(n => n.data.type === 'toggleSwitch')
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

  const leds = nodes
    .filter(n => n.data.type === 'led')
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

  // Special case: no test cases means "all LEDs must be ON" (VCC level)
  if (testCases.length === 0) {
    if (leds.length === 0) return { passed: 0, total: 1, score: 0, stars: 0, success: false };
    const propagated = propagateSignals(nodes, edges);
    const allOn = propagated
      .filter(n => n.data.type === 'led')
      .every(n => (n.data as any).value === 1);
    return allOn
      ? { passed: 1, total: 1, score: 100, stars: 3, success: true }
      : { passed: 0, total: 1, score: 0, stars: 0, success: false };
  }

  let passed = 0;

  for (const testCase of testCases) {
    const testNodes = nodes.map(n => {
      if (n.data.type === 'toggleSwitch') {
        const idx = switches.findIndex(s => s.id === n.id);
        if (idx >= 0 && idx < testCase.inputs.length) {
          return { ...n, data: { ...n.data, value: testCase.inputs[idx] as LogicValue } };
        }
      }
      return { ...n, data: { ...n.data } };
    }) as Node<CircuitNodeData>[];

    const propagated = propagateSignals(testNodes, edges);

    const outputLeds = propagated
      .filter(n => n.data.type === 'led')
      .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

    const correct = testCase.expectedOutputs.every((expected, i) =>
      outputLeds[i] && (outputLeds[i].data as any).value === expected
    );

    if (correct) passed++;
  }

  const total = testCases.length;
  const percentage = Math.round((passed / total) * 100);
  const stars = percentage === 100 ? 3 : percentage >= 90 ? 2 : percentage >= 70 ? 1 : 0;

  return { passed, total, score: percentage, stars, success: percentage >= 90 };
}
