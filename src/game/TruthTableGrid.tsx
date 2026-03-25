import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { LogicValue } from '@/circuit/types';
import type { TruthTableChallenge } from './levels';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface TruthTableGridRef {
  getAnswers: () => (LogicValue | null)[][];
  verify: () => boolean;
}

interface Props {
  challenge: TruthTableChallenge;
  mode: 'fill_table' | 'interpret_table';
  disabled?: boolean;
}

const TruthTableGrid = forwardRef<TruthTableGridRef, Props>(
  ({ challenge, mode, disabled }, ref) => {
    const numOutputs = challenge.outputLabels.length;
    const numRows = challenge.rows.length;

    // For fill_table: user fills hidden outputs. For interpret_table: all shown (read-only).
    const isFillMode = mode === 'fill_table';

    const [answers, setAnswers] = useState<(LogicValue | null)[][]>(() =>
      challenge.rows.map((row, rowIdx) =>
        row.outputs.map((val, colIdx) => {
          if (!isFillMode) return val;
          const isHidden = challenge.hiddenOutputIndices?.includes(rowIdx) ?? false;
          return isHidden ? null : val;
        })
      )
    );

    const toggleCell = useCallback(
      (rowIdx: number, colIdx: number) => {
        if (disabled || !isFillMode) return;
        const isHidden = challenge.hiddenOutputIndices?.includes(rowIdx) ?? false;
        if (!isHidden) return;

        setAnswers(prev => {
          const next = prev.map(r => [...r]);
          const current = next[rowIdx][colIdx];
          next[rowIdx][colIdx] = current === null ? 1 : current === 1 ? 0 : current === 0 ? null : 1;
          return next;
        });
      },
      [disabled, isFillMode, challenge.hiddenOutputIndices]
    );

    const verify = useCallback((): boolean => {
      return challenge.rows.every((row, rowIdx) =>
        row.outputs.every((expected, colIdx) => answers[rowIdx][colIdx] === expected)
      );
    }, [answers, challenge.rows]);

    useImperativeHandle(ref, () => ({ getAnswers: () => answers, verify }), [answers, verify]);

    return (
      <div className="flex flex-col gap-2 p-3 bg-card border border-border rounded-lg">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
          Tabela Verdade
        </h3>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                {challenge.inputLabels.map(label => (
                  <TableHead key={label} className="text-center text-xs px-2 py-1 text-muted-foreground">
                    {label}
                  </TableHead>
                ))}
                {challenge.outputLabels.map(label => (
                  <TableHead key={label} className="text-center text-xs px-2 py-1 text-primary font-bold">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenge.rows.map((row, rowIdx) => {
                const isHidden = isFillMode && (challenge.hiddenOutputIndices?.includes(rowIdx) ?? false);
                return (
                  <TableRow key={rowIdx} className="border-border">
                    {row.inputs.map((val, i) => (
                      <TableCell key={`in-${i}`} className="text-center text-xs px-2 py-1 font-mono text-foreground">
                        {val}
                      </TableCell>
                    ))}
                    {row.outputs.map((_, colIdx) => {
                      const userVal = answers[rowIdx][colIdx];
                      const editable = isHidden && !disabled;
                      return (
                        <TableCell
                          key={`out-${colIdx}`}
                          onClick={() => toggleCell(rowIdx, colIdx)}
                          className={cn(
                            'text-center text-xs px-2 py-1 font-mono transition-colors',
                            editable
                              ? 'cursor-pointer hover:bg-primary/10 select-none'
                              : 'cursor-default',
                            userVal === null
                              ? 'text-muted-foreground/40'
                              : 'text-foreground font-bold'
                          )}
                        >
                          {userVal === null ? '?' : userVal}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {isFillMode && (
          <p className="text-[10px] text-muted-foreground">
            Clique nas células com "?" para alternar entre 0, 1 e vazio.
          </p>
        )}
      </div>
    );
  }
);

TruthTableGrid.displayName = 'TruthTableGrid';

export default TruthTableGrid;
