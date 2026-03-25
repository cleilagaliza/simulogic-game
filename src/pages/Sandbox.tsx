import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CircuitCanvas, { type CircuitCanvasRef } from '@/circuit/CircuitCanvas';
import CircuitSidebar from '@/circuit/CircuitSidebar';
import { ArrowLeft, Save, FolderOpen, FilePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SavedProject {
  id: string;
  name: string;
  circuit_data: any;
  updated_at: string;
}

const Sandbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<CircuitCanvasRef>(null);
  const [projectName, setProjectName] = useState('Sem título');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showLoad, setShowLoad] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    const { data } = await (supabase as any)
      .from('saved_projects')
      .select('id, name, circuit_data, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setProjects(data || []);
    setLoadingProjects(false);
  };

  const handleSave = async () => {
    if (!user || !canvasRef.current) return;
    const { nodes, edges } = canvasRef.current.getState();
    const circuitData = { nodes, edges };

    const name = prompt('Nome do projeto:', projectName);
    if (!name) return;

    try {
      if (currentProjectId) {
        await (supabase as any)
          .from('saved_projects')
          .update({ name, circuit_data: circuitData })
          .eq('id', currentProjectId);
      } else {
        const { data } = await (supabase as any)
          .from('saved_projects')
          .insert({ user_id: user.id, name, circuit_data: circuitData })
          .select('id')
          .single();
        if (data) setCurrentProjectId(data.id);
      }
      setProjectName(name);
      toast.success('Projeto salvo!');
    } catch {
      toast.error('Erro ao salvar.');
    }
  };

  const handleLoad = async (project: SavedProject) => {
    if (!canvasRef.current) return;
    const { nodes, edges } = project.circuit_data;
    canvasRef.current.loadState(nodes, edges);
    setProjectName(project.name);
    setCurrentProjectId(project.id);
    setShowLoad(false);
    toast.success(`Projeto "${project.name}" carregado.`);
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from('saved_projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setProjectName('Sem título');
    }
    toast.success('Projeto excluído.');
  };

  const handleNew = () => {
    if (!canvasRef.current) return;
    canvasRef.current.loadState([], []);
    setProjectName('Sem título');
    setCurrentProjectId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <CircuitSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => navigate('/menu')} title="Voltar ao Menu">
            <ArrowLeft size={16} />
          </Button>
          <span className="text-sm font-medium text-foreground truncate flex-1">{projectName}</span>
          <Button variant="ghost" size="sm" onClick={handleNew} title="Novo">
            <FilePlus size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} title="Salvar">
            <Save size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowLoad(true); fetchProjects(); }}
            title="Carregar"
          >
            <FolderOpen size={14} />
          </Button>
        </div>

        <CircuitCanvas ref={canvasRef} />

        <Dialog open={showLoad} onOpenChange={setShowLoad}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Carregar Projeto</DialogTitle>
            </DialogHeader>
            {loadingProjects ? (
              <p className="text-sm text-muted-foreground py-4">Carregando...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhum projeto salvo.</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {projects.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent cursor-pointer group"
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => handleLoad(p)}
                    >
                      <div className="text-sm font-medium text-foreground">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(p.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Sandbox;
