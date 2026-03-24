import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GateData } from '../types';

const gateSymbols: Record<string, { label: string; shape: (output: number) => JSX.Element }> = {
  not: {
    label: 'NOT',
    shape: (output) => (
      <svg width="48" height="36" viewBox="0 0 48 36">
        <polygon points="6,4 38,18 6,32" fill="none" stroke="hsl(220, 25%, 25%)" strokeWidth="2" />
        <circle cx="41" cy="18" r="3" fill="none" stroke="hsl(220, 25%, 25%)" strokeWidth="2" />
        <text x="16" y="21" fontSize="9" fontFamily="JetBrains Mono" fill="hsl(220, 25%, 25%)" fontWeight="600">1</text>
      </svg>
    ),
  },
  and: {
    label: 'AND',
    shape: (output) => (
      <svg width="48" height="36" viewBox="0 0 48 36">
        <path d="M6,4 L24,4 Q44,4 44,18 Q44,32 24,32 L6,32 Z" fill="none" stroke="hsl(220, 25%, 25%)" strokeWidth="2" />
        <text x="14" y="22" fontSize="8" fontFamily="JetBrains Mono" fill="hsl(220, 25%, 25%)" fontWeight="600">&amp;</text>
      </svg>
    ),
  },
  or: {
    label: 'OR',
    shape: (output) => (
      <svg width="48" height="36" viewBox="0 0 48 36">
        <path d="M6,4 Q18,18 6,32 Q28,32 44,18 Q28,4 6,4 Z" fill="none" stroke="hsl(220, 25%, 25%)" strokeWidth="2" />
        <text x="16" y="22" fontSize="8" fontFamily="JetBrains Mono" fill="hsl(220, 25%, 25%)" fontWeight="600">≥1</text>
      </svg>
    ),
  },
};

const GateNode = memo(({ data }: NodeProps<GateData>) => {
  const gate = gateSymbols[data.type];
  if (!gate) return null;

  const inputCount = data.type === 'not' ? 1 : 2;

  return (
    <div className="circuit-node" style={{ minWidth: 80, padding: '6px 10px' }}>
      <div className="text-[10px] font-medium mb-0.5 text-circuit-label tracking-wide uppercase">
        {gate.label}
      </div>
      {gate.shape(data.output)}
      <div className="text-[10px] mt-0.5 font-mono font-bold" style={{ color: data.output ? 'hsl(142, 70%, 45%)' : 'hsl(215, 15%, 55%)' }}>
        Out: {data.output}
      </div>

      {/* Input handles */}
      {inputCount === 1 ? (
        <Handle type="target" position={Position.Left} style={{ left: -5, top: '50%' }} />
      ) : (
        <>
          <Handle type="target" position={Position.Left} id="a" style={{ left: -5, top: '35%' }} />
          <Handle type="target" position={Position.Left} id="b" style={{ left: -5, top: '65%' }} />
        </>
      )}

      {/* Output handle */}
      <Handle type="source" position={Position.Right} style={{ right: -5, top: '50%' }} />
    </div>
  );
});

GateNode.displayName = 'GateNode';
export default GateNode;
