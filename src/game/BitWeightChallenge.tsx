import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BitWeightChallengeData {
  targetDecimal: number;
  numBits: number;
}

export interface BitWeightChallengeRef {
  verify: () => boolean;
}

interface Props {
  challenge: BitWeightChallengeData;
  disabled?: boolean;
}

const BitWeightChallenge = forwardRef<BitWeightChallengeRef, Props>(({ challenge, disabled }, ref) => {
  const { targetDecimal, numBits } = challenge;
  const [bits, setBits] = useState<number[]>(() => Array(numBits).fill(0));

  const toggleBit = useCallback((idx: number) => {
    if (disabled) return;
    setBits(prev => {
      const next = [...prev];
      next[idx] = next[idx] === 0 ? 1 : 0;
      return next;
    });
  }, [disabled]);

  const currentDecimal = bits.reduce((acc, b, i) => acc + b * Math.pow(2, numBits - 1 - i), 0);

  const verify = useCallback((): boolean => {
    return currentDecimal === targetDecimal;
  }, [currentDecimal, targetDecimal]);

  useImperativeHandle(ref, () => ({ verify }), [verify]);

  return (
    <div className="flex flex-col items-center gap-5 p-6 bg-card border border-border rounded-lg max-w-md mx-auto">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
        Conversão Rápida — Peso de Bits
      </h3>

      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Represente o número decimal</p>
        <span className="text-4xl font-bold text-foreground">{targetDecimal}</span>
        <p className="text-sm text-muted-foreground">usando {numBits} bits</p>
      </div>

      {/* Bit switches */}
      <div className="flex gap-3">
        {bits.map((b, i) => {
          const weight = Math.pow(2, numBits - 1 - i);
          const isMSB = i === 0;
          const isLSB = i === numBits - 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground font-mono">
                {isMSB ? 'MSB' : isLSB ? 'LSB' : ''}
              </span>
              <button
                onClick={() => toggleBit(i)}
                disabled={disabled}
                className={cn(
                  'w-14 h-14 rounded-lg border-2 text-xl font-bold transition-all',
                  b === 1
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                {b}
              </button>
              <span className="text-[10px] text-muted-foreground font-mono">
                2<sup>{numBits - 1 - i}</sup> = {weight}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current value */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <span className="text-xs text-muted-foreground">Valor atual:</span>
        <span className={cn(
          'text-lg font-bold font-mono',
          currentDecimal === targetDecimal ? 'text-primary' : 'text-foreground'
        )}>
          {currentDecimal}
        </span>
        <span className="text-xs text-muted-foreground">
          ({bits.join('')})<sub>2</sub>
        </span>
      </div>

      <p className="text-[9px] text-muted-foreground text-center">
        Clique nos bits para alternar entre 0 e 1. O bit mais à esquerda (MSB) tem maior peso.
      </p>
    </div>
  );
});

BitWeightChallenge.displayName = 'BitWeightChallenge';
export default BitWeightChallenge;
