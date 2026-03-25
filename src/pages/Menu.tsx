import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Map, Cpu, BookOpen, Trophy, LogOut, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Menu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  const handleNewGame = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await (supabase as any).from('user_progress').delete().eq('user_id', user.id);
      await (supabase as any).from('profiles').update({ total_score: 0 }).eq('user_id', user.id);
    } catch {
      // ignore errors on fresh accounts
    }
    setLoading(false);
    setShowNewGameConfirm(false);
    navigate('/game/0');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">⚡ Logic Simulator</h1>
          <p className="text-sm text-muted-foreground">Aprenda circuitos lógicos jogando</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {/* JOGAR — primary CTA */}
          <button
            onClick={() => navigate('/levels')}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground shrink-0">
              <Play size={20} />
            </div>
            <div>
              <div className="text-base font-semibold text-primary">Jogar</div>
              <div className="text-xs text-muted-foreground">Mapa de níveis</div>
            </div>
          </button>

          {/* Simulador Virtual */}
          <button
            onClick={() => navigate('/sandbox')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <Cpu size={20} className="text-primary shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground">Simulador Virtual</div>
              <div className="text-xs text-muted-foreground">Sandbox sem restrições</div>
            </div>
          </button>

          {/* Enciclopédia Lógica */}
          <button
            onClick={() => navigate('/encyclopedia')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <BookOpen size={20} className="text-primary shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground">Enciclopédia Lógica</div>
              <div className="text-xs text-muted-foreground">Revisão teórica e tabelas verdade</div>
            </div>
          </button>

          {/* Ranking */}
          <button
            onClick={() => navigate('/ranking')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
          >
            <Trophy size={20} className="text-primary shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground">Ranking</div>
              <div className="text-xs text-muted-foreground">Top 10 jogadores</div>
            </div>
          </button>
        </div>

        {/* Footer: settings + user info + logout */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Settings dropdown with "Novo Jogo" */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                disabled={loading}
                onSelect={(e) => {
                  e.preventDefault();
                  setShowNewGameConfirm(true);
                }}
              >
                <Play size={14} className="mr-2" />
                Novo Jogo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-xs text-muted-foreground truncate mx-2">{user?.email}</span>

          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </div>

      {/* New Game confirmation dialog */}
      <AlertDialog open={showNewGameConfirm} onOpenChange={setShowNewGameConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar Novo Jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todo o seu progresso atual será apagado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewGame}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Menu;
