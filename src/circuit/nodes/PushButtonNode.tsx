import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PushButtonData } from '../types';

const PushButtonNode = memo(({ data, id }: NodeProps<PushButtonData>) => {
  const dispatchValue = (value: 0 | 1) => {
    window.dispatchEvent(new CustomEvent('circuit-toggle', { detail: { id, value } }));
  };

  return (
    <div className="circuit-node" style={{ minWidth: 80 }}>
      <div className="text-[10px] font-medium mb-1 text-circuit-label tracking-wide uppercase">
        Button
      </div>
      <button
        onMouseDown={() => dispatchValue(1)}
        onMouseUp={() => dispatchValue(0)}
        onMouseLeave={() => dispatchValue(0)}
        className="w-10 h-10 rounded-full border-2 transition-all duration-100 active:scale-95 focus:outline-none flex items-center justify-center"
        style={{
          borderColor: data.value === 1 ? 'hsl(142, 70%, 45%)' : 'hsl(215, 15%, 75%)',
          backgroundColor: data.value === 1 ? 'hsl(142, 70%, 45%)' : 'hsl(var(--muted))',
        }}
      >
        <div
          className="w-6 h-6 rounded-full transition-colors"
          style={{
            backgroundColor: data.value === 1 ? 'hsl(142, 80%, 60%)' : 'hsl(215, 15%, 85%)',
          }}
        />
      </button>
      <div className="text-[10px] mt-1 font-mono font-bold" style={{ color: data.value ? 'hsl(142, 70%, 45%)' : 'hsl(215, 15%, 55%)' }}>
        {data.value}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: -5 }}
      />
    </div>
  );
});

PushButtonNode.displayName = 'PushButtonNode';
export default PushButtonNode;
