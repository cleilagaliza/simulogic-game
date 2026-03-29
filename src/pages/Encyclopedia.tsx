import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GateEntry {
  id: string;
  name: string;
  description: string;
  rule: string;
  symbol: () => JSX.Element;
  truthTable: { inputs: number[]; output: number }[];
  inputLabels: string[];
}

const gates: GateEntry[] = [
  {
    id: 'not',
    name: 'NOT (Inversor)',
    description: 'Inverte o valor lógico da entrada. Se a entrada é 1, a saída é 0, e vice-versa.',
    rule: 'A saída é o complemento da entrada.',
    inputLabels: ['A'],
    truthTable: [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 },
    ],
    symbol: () => (
      <svg width="80" height="48" viewBox="0 0 80 48">
        <polygon points="10,6 60,24 10,42" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="65" cy="24" r="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="24" x2="10" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="69" y1="24" x2="80" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'and',
    name: 'AND (E)',
    description: 'Retorna 1 somente quando todas as entradas são 1.',
    rule: 'A saída é 1 apenas se A = 1 E B = 1.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    symbol: () => (
      <svg width="80" height="48" viewBox="0 0 80 48">
        <path d="M10,6 L38,6 Q68,6 68,24 Q68,42 38,42 L10,42 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="10" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="10" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="68" y1="24" x2="80" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'or',
    name: 'OR (OU)',
    description: 'Retorna 1 quando pelo menos uma entrada é 1.',
    rule: 'A saída é 1 se A = 1 OU B = 1.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 },
    ],
    symbol: () => (
      <svg width="80" height="48" viewBox="0 0 80 48">
        <path d="M10,6 Q24,24 10,42 Q40,42 68,24 Q40,6 10,6 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="14" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="14" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="68" y1="24" x2="80" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'nand',
    name: 'NAND (NÃO-E)',
    description: 'Complemento da porta AND. Retorna 0 somente quando todas as entradas são 1.',
    rule: 'A saída é 0 apenas se A = 1 E B = 1.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    symbol: () => (
      <svg width="84" height="48" viewBox="0 0 84 48">
        <path d="M10,6 L38,6 Q68,6 68,24 Q68,42 38,42 L10,42 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="72" cy="24" r="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="10" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="10" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="76" y1="24" x2="84" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'nor',
    name: 'NOR (NÃO-OU)',
    description: 'Complemento da porta OR. Retorna 1 somente quando todas as entradas são 0.',
    rule: 'A saída é 1 apenas se A = 0 E B = 0.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 0 },
    ],
    symbol: () => (
      <svg width="84" height="48" viewBox="0 0 84 48">
        <path d="M10,6 Q24,24 10,42 Q40,42 68,24 Q40,6 10,6 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="72" cy="24" r="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="14" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="14" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="76" y1="24" x2="84" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'xor',
    name: 'XOR (OU Exclusivo)',
    description: 'Retorna 1 quando as entradas são diferentes entre si.',
    rule: 'A saída é 1 se A ≠ B.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    symbol: () => (
      <svg width="80" height="48" viewBox="0 0 80 48">
        <path d="M14,6 Q28,24 14,42 Q44,42 68,24 Q44,6 14,6 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <path d="M10,6 Q24,24 10,42" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="16" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="16" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="68" y1="24" x2="80" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'xnor',
    name: 'XNOR (Coincidência)',
    description: 'Complemento da porta XOR. Retorna 1 quando as entradas são iguais.',
    rule: 'A saída é 1 se A = B.',
    inputLabels: ['A', 'B'],
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    symbol: () => (
      <svg width="84" height="48" viewBox="0 0 84 48">
        <path d="M14,6 Q28,24 14,42 Q44,42 68,24 Q44,6 14,6 Z" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <path d="M10,6 Q24,24 10,42" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx="72" cy="24" r="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="16" x2="16" y2="16" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="0" y1="32" x2="16" y2="32" stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1="76" y1="24" x2="84" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" />
      </svg>
    ),
  },
];

