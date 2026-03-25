import { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CircuitCanvas, { type CircuitCanvasRef } from '@/circuit/CircuitCanvas';
import CircuitSidebar from '@/circuit/CircuitSidebar';
import { levels } from '@/game/levels';
import { verifyCircuit, type VerifyResult } from '@/game/verifyCircuit';
import { CheckCircle2, XCircle, ArrowLeft, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Game = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<CircuitCanvasRef>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
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

  const handleVerify = () => {
    if (!canvasRef.current) return;
    const { nodes, edges } = canvasRef.current.getState();
    const res = verifyCircuit(nodes, edges, level.testCases);
    setResult(res);
  };

  const handleSaveScore = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      await (supabase as any).from('user_progress').upsert(
        {
          user_id: user.id,
          level_number: level.id,
          score: result.score,
          stars: result.stars,
          completed: result.success,
          completed_at: result.success ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,level_number' }
      );

      // Recalculate total score
      const { data: allProg } = await (supabase as any)
        .from('user_progress')
        .select('score')
        .eq('user_id', user.id);

      const totalScore = (allProg || []).reduce((sum: number, p: any) => sum + p.score, 0);
      await (supabase as any).from('profiles').update({ total_score: totalScore }).eq('user_id', user.id);

      toast.success('Pontuação salva!');
    } catch {
      toast.error('Erro ao salvar pontuação.');
    }
    setSaving(false);
  };

  const handleNext = () => {
    const nextLevel = level.id + 1;
    if (nextLevel < levels.length) {
      setResult(null);
      navigate(`/game/${nextLevel}`);
    } else {
      toast.success('Parabéns! Você completou todos os níveis!');
      navigate('/levels');
    }
  };

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

        {/* Result overlay */}
        {result && (
          <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
            {result.success ? (
              <CheckCircle2 size={20} className="text-primary" />
            ) : (
              <XCircle size={20} className="text-destructive" />
            )}
            <span className="text-sm font-medium text-foreground">
              {result.success ? 'Aprovado!' : 'Tente novamente'}
            </span>
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
            <div className="flex gap-2 ml-auto">
              {!isTraining && (
                <Button size="sm" variant="outline" onClick={handleSaveScore} disabled={saving}>
                  Salvar Pontuação
                </Button>
              )}
              {result.success && (
                <Button size="sm" onClick={handleNext}>
                  Próximo <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        )}

        <CircuitCanvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Game;
