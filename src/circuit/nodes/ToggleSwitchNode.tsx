import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ToggleSwitchData } from '../types';

const ToggleSwitchNode = memo(({ data, id }: NodeProps<ToggleSwitchData>) => {
  return (
    <div className="circuit-node" style={{ minWidth: 80 }}>
      <div className="text-[10px] font-medium mb-1 text-circuit-label tracking-wide uppercase">
        Switch
      </div>
      <button
        onClick={() => {
          // Handled via parent callback
          const event = new CustomEvent('circuit-toggle', { detail: { id, value: data.value === 1 ? 0 : 1 } });
          window.dispatchEvent(event);
        }}
        className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
        style={{
          backgroundColor: data.value === 1 ? 'hsl(142, 70%, 45%)' : 'hsl(215, 15%, 75%)',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-200"
          style={{
            backgroundColor: 'white',
            transform: data.value === 1 ? 'translateX(26px)' : 'translateX(2px)',
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

ToggleSwitchNode.displayName = 'ToggleSwitchNode';
export default ToggleSwitchNode;
