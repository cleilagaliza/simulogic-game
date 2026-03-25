import { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CircuitCanvas, { type CircuitCanvasRef } from '@/circuit/CircuitCanvas';
import CircuitSidebar from '@/circuit/CircuitSidebar';
import { levels } from '@/game/levels';
import { verifyCircuit, type VerifyResult } from '@/game/verifyCircuit';
import { CheckCircle2, XCircle, ArrowLeft, Star, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Game = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<CircuitCanvasRef>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const level = levels.find(l => l.id === Number(levelId));

  useEffect(() => {
    if (!user || !level) return;
    (supabase as any)
      .from('user_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('level_number', level.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.completed) setIsTraining(true);
      });
  }, [user, level]);

  if (!level) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Nível não encontrado.</p>
      </div>
    );
  }

  const saveScore = async (res: VerifyResult) => {
    if (!user) return;
    setSaving(true);
    try {
      await (supabase as any).from('user_progress').upsert(
        {
          user_id: user.id,
          level_number: level.id,
          score: res.score,
          stars: res.stars,
          completed: res.success,
          completed_at: res.success ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,level_number' }
      );

      const { data: allProg } = await (supabase as any)
        .from('user_progress')
        .select('score')
        .eq('user_id', user.id);

      const totalScore = (allProg || []).reduce((sum: number, p: any) => sum + p.score, 0);
      await (supabase as any).from('profiles').update({ total_score: totalScore }).eq('user_id', user.id);
    } catch {
      toast.error('Erro ao salvar pontuação.');
    }
    setSaving(false);
  };

  const handleVerify = async () => {
    if (!canvasRef.current) return;
    const { nodes, edges } = canvasRef.current.getState();
    const res = verifyCircuit(nodes, edges, level.testCases);
    setResult(res);

    if (!isTraining) {
      await saveScore(res);
    }

    if (res.success) {
      setShowModal(true);
    }
  };

  const handleNext = () => {
    const nextLevel = level.id + 1;
    setShowModal(false);
    setResult(null);
    if (nextLevel < levels.length) {
      navigate(`/game/${nextLevel}`);
    } else {
      toast.success('Parabéns! Você completou todos os níveis!');
      navigate('/levels');
    }
  };

  const canAdvance = result && result.success && (result.score / 100) > 0.9;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <CircuitSidebar availableComponents={level.availableComponents} />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => navigate('/levels')} title="Voltar ao Menu">
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">Nível {level.id}</span>
              <span className="text-xs text-foreground font-medium">{level.title}</span>
              {isTraining && (
                <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  TREINO
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{level.objective}</p>
          </div>
          <Button size="sm" onClick={handleVerify}>
            <CheckCircle2 size={14} /> Verificar
          </Button>
        </div>

        {/* Inline result feedback (non-success) */}
        {result && !result.success && (
          <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
            <XCircle size={20} className="text-destructive" />
            <span className="text-sm font-medium text-foreground">Tente novamente</span>
            <span className="text-xs text-muted-foreground">
              {result.passed}/{result.total} testes • {result.score} pts
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(s => (
                <Star
                  key={s}
                  size={14}
                  className={s <= result.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}
                />
              ))}
            </div>
          </div>
        )}

        <CircuitCanvas ref={canvasRef} />
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <Trophy className="h-12 w-12 text-primary mb-2" />
            <DialogTitle className="text-xl">Nível Concluído!</DialogTitle>
            <DialogDescription>
              {isTraining ? 'Modo Treino — pontuação não salva.' : 'Pontuação salva automaticamente.'}
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-3xl font-bold text-foreground">{result.score} pts</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    size={24}
                    className={s <= result.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {result.passed}/{result.total} testes aprovados
              </span>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => { setShowModal(false); navigate('/levels'); }}>
              Voltar ao Menu
            </Button>
            <Button onClick={handleNext} disabled={!canAdvance}>
              Próximo Nível <ArrowRight size={14} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
