import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { VoltageSourceData } from '../types';

const VoltageSourceNode = memo(({ data }: NodeProps<VoltageSourceData>) => {
  return (
    <div className="circuit-node" style={{ minWidth: 80 }}>
      <div className="text-[10px] font-medium mb-1 text-circuit-label tracking-wide uppercase">
        VCC
      </div>
      <div
        className="w-10 h-10 rounded-full mx-auto flex items-center justify-center border-2"
        style={{
          borderColor: 'hsl(142, 70%, 45%)',
          backgroundColor: 'hsl(142, 70%, 45%, 0.15)',
        }}
      >
        <span className="text-sm font-bold" style={{ color: 'hsl(142, 70%, 45%)' }}>1</span>
      </div>
      <div className="text-[10px] mt-1 font-mono font-bold" style={{ color: 'hsl(142, 70%, 45%)' }}>
        HIGH
      </div>
      <Handle type="source" position={Position.Right} style={{ right: -5 }} />
    </div>
  );
});

VoltageSourceNode.displayName = 'VoltageSourceNode';
export default VoltageSourceNode;
