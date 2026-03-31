import type { LogicValue } from '@/circuit/types';

export interface TestCase {
  inputs: LogicValue[];
  expectedOutputs: LogicValue[];
}

export interface TruthTableChallenge {
  inputLabels: string[];
  outputLabels: string[];
  rows: { inputs: LogicValue[]; outputs: LogicValue[] }[];
  hiddenOutputIndices?: number[];
}

export interface WaveformChallengeData {
  gate: string;
  timeSteps: number;
  inputA: LogicValue[];
  inputB?: LogicValue[];
  expectedOutput: LogicValue[];
}

export interface BitWeightChallengeData {
  targetDecimal: number;
  numBits: number;
}

export interface FormulaQuizConfig {
  numInputs: number;
}

export type PhaseType = 'circuit' | 'fill_table' | 'waveform' | 'bit_weight' | 'formula_quiz';

export interface LevelPhase {
  type: PhaseType;
  label: string;
  /** Circuit phase: which components are available */
  availableComponents?: string[];
  testCases?: TestCase[];
  truthTable?: TruthTableChallenge;
  waveform?: WaveformChallengeData;
  bitWeight?: BitWeightChallengeData;
  formulaQuiz?: FormulaQuizConfig;
}

export interface LevelDefinition {
  id: number;
  title: string;
  description: string;
  objective: string;
  maxScore: number;
  phases: LevelPhase[];
}

