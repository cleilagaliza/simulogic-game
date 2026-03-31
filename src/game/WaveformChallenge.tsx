import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { LogicValue } from '@/circuit/types';
import { cn } from '@/lib/utils';

export interface WaveformChallengeData {
  gate: string;
  timeSteps: number;
  inputA: LogicValue[];
  inputB?: LogicValue[];
  expectedOutput: LogicValue[];
}

export interface WaveformChallengeRef {
  verify: () => boolean;
}

interface Props {
  challenge: WaveformChallengeData;
  disabled?: boolean;
}

const STEP_W = 40;
const ROW_H = 36;
const LABEL_W = 40;

function WaveformLine({ values, color, label }: { values: LogicValue[]; color: string; label: string }) {
  const points: string[] = [];
  values.forEach((v, i) => {
    const x1 = LABEL_W + i * STEP_W;
    const x2 = LABEL_W + (i + 1) * STEP_W;
    const y = v === 1 ? 6 : ROW_H - 6;
    if (i > 0) {
      const prevY = values[i - 1] === 1 ? 6 : ROW_H - 6;
      if (prevY !== y) points.push(`${x1},${prevY} ${x1},${y}`);
    }
    points.push(`${x1},${y} ${x2},${y}`);
  });

  return (
    <g>
      <text x={4} y={ROW_H / 2 + 4} className="text-[11px] font-mono font-bold" fill={color}>
        {label}
      </text>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

const WaveformChallenge = forwardRef<WaveformChallengeRef, Props>(({ challenge, disabled }, ref) => {
  const { timeSteps, inputA, inputB, expectedOutput, gate } = challenge;
  const [userOutput, setUserOutput] = useState<LogicValue[]>(() => Array(timeSteps).fill(0));

  const toggleStep = useCallback((idx: number) => {
    if (disabled) return;
    setUserOutput(prev => {
      const next = [...prev];
      next[idx] = next[idx] === 0 ? 1 : 0;
      return next;
    });
  }, [disabled]);

  const verify = useCallback((): boolean => {
    return userOutput.every((v, i) => v === expectedOutput[i]);
  }, [userOutput, expectedOutput]);

  useImperativeHandle(ref, () => ({ verify }), [verify]);

  const totalW = LABEL_W + timeSteps * STEP_W + 8;
  const sectionH = ROW_H;

  return (
    <div className="flex flex-col gap-3 p-4 bg-card border border-border rounded-lg max-w-xl w-full overflow-hidden">
      <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
        Análise de Tempo — Porta {gate.toUpperCase()}
      </h3>
      <p className="text-[11px] text-muted-foreground">
        Observe {inputB ? 'as formas de onda de A e B' : 'a forma de onda de A'}. Clique nos intervalos abaixo para desenhar a saída S.
      </p>

      {/* Time ruler */}
      <div className="overflow-x-auto">
      <svg width={totalW} height={16} className="overflow-visible">
        {Array.from({ length: timeSteps }, (_, i) => (
          <text
            key={i}
            x={LABEL_W + i * STEP_W + STEP_W / 2}
            y={12}
            textAnchor="middle"
            className="text-[9px] font-mono"
            fill="hsl(var(--muted-foreground))"
          >
            t{i}
          </text>
        ))}
      </svg>

      {/* Input A */}
      <svg width={totalW} height={sectionH} className="overflow-visible">
        <WaveformLine values={inputA} color="hsl(215, 90%, 55%)" label="A" />
      </svg>

      {/* Input B */}
      {inputB && (
        <svg width={totalW} height={sectionH} className="overflow-visible">
          <WaveformLine values={inputB} color="hsl(280, 70%, 55%)" label="B" />
        </svg>
      )}

      {/* Divider */}
      <div className="border-t border-dashed border-border" />

      {/* User output S */}
      <p className="text-[10px] text-muted-foreground font-medium">Sua resposta (clique para alternar):</p>
      <svg width={totalW} height={sectionH} className="overflow-visible">
        <WaveformLine values={userOutput} color="hsl(142, 70%, 45%)" label="S" />
        {/* Clickable areas */}
        {Array.from({ length: timeSteps }, (_, i) => (
          <rect
            key={i}
            x={LABEL_W + i * STEP_W}
            y={0}
            width={STEP_W}
            height={sectionH}
            fill="transparent"
            className={disabled ? '' : 'cursor-pointer'}
            onClick={() => toggleStep(i)}
          />
        ))}
      </svg>
      </div>

      <p className="text-[9px] text-muted-foreground">
        Clique em cada intervalo de tempo para definir se a saída é 0 (baixo) ou 1 (alto).
      </p>
    </div>
  );
});

WaveformChallenge.displayName = 'WaveformChallenge';
export default WaveformChallenge;
