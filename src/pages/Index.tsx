import CircuitSidebar from '@/circuit/CircuitSidebar';
import CircuitCanvas from '@/circuit/CircuitCanvas';

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <CircuitSidebar />
      <CircuitCanvas />
    </div>
  );
};

export default Index;
