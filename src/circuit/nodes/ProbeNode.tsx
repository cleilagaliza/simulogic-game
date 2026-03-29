import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { LogicValue } from '../types';

interface ProbeData {
  type: 'probe';
  value: LogicValue;
}

const ProbeNode = memo(({ data }: { data: ProbeData }) => {
  const isHigh = data.value === 1;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 48, height: 48 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          width: 8,
          height: 8,
          background: 'hsl(var(--primary))',
          border: '2px solid hsl(var(--border))',
        }}
      />

      {/* Probe body - triangle pointing down */}
      <svg width={48} height={48} viewBox="0 0 48 48">
        <polygon
          points="24,4 40,36 8,36"
          fill={isHigh ? 'hsl(142, 70%, 45%)' : 'hsl(var(--muted))'}
          stroke="hsl(var(--border))"
          strokeWidth={2}
        />
        <text
          x={24}
          y={28}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fontFamily="monospace"
          fill={isHigh ? 'white' : 'hsl(var(--muted-foreground))'}
        >
          {data.value}
        </text>
      </svg>

      {/* Glow effect */}
      {isHigh && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(142, 70%, 45%, 0.3) 0%, transparent 70%)',
          }}
        />
      )}

      <div className="absolute -bottom-4 text-[8px] font-mono font-bold text-muted-foreground whitespace-nowrap">
        SONDA
      </div>
    </div>
  );
});

ProbeNode.displayName = 'ProbeNode';
export default ProbeNode;