export const levels: LevelDefinition[] = [
  // === Level 0: Hello World ===
  {
    id: 0,
    title: 'Olá, Mundo!',
    description: 'Sua primeira conexão',
    objective: 'Conecte uma Fonte (VCC) a um LED para fazê-lo acender.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['voltageSource', 'led'],
        testCases: [],
      },
    ],
  },
  // === Level 1: Toggle Switch ===
  {
    id: 1,
    title: 'Interruptor',
    description: 'Controle com um switch',
    objective: 'Conecte um Toggle Switch a um LED.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'led'],
        testCases: [
          { inputs: [0], expectedOutputs: [0] },
          { inputs: [1], expectedOutputs: [1] },
        ],
      },
    ],
  },
  // === Level 2: NOT ===
  {
    id: 2,
    title: 'Porta NOT',
    description: 'Inversão lógica',
    objective: 'Aprenda a porta NOT: monte o circuito, preencha a tabela e analise a forma de onda.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'not', 'led'],
        testCases: [
          { inputs: [0], expectedOutputs: [1] },
          { inputs: [1], expectedOutputs: [0] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A'],
          outputLabels: ['NOT A'],
          rows: [
            { inputs: [0], outputs: [1] },
            { inputs: [1], outputs: [0] },
          ],
          hiddenOutputIndices: [0, 1],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'NOT',
          timeSteps: 8,
          inputA: [0, 0, 1, 1, 0, 1, 0, 1],
          expectedOutput: [1, 1, 0, 0, 1, 0, 1, 0],
        },
      },
    ],
  },
  // === Level 3: AND ===
  {
    id: 3,
    title: 'Porta AND',
    description: 'Ambos ligados',
    objective: 'Aprenda a porta AND: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'and', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [0] },
          { inputs: [0, 1], expectedOutputs: [0] },
          { inputs: [1, 0], expectedOutputs: [0] },
          { inputs: [1, 1], expectedOutputs: [1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['A AND B'],
          rows: [
            { inputs: [0, 0], outputs: [0] },
            { inputs: [0, 1], outputs: [0] },
            { inputs: [1, 0], outputs: [0] },
            { inputs: [1, 1], outputs: [1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'AND',
          timeSteps: 8,
          inputA: [0, 0, 1, 1, 0, 1, 1, 0],
          inputB: [0, 1, 0, 1, 1, 1, 0, 0],
          expectedOutput: [0, 0, 0, 1, 0, 1, 0, 0],
        },
      },
    ],
  },
  // === Level 4: OR ===
  {
    id: 4,
    title: 'Porta OR',
    description: 'Pelo menos um',
    objective: 'Aprenda a porta OR: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'or', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [0] },
          { inputs: [0, 1], expectedOutputs: [1] },
          { inputs: [1, 0], expectedOutputs: [1] },
          { inputs: [1, 1], expectedOutputs: [1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['A OR B'],
          rows: [
            { inputs: [0, 0], outputs: [0] },
            { inputs: [0, 1], outputs: [1] },
            { inputs: [1, 0], outputs: [1] },
            { inputs: [1, 1], outputs: [1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'OR',
          timeSteps: 8,
          inputA: [0, 0, 1, 1, 0, 1, 1, 0],
          inputB: [0, 1, 0, 1, 1, 1, 0, 0],
          expectedOutput: [0, 1, 1, 1, 1, 1, 1, 0],
        },
      },
    ],
  },
  // === Level 5: NAND ===
  {
    id: 5,
    title: 'Porta NAND',
    description: 'NOT AND',
    objective: 'Aprenda a porta NAND: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'nand', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [1] },
          { inputs: [0, 1], expectedOutputs: [1] },
          { inputs: [1, 0], expectedOutputs: [1] },
          { inputs: [1, 1], expectedOutputs: [0] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['NAND'],
          rows: [
            { inputs: [0, 0], outputs: [1] },
            { inputs: [0, 1], outputs: [1] },
            { inputs: [1, 0], outputs: [1] },
            { inputs: [1, 1], outputs: [0] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'NAND',
          timeSteps: 8,
          inputA: [0, 0, 1, 1, 0, 1, 1, 0],
          inputB: [0, 1, 0, 1, 1, 1, 0, 0],
          expectedOutput: [1, 1, 1, 0, 1, 0, 1, 1],
        },
      },
    ],
  },
  // === Level 6: NOR ===
  {
    id: 6,
    title: 'Porta NOR',
    description: 'NOT OR',
    objective: 'Aprenda a porta NOR: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'nor', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [1] },
          { inputs: [0, 1], expectedOutputs: [0] },
          { inputs: [1, 0], expectedOutputs: [0] },
          { inputs: [1, 1], expectedOutputs: [0] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['NOR'],
          rows: [
            { inputs: [0, 0], outputs: [1] },
            { inputs: [0, 1], outputs: [0] },
            { inputs: [1, 0], outputs: [0] },
            { inputs: [1, 1], outputs: [0] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'NOR',
          timeSteps: 8,
          inputA: [0, 0, 1, 1, 0, 1, 1, 0],
          inputB: [0, 1, 0, 1, 1, 1, 0, 0],
          expectedOutput: [1, 0, 0, 0, 0, 0, 0, 1],
        },
      },
    ],
  },
  // === Level 7: XOR ===
  {
    id: 7,
    title: 'Porta XOR',
    description: 'Ou exclusivo',
    objective: 'Aprenda a porta XOR: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'xor', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [0] },
          { inputs: [0, 1], expectedOutputs: [1] },
          { inputs: [1, 0], expectedOutputs: [1] },
          { inputs: [1, 1], expectedOutputs: [0] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['XOR'],
          rows: [
            { inputs: [0, 0], outputs: [0] },
            { inputs: [0, 1], outputs: [1] },
            { inputs: [1, 0], outputs: [1] },
            { inputs: [1, 1], outputs: [0] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'XOR',
          timeSteps: 8,
          inputA: [0, 1, 1, 0, 1, 0, 0, 1],
          inputB: [0, 0, 1, 1, 1, 0, 1, 1],
          expectedOutput: [0, 1, 0, 1, 0, 0, 1, 0],
        },
      },
    ],
  },
  // === Level 8: XNOR ===
  {
    id: 8,
    title: 'Porta XNOR',
    description: 'Igualdade',
    objective: 'Aprenda a porta XNOR: monte, preencha e analise.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'xnor', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [1] },
          { inputs: [0, 1], expectedOutputs: [0] },
          { inputs: [1, 0], expectedOutputs: [0] },
          { inputs: [1, 1], expectedOutputs: [1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['XNOR'],
          rows: [
            { inputs: [0, 0], outputs: [1] },
            { inputs: [0, 1], outputs: [0] },
            { inputs: [1, 0], outputs: [0] },
            { inputs: [1, 1], outputs: [1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
      {
        type: 'waveform',
        label: 'Forma de Onda',
        waveform: {
          gate: 'XNOR',
          timeSteps: 8,
          inputA: [0, 1, 1, 0, 1, 0, 0, 1],
          inputB: [0, 0, 1, 1, 1, 0, 1, 1],
          expectedOutput: [1, 0, 1, 0, 1, 1, 0, 1],
        },
      },
    ],
  },
  // === Level 9: Combinational (A AND B) OR C ===
  {
    id: 9,
    title: 'Combinacional 1',
    description: '(A AND B) OR C',
    objective: 'Construa o circuito (A AND B) OR C e preencha a tabela verdade.',
    maxScore: 100,
    phases: [
      {
        type: 'formula_quiz',
        label: 'Quiz 2ⁿ',
        formulaQuiz: { numInputs: 3 },
      },
      {
        type: 'circuit',
        label: 'Circuito',
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
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B', 'C'],
          outputLabels: ['(A∧B)∨C'],
          rows: [
            { inputs: [0, 0, 0], outputs: [0] },
            { inputs: [0, 0, 1], outputs: [1] },
            { inputs: [0, 1, 0], outputs: [0] },
            { inputs: [0, 1, 1], outputs: [1] },
            { inputs: [1, 0, 0], outputs: [0] },
            { inputs: [1, 0, 1], outputs: [1] },
            { inputs: [1, 1, 0], outputs: [1] },
            { inputs: [1, 1, 1], outputs: [1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
    ],
  },
  // === Level 10: Combinational (A OR B) AND C ===
  {
    id: 10,
    title: 'Combinacional 2',
    description: '(A OR B) AND C',
    objective: 'Construa o circuito (A OR B) AND C e preencha a tabela verdade.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'and', 'or', 'led'],
        testCases: [
          { inputs: [0, 0, 0], expectedOutputs: [0] },
          { inputs: [0, 0, 1], expectedOutputs: [0] },
          { inputs: [0, 1, 0], expectedOutputs: [0] },
          { inputs: [0, 1, 1], expectedOutputs: [1] },
          { inputs: [1, 0, 0], expectedOutputs: [0] },
          { inputs: [1, 0, 1], expectedOutputs: [1] },
          { inputs: [1, 1, 0], expectedOutputs: [0] },
          { inputs: [1, 1, 1], expectedOutputs: [1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B', 'C'],
          outputLabels: ['(A∨B)∧C'],
          rows: [
            { inputs: [0, 0, 0], outputs: [0] },
            { inputs: [0, 0, 1], outputs: [0] },
            { inputs: [0, 1, 0], outputs: [0] },
            { inputs: [0, 1, 1], outputs: [1] },
            { inputs: [1, 0, 0], outputs: [0] },
            { inputs: [1, 0, 1], outputs: [1] },
            { inputs: [1, 1, 0], outputs: [0] },
            { inputs: [1, 1, 1], outputs: [1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
    ],
  },
  // === Level 11: Half-Adder ===
  {
    id: 11,
    title: 'Meio-Somador',
    description: 'Half-Adder',
    objective: 'Construa um Meio-Somador: Soma = A XOR B, Carry = A AND B.',
    maxScore: 100,
    phases: [
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'xor', 'and', 'led'],
        testCases: [
          { inputs: [0, 0], expectedOutputs: [0, 0] },
          { inputs: [0, 1], expectedOutputs: [1, 0] },
          { inputs: [1, 0], expectedOutputs: [1, 0] },
          { inputs: [1, 1], expectedOutputs: [0, 1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B'],
          outputLabels: ['Soma', 'Carry'],
          rows: [
            { inputs: [0, 0], outputs: [0, 0] },
            { inputs: [0, 1], outputs: [1, 0] },
            { inputs: [1, 0], outputs: [1, 0] },
            { inputs: [1, 1], outputs: [0, 1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3],
        },
      },
    ],
  },
  // === Level 12: Full-Adder ===
  {
    id: 12,
    title: 'Somador Completo',
    description: 'Full-Adder',
    objective: 'Construa um Somador Completo com 3 entradas e 2 saídas (Soma e Cout).',
    maxScore: 100,
    phases: [
      {
        type: 'formula_quiz',
        label: 'Quiz 2ⁿ',
        formulaQuiz: { numInputs: 3 },
      },
      {
        type: 'circuit',
        label: 'Circuito',
        availableComponents: ['toggleSwitch', 'xor', 'and', 'or', 'led'],
        testCases: [
          { inputs: [0, 0, 0], expectedOutputs: [0, 0] },
          { inputs: [0, 0, 1], expectedOutputs: [1, 0] },
          { inputs: [0, 1, 0], expectedOutputs: [1, 0] },
          { inputs: [0, 1, 1], expectedOutputs: [0, 1] },
          { inputs: [1, 0, 0], expectedOutputs: [1, 0] },
          { inputs: [1, 0, 1], expectedOutputs: [0, 1] },
          { inputs: [1, 1, 0], expectedOutputs: [0, 1] },
          { inputs: [1, 1, 1], expectedOutputs: [1, 1] },
        ],
      },
      {
        type: 'fill_table',
        label: 'Tabela Verdade',
        truthTable: {
          inputLabels: ['A', 'B', 'Cin'],
          outputLabels: ['Soma', 'Cout'],
          rows: [
            { inputs: [0, 0, 0], outputs: [0, 0] },
            { inputs: [0, 0, 1], outputs: [1, 0] },
            { inputs: [0, 1, 0], outputs: [1, 0] },
            { inputs: [0, 1, 1], outputs: [0, 1] },
            { inputs: [1, 0, 0], outputs: [1, 0] },
            { inputs: [1, 0, 1], outputs: [0, 1] },
            { inputs: [1, 1, 0], outputs: [0, 1] },
            { inputs: [1, 1, 1], outputs: [1, 1] },
          ],
          hiddenOutputIndices: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
    ],
  },
  // === Level 13: Binary 3 bits ===
  {
    id: 13,
    title: 'Binário: 3 bits',
    description: 'Conversão rápida',
    objective: 'Represente o número decimal 5 usando 3 bits.',
    maxScore: 100,
    phases: [
      {
        type: 'bit_weight',
        label: 'Peso de Bits',
        bitWeight: { targetDecimal: 5, numBits: 3 },
      },
    ],
  },
  // === Level 14: Binary 4 bits ===
  {
    id: 14,
    title: 'Binário: 4 bits',
    description: 'Conversão rápida',
    objective: 'Represente o número decimal 11 usando 4 bits.',
    maxScore: 100,
    phases: [
      {
        type: 'bit_weight',
        label: 'Peso de Bits',
        bitWeight: { targetDecimal: 11, numBits: 4 },
      },
    ],
  },
  // === Level 15: Binary 5 bits ===
  {
    id: 15,
    title: 'Binário: 5 bits',
    description: 'Conversão avançada',
    objective: 'Represente o número decimal 23 usando 5 bits.',
    maxScore: 100,
    phases: [
      {
        type: 'bit_weight',
        label: 'Peso de Bits',
        bitWeight: { targetDecimal: 23, numBits: 5 },
      },
    ],
  },
];
