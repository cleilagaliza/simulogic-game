import { memo } from 'react';
import { ToggleLeft, Circle, Lightbulb, Ban, GitMerge, GitFork, Zap, ShieldOff, ShieldClose, Shuffle, ShieldX, Search } from 'lucide-react';

interface DraggableItemProps {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const DraggableItem = ({ type, label, icon }: DraggableItemProps) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border"
    >
      <span className="text-sidebar-primary">{icon}</span>
      <span className="text-xs font-medium text-sidebar-foreground">{label}</span>
    </div>
  );
};

const allInputs = [
  { type: 'toggleSwitch', label: 'Toggle Switch', icon: <ToggleLeft size={16} /> },
  { type: 'pushButton', label: 'Push Button', icon: <Circle size={16} /> },
  { type: 'voltageSource', label: 'Fonte (VCC)', icon: <Zap size={16} /> },
];

const allOutputs = [
  { type: 'led', label: 'LED', icon: <Lightbulb size={16} /> },
];

const allTools = [
  { type: 'probe', label: 'Sonda Lógica', icon: <Search size={16} /> },
];

const allGates = [
  { type: 'not', label: 'NOT', icon: <Ban size={16} /> },
  { type: 'and', label: 'AND', icon: <GitMerge size={16} /> },
  { type: 'or', label: 'OR', icon: <GitFork size={16} /> },
  { type: 'nand', label: 'NAND', icon: <ShieldOff size={16} /> },
  { type: 'nor', label: 'NOR', icon: <ShieldClose size={16} /> },
  { type: 'xor', label: 'XOR', icon: <Shuffle size={16} /> },
  { type: 'xnor', label: 'XNOR', icon: <ShieldX size={16} /> },
];

interface CircuitSidebarProps {
  availableComponents?: string[];
}

const CircuitSidebar = memo(({ availableComponents }: CircuitSidebarProps) => {
  const filter = (items: typeof allInputs) =>
    availableComponents ? items.filter(i => availableComponents.includes(i.type)) : items;

  const inputs = filter(allInputs);
  const outputs = filter(allOutputs);
  const gates = filter(allGates);
  // Probe is always available when sidebar is shown
  const tools = allTools;

  return (
    <div className="w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-sm font-bold tracking-tight" style={{ color: 'hsl(var(--sidebar-primary))' }}>
          ⚡ Logic Simulator
        </h1>
        <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">Arraste os componentes</p>
      </div>

      <div className="p-3 flex flex-col gap-1">
        {inputs.length > 0 && (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1">
              Entradas
            </div>
            {inputs.map(item => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </>
        )}

        {outputs.length > 0 && (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 mt-2">
              Saídas
            </div>
            {outputs.map(item => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </>
        )}

        {gates.length > 0 && (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 mt-2">
              Portas Lógicas
            </div>
            {gates.map(item => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </>
        )}

        {tools.length > 0 && (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 mt-2">
              Ferramentas
            </div>
            {tools.map(item => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </>
        )}
      </div>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <p className="text-[9px] text-sidebar-foreground/40 leading-relaxed">
          Conecte componentes arrastando entre os handles. Sinais propagam em tempo real.
        </p>
      </div>
    </div>
  );
});

CircuitSidebar.displayName = 'CircuitSidebar';
export default CircuitSidebar;
