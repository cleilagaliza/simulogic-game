import type { LogicValue } from '@/circuit/types';

export interface TestCase {
  inputs: LogicValue[];
  expectedOutputs: LogicValue[];
}

export interface LevelDefinition {
  id: number;
  title: string;
  description: string;
  objective: string;
  availableComponents: string[];
  testCases: TestCase[];
  maxScore: number;
}

export const levels: LevelDefinition[] = [
  {
    id: 0,
    title: 'Olá, Mundo!',
    description: 'Sua primeira conexão',
    objective: 'Conecte uma Fonte (VCC) a um LED para fazê-lo acender.',
    availableComponents: ['voltageSource', 'led'],
    testCases: [],
    maxScore: 100,
  },
  {
    id: 1,
    title: 'Interruptor',
    description: 'Controle com um switch',
    objective: 'Conecte um Toggle Switch a um LED. O LED deve acender quando o switch estiver ligado.',
    availableComponents: ['toggleSwitch', 'led'],
    testCases: [
      { inputs: [0], expectedOutputs: [0] },
      { inputs: [1], expectedOutputs: [1] },
    ],
    maxScore: 100,
  },
  {
    id: 2,
    title: 'Inversão',
    description: 'Porta NOT',
    objective: 'Use uma porta NOT para inverter o sinal. O LED deve acender quando o switch estiver desligado.',
    availableComponents: ['toggleSwitch', 'not', 'led'],
    testCases: [
      { inputs: [0], expectedOutputs: [1] },
      { inputs: [1], expectedOutputs: [0] },
    ],
    maxScore: 100,
  },
  {
    id: 3,
    title: 'Porta AND',
    description: 'Ambos ligados',
    objective: 'O LED só deve acender quando AMBOS os switches estiverem ligados.',
    availableComponents: ['toggleSwitch', 'and', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
    maxScore: 100,
  },
  {
    id: 4,
    title: 'Porta OR',
    description: 'Pelo menos um',
    objective: 'O LED deve acender quando QUALQUER switch estiver ligado.',
    availableComponents: ['toggleSwitch', 'or', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
    maxScore: 100,
  },
  {
    id: 5,
    title: 'Porta NAND',
    description: 'NOT AND',
    objective: 'O LED deve apagar SOMENTE quando ambos os switches estiverem ligados.',
    availableComponents: ['toggleSwitch', 'nand', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
    maxScore: 100,
  },
  {
    id: 6,
    title: 'Porta NOR',
    description: 'NOT OR',
    objective: 'O LED só deve acender quando NENHUM switch estiver ligado.',
    availableComponents: ['toggleSwitch', 'nor', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
    maxScore: 100,
  },
  {
    id: 7,
    title: 'Porta XOR',
    description: 'Ou exclusivo',
    objective: 'O LED deve acender quando os switches tiverem valores DIFERENTES.',
    availableComponents: ['toggleSwitch', 'xor', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
    maxScore: 100,
  },
  {
    id: 8,
    title: 'Porta XNOR',
    description: 'Igualdade',
    objective: 'O LED deve acender quando os switches tiverem valores IGUAIS.',
    availableComponents: ['toggleSwitch', 'xnor', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
    maxScore: 100,
  },
  {
    id: 9,
    title: 'Desafio Final',
    description: 'Circuito combinacional',
    objective: 'Construa: LED = (A AND B) OR C. Use 3 switches (A, B, C de cima para baixo).',
    availableComponents: ['toggleSwitch', 'and', 'or', 'led'],
    testCases: [
      { inputs: [0, 0, 0], expectedOutputs: [0] },
      { inputs: [0, 0, 1], expectedOutputs: [1] },
      { inputs: [0, 1, 0], expectedOutputs: [0] },
      { inputs: [0, 1, 1], expectedOutputs: [1] },
      { inputs: [1, 0, 0], expectedOutputs: [0] },
      { inputs: [1, 0, 1], expectedOutputs: [1] },
      { inputs: [1, 1, 0], expectedOutputs: [1] },
      { inputs: [1, 1, 1], expectedOutputs: [1] },
    ],
    maxScore: 100,
  },
];
