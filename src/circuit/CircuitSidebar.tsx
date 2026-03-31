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
      className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border"
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
  const tools = allTools;

  const Section = ({ title, items }: { title: string; items: typeof allInputs }) =>
    items.length > 0 ? (
      <>
        <div className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 py-1 mt-1">
          {title}
        </div>
        {items.map(item => (
          <DraggableItem key={item.type} {...item} />
        ))}
      </>
    ) : null;

  return (
    <div className="w-52 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-3 border-b border-sidebar-border">
        <h1 className="text-xs font-bold tracking-tight" style={{ color: 'hsl(var(--sidebar-primary))' }}>
          ⚡ Componentes
        </h1>
        <p className="text-[9px] text-sidebar-foreground/60 mt-0.5">Arraste para o canvas</p>
      </div>
      <div className="p-2 flex flex-col gap-0.5 flex-1">
        <Section title="Entradas" items={inputs} />
        <Section title="Saídas" items={outputs} />
        <Section title="Portas Lógicas" items={gates} />
        <Section title="Ferramentas" items={tools} />
      </div>
    </div>
  );
});

CircuitSidebar.displayName = 'CircuitSidebar';
export default CircuitSidebar;
