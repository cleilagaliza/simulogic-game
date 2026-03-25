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

        {gates.map(gate => {
          const isOpen = expandedId === gate.id;
          return (
            <div
              key={gate.id}
              className="rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Header row */}
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

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                  {/* Symbol */}
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-md p-3 flex items-center justify-center">
                      {gate.symbol()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground">{gate.description}</p>
                      <p className="text-xs font-mono text-primary font-medium">{gate.rule}</p>
                    </div>
                  </div>

                  {/* Truth Table */}
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
