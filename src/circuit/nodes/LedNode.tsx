import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LedData, LED_COLORS, LED_COLORS_DIM, LedColor } from '../types';

const colorOptions: LedColor[] = ['red', 'blue', 'green', 'yellow', 'pink', 'white'];

const LedNode = memo(({ data, id }: NodeProps<LedData>) => {
  const isOn = data.value === 1;
  const color = isOn ? LED_COLORS[data.color] : LED_COLORS_DIM[data.color];

  return (
    <div className="circuit-node" style={{ minWidth: 80 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: -5 }}
      />
      <div className="text-[10px] font-medium mb-1 text-circuit-label tracking-wide uppercase">
        LED
      </div>
      <div
        className={`w-8 h-8 rounded-full mx-auto mb-1 transition-all duration-300 ${isOn ? 'led-on' : ''}`}
        style={{
          backgroundColor: color,
          boxShadow: isOn ? `0 0 16px ${LED_COLORS[data.color]}, 0 0 32px ${LED_COLORS[data.color]}40` : 'inset 0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
      <select
        className="text-[9px] bg-transparent border rounded px-1 py-0.5 font-mono focus:outline-none cursor-pointer"
        style={{ borderColor: 'hsl(var(--border))' }}
        value={data.color}
        onChange={(e) => {
          window.dispatchEvent(new CustomEvent('circuit-led-color', {
            detail: { id, color: e.target.value }
          }));
        }}
      >
        {colorOptions.map(c => (
          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
        ))}
      </select>
    </div>
  );
});

LedNode.displayName = 'LedNode';
export default LedNode;
