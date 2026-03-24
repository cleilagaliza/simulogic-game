import CircuitSidebar from '@/circuit/CircuitSidebar';
import CircuitCanvas from '@/circuit/CircuitCanvas';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <CircuitSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end gap-2 px-3 py-1.5 border-b border-border bg-card">
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          <button
            onClick={signOut}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Sair"
          >
            <LogOut size={14} className="text-muted-foreground" />
          </button>
        </div>
        <CircuitCanvas />
      </div>
    </div>
  );
};

export default Index;
