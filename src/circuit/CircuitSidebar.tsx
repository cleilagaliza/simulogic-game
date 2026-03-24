import { memo } from 'react';
import { ToggleLeft, Circle, Lightbulb, Ban, GitMerge, GitFork } from 'lucide-react';

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

const CircuitSidebar = memo(() => {
  return (
    <div className="w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-sm font-bold tracking-tight text-sidebar-primary-foreground" style={{ color: 'hsl(var(--sidebar-primary))' }}>
          ⚡ Logic Simulator
        </h1>
        <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">Arraste os componentes</p>
      </div>

      <div className="p-3 flex flex-col gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1">
          Entradas
        </div>
        <DraggableItem type="toggleSwitch" label="Toggle Switch" icon={<ToggleLeft size={16} />} />
        <DraggableItem type="pushButton" label="Push Button" icon={<Circle size={16} />} />

        <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 mt-2">
          Saídas
        </div>
        <DraggableItem type="led" label="LED" icon={<Lightbulb size={16} />} />

        <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 py-1 mt-2">
          Portas Lógicas
        </div>
        <DraggableItem type="not" label="NOT" icon={<Ban size={16} />} />
        <DraggableItem type="and" label="AND" icon={<GitMerge size={16} />} />
        <DraggableItem type="or" label="OR" icon={<GitFork size={16} />} />
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
