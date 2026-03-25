import type { LogicValue } from '@/circuit/types';

export interface TestCase {
  inputs: LogicValue[];
  expectedOutputs: LogicValue[];
}

export type ChallengeType = 'circuit' | 'fill_table' | 'interpret_table';

export interface TruthTableChallenge {
  inputLabels: string[];
  outputLabels: string[];
  rows: { inputs: LogicValue[]; outputs: LogicValue[] }[];
  /** For 'fill_table': indices of output cells the user must fill (others shown) */
  hiddenOutputIndices?: number[];
}

export interface LevelDefinition {
  id: number;
  title: string;
  description: string;
  objective: string;
  availableComponents: string[];
  testCases: TestCase[];
  maxScore: number;
  challengeType: ChallengeType;
  truthTable?: TruthTableChallenge;
}

export const levels: LevelDefinition[] = [
  // === BEGINNER: Single gates, 1-2 inputs ===
  {
    id: 0,
    title: 'Olá, Mundo!',
    description: 'Sua primeira conexão',
    objective: 'Conecte uma Fonte (VCC) a um LED para fazê-lo acender.',
    availableComponents: ['voltageSource', 'led'],
    testCases: [],
    maxScore: 100,
    challengeType: 'circuit',
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
    challengeType: 'circuit',
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
    challengeType: 'circuit',
  },
  {
    id: 3,
    title: 'Tabela NOT',
    description: 'Preencha a tabela verdade',
    objective: 'Um circuito NOT está montado. Preencha as saídas da Tabela Verdade.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
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
    id: 4,
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
    challengeType: 'circuit',
  },
  {
    id: 5,
    title: 'Tabela AND',
    description: 'Preencha a tabela verdade',
    objective: 'Preencha todas as saídas da Tabela Verdade da porta AND.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
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
    id: 6,
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
    challengeType: 'circuit',
  },
  {
    id: 7,
    title: 'Interprete OR',
    description: 'Monte o circuito',
    objective: 'A Tabela Verdade mostra o comportamento de uma porta OR. Monte o circuito correspondente.',
    availableComponents: ['toggleSwitch', 'or', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
    maxScore: 100,
    challengeType: 'interpret_table',
    truthTable: {
      inputLabels: ['A', 'B'],
      outputLabels: ['Saída'],
      rows: [
        { inputs: [0, 0], outputs: [0] },
        { inputs: [0, 1], outputs: [1] },
        { inputs: [1, 0], outputs: [1] },
        { inputs: [1, 1], outputs: [1] },
      ],
    },
  },
  {
    id: 8,
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
    challengeType: 'circuit',
  },
  {
    id: 9,
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
    challengeType: 'circuit',
  },
  {
    id: 10,
    title: 'Tabela NAND & NOR',
    description: 'Preencha ambas as saídas',
    objective: 'Complete a Tabela Verdade com as saídas NAND e NOR para cada combinação de entradas.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
    truthTable: {
      inputLabels: ['A', 'B'],
      outputLabels: ['NAND', 'NOR'],
      rows: [
        { inputs: [0, 0], outputs: [1, 1] },
        { inputs: [0, 1], outputs: [1, 0] },
        { inputs: [1, 0], outputs: [1, 0] },
        { inputs: [1, 1], outputs: [0, 0] },
      ],
      hiddenOutputIndices: [0, 1, 2, 3],
    },
  },
  {
    id: 11,
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
    challengeType: 'circuit',
  },
  {
    id: 12,
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
    challengeType: 'circuit',
  },
  {
    id: 13,
    title: 'Interprete XOR',
    description: 'Monte o circuito XOR',
    objective: 'A Tabela Verdade abaixo descreve um XOR. Monte o circuito que a satisfaça.',
    availableComponents: ['toggleSwitch', 'xor', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
    maxScore: 100,
    challengeType: 'interpret_table',
    truthTable: {
      inputLabels: ['A', 'B'],
      outputLabels: ['Saída'],
      rows: [
        { inputs: [0, 0], outputs: [0] },
        { inputs: [0, 1], outputs: [1] },
        { inputs: [1, 0], outputs: [1] },
        { inputs: [1, 1], outputs: [0] },
      ],
    },
  },
  // === INTERMEDIATE: 3 inputs, combinational ===
  {
    id: 14,
    title: 'Combinacional 1',
    description: '(A AND B) OR C',
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
    challengeType: 'circuit',
  },
  {
    id: 15,
    title: 'Tabela 3 Entradas',
    description: 'Preencha (A AND B) OR C',
    objective: 'Complete a Tabela Verdade de 8 linhas para o circuito (A AND B) OR C.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
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
  {
    id: 16,
    title: 'Interprete Combinacional',
    description: 'Monte (A OR B) AND C',
    objective: 'A Tabela Verdade descreve (A OR B) AND C. Monte o circuito correspondente.',
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
    maxScore: 100,
    challengeType: 'interpret_table',
    truthTable: {
      inputLabels: ['A', 'B', 'C'],
      outputLabels: ['Saída'],
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
    },
  },
  // === ADVANCED: Half-Adder and Full-Adder ===
  {
    id: 17,
    title: 'Meio-Somador',
    description: 'Half-Adder',
    objective: 'Construa um Meio-Somador: Soma = A XOR B, Carry = A AND B. Use 2 LEDs (Soma em cima, Carry embaixo).',
    availableComponents: ['toggleSwitch', 'xor', 'and', 'led'],
    testCases: [
      { inputs: [0, 0], expectedOutputs: [0, 0] },
      { inputs: [0, 1], expectedOutputs: [1, 0] },
      { inputs: [1, 0], expectedOutputs: [1, 0] },
      { inputs: [1, 1], expectedOutputs: [0, 1] },
    ],
    maxScore: 100,
    challengeType: 'circuit',
  },
  {
    id: 18,
    title: 'Tabela Meio-Somador',
    description: 'Preencha Soma e Carry',
    objective: 'Complete a Tabela Verdade do Meio-Somador (Half-Adder) com as colunas Soma e Carry.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
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
  {
    id: 19,
    title: 'Somador Completo',
    description: 'Full-Adder',
    objective: 'Construa um Somador Completo: Soma = A XOR B XOR Cin, Cout = (A AND B) OR (Cin AND (A XOR B)). Use 3 switches e 2 LEDs.',
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
    maxScore: 100,
    challengeType: 'circuit',
  },
  {
    id: 20,
    title: 'Tabela Full-Adder',
    description: 'Preencha o Somador Completo',
    objective: 'Complete a Tabela Verdade do Somador Completo (Full-Adder) com Soma e Cout.',
    availableComponents: [],
    testCases: [],
    maxScore: 100,
    challengeType: 'fill_table',
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
];