const Encyclopedia = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBinary, setShowBinary] = useState(false);

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/menu')} className="h-8 w-8">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Enciclopédia Lógica</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          Revisão teórica das portas lógicas fundamentais. Clique em um componente para ver seu símbolo ANSI, regra lógica e tabela verdade.
        </p>

        {/* Binary Systems section */}
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 overflow-hidden mb-4">
          <button
            onClick={() => setShowBinary(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-primary/10 transition-colors"
          >
            <span className="font-bold text-sm text-primary">📐 Sistemas Binários</span>
            <ChevronDown
              size={16}
              className={`text-primary transition-transform ${showBinary ? 'rotate-180' : ''}`}
            />
          </button>

          {showBinary && (
            <div className="px-4 pb-4 space-y-4 border-t border-primary/20 pt-3">
              {/* Bit */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">O que é um Bit?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Um <strong className="text-foreground">bit</strong> (binary digit) é a menor unidade de informação em sistemas digitais.
                  Ele pode assumir apenas dois valores: <code className="text-primary font-bold">0</code> (desligado/falso)
                  ou <code className="text-primary font-bold">1</code> (ligado/verdadeiro). Toda a computação digital é construída sobre esta base.
                </p>
              </div>

              {/* Byte */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">O que é um Byte?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Um <strong className="text-foreground">byte</strong> é um grupo de <strong>8 bits</strong>.
                  Com 8 bits, é possível representar <code className="text-primary font-bold">2⁸ = 256</code> valores diferentes (de 0 a 255).
                  O byte é a unidade fundamental de armazenamento em computadores.
                </p>
              </div>

              {/* MSB / LSB */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">MSB e LSB</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  A posição de cada bit determina seu <strong className="text-foreground">peso</strong> (valor). Num número binário, os bits são ordenados:
                </p>
                <div className="flex items-center justify-center gap-1 p-3 bg-muted rounded-lg">
                  {[
                    { label: 'MSB', weight: '2³=8', value: '1' },
                    { label: '', weight: '2²=4', value: '0' },
                    { label: '', weight: '2¹=2', value: '1' },
                    { label: 'LSB', weight: '2⁰=1', value: '1' },
                  ].map((bit, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-primary font-bold">{bit.label}</span>
                      <div className="w-10 h-10 rounded border-2 border-border bg-background flex items-center justify-center text-lg font-bold font-mono text-foreground">
                        {bit.value}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono">{bit.weight}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-1 ml-3">
                    <span className="text-[9px] text-muted-foreground">&nbsp;</span>
                    <span className="text-sm font-bold text-foreground">= 11</span>
                    <span className="text-[9px] text-muted-foreground font-mono">(decimal)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  <strong className="text-foreground">MSB</strong> (Most Significant Bit) — bit mais à esquerda, com maior peso.
                  <br />
                  <strong className="text-foreground">LSB</strong> (Least Significant Bit) — bit mais à direita, com menor peso (vale 1).
                  <br />
                  A ordem dos bits afeta diretamente o resultado: trocar MSB e LSB gera um número completamente diferente.
                </p>
              </div>

              {/* 2^n formula */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Fórmula: 2ⁿ combinações</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Com <strong className="text-foreground">n</strong> bits, existem <code className="text-primary font-bold">2ⁿ</code> combinações possíveis.
                  Exemplo: 3 bits → 2³ = 8 combinações (000 a 111). Essa fórmula é a base para entender tabelas verdade.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Gates list */}
        {gates.map(gate => {
          const isOpen = expandedId === gate.id;
          return (
            <div
              key={gate.id}
              className="rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => toggle(gate.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors"
              >
                <span className="font-medium text-sm text-foreground">{gate.name}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-md p-3 flex items-center justify-center">
                      {gate.symbol()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground">{gate.description}</p>
                      <p className="text-xs font-mono text-primary font-medium">{gate.rule}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Tabela Verdade
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {gate.inputLabels.map(label => (
                            <TableHead key={label} className="text-center font-mono text-xs w-16">
                              {label}
                            </TableHead>
                          ))}
                          <TableHead className="text-center font-mono text-xs w-16">Saída</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gate.truthTable.map((row, i) => (
                          <TableRow key={i}>
                            {row.inputs.map((v, j) => (
                              <TableCell key={j} className="text-center font-mono text-sm py-1.5">
                                {v}
                              </TableCell>
                            ))}
                            <TableCell
                              className={`text-center font-mono text-sm font-bold py-1.5 ${
                                row.output === 1 ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {row.output}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Encyclopedia;
