import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Play, Map, Wrench, Trophy, LogOut } from 'lucide-react';
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

const menuItems = [
  {
    id: 'new',
    icon: Play,
    title: 'Novo Jogo',
    desc: 'Comece do nível 0',
    needsConfirm: true,
  },
  {
    id: 'continue',
    icon: Map,
    title: 'Continuar',
    desc: 'Mapa de níveis',
    needsConfirm: false,
  },
  {
    id: 'sandbox',
    icon: Wrench,
    title: 'Modo Livre',
    desc: 'Sandbox sem restrições',
    needsConfirm: false,
  },
  {
    id: 'ranking',
    icon: Trophy,
    title: 'Ranking',
    desc: 'Top 10 jogadores',
    needsConfirm: false,
  },
];

const Menu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

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
    navigate('/game/0');
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'continue': navigate('/levels'); break;
      case 'sandbox': navigate('/sandbox'); break;
      case 'ranking': navigate('/ranking'); break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">⚡ Logic Simulator</h1>
          <p className="text-sm text-muted-foreground">Aprenda circuitos lógicos jogando</p>
        </div>

        <div className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;

            if (item.needsConfirm) {
              return (
                <AlertDialog key={item.id}>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
                    >
                      <Icon size={20} className="text-primary shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </button>
                  </AlertDialogTrigger>
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
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <Icon size={20} className="text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
