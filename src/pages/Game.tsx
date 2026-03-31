import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CircuitCanvas, { type CircuitCanvasRef } from '@/circuit/CircuitCanvas';
import CircuitSidebar from '@/circuit/CircuitSidebar';
import { levels, type LevelPhase } from '@/game/levels';
import { verifyCircuit, type VerifyResult } from '@/game/verifyCircuit';
import TruthTableGrid, { type TruthTableGridRef } from '@/game/TruthTableGrid';
import WaveformChallenge, { type WaveformChallengeRef } from '@/game/WaveformChallenge';
import BitWeightChallenge, { type BitWeightChallengeRef } from '@/game/BitWeightChallenge';
import FormulaQuiz from '@/game/FormulaQuiz';
import { CheckCircle2, XCircle, ArrowLeft, Star, ArrowRight, Trophy, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Game = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const canvasRef = useRef<CircuitCanvasRef>(null);
  const tableRef = useRef<TruthTableGridRef>(null);
  const waveformRef = useRef<WaveformChallengeRef>(null);
  const bitWeightRef = useRef<BitWeightChallengeRef>(null);

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [phaseResults, setPhaseResults] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const level = levels.find(l => l.id === Number(levelId));

  useEffect(() => {
    setResult(null);
    setShowModal(false);
    setIsTraining(false);
    setCurrentPhaseIdx(0);
    setPhaseResults({});
  }, [levelId]);

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

  const phases = level.phases;
  const currentPhase = phases[currentPhaseIdx];
  const isLastPhase = currentPhaseIdx === phases.length - 1;
  const allPhasesComplete = phases.every((_, i) => phaseResults[i]);

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

  const handleVerifyPhase = async () => {
    let ok = false;

    if (currentPhase.type === 'circuit' && canvasRef.current) {
      const { nodes, edges } = canvasRef.current.getState();
      const res = verifyCircuit(nodes, edges, currentPhase.testCases || []);
      ok = res.success;
      if (!ok) {
        setResult(res);
        return;
      }
    }

    if (currentPhase.type === 'fill_table' && tableRef.current) {
      ok = tableRef.current.verify();
      if (!ok) {
        toast.error('Tabela Verdade incorreta. Tente novamente!');
        return;
      }
    }

    if (currentPhase.type === 'waveform' && waveformRef.current) {
      ok = waveformRef.current.verify();
      if (!ok) {
        toast.error('Forma de onda incorreta. Tente novamente!');
        return;
      }
    }

    if (currentPhase.type === 'bit_weight' && bitWeightRef.current) {
      ok = bitWeightRef.current.verify();
      if (!ok) {
        toast.error('Conversão incorreta. Tente novamente!');
        return;
      }
    }

    if (currentPhase.type === 'formula_quiz') {
      // Quiz handles its own validation via onCorrect callback
      return;
    }

    // Phase passed
    ok = true;
    const newResults = { ...phaseResults, [currentPhaseIdx]: true };
    setPhaseResults(newResults);
    setResult(null);

    if (isLastPhase) {
      // All phases complete
      const finalResult: VerifyResult = { passed: 1, total: 1, score: 100, stars: 3, success: true };
      setResult(finalResult);
      if (!isTraining) await saveScore(finalResult);
      setShowModal(true);
    } else {
      toast.success(`${currentPhase.label} concluído! Avançando...`);
      setCurrentPhaseIdx(prev => prev + 1);
    }
  };

  const handleQuizCorrect = () => {
    const newResults = { ...phaseResults, [currentPhaseIdx]: true };
    setPhaseResults(newResults);
    toast.success('Quiz correto! Avançando...');
    setCurrentPhaseIdx(prev => prev + 1);
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

  // Current phase is a quiz — render quiz screen
  if (currentPhase.type === 'formula_quiz' && currentPhase.formulaQuiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar level={level} isTraining={isTraining} navigate={navigate} currentPhaseIdx={currentPhaseIdx} phases={phases} />
        <div className="flex-1 flex items-center justify-center p-4">
          <FormulaQuiz
            numInputs={currentPhase.formulaQuiz.numInputs}
            onCorrect={handleQuizCorrect}
          />
        </div>
      </div>
    );
  }

  const hasCircuit = currentPhase.type === 'circuit';
  const hasFillTable = currentPhase.type === 'fill_table';
  const hasWaveform = currentPhase.type === 'waveform';
  const hasBitWeight = currentPhase.type === 'bit_weight';

  const sidebarContent = hasCircuit ? (
    <CircuitSidebar availableComponents={currentPhase.availableComponents} />
  ) : null;

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background">
      {/* Top bar */}
      <TopBar level={level} isTraining={isTraining} navigate={navigate} currentPhaseIdx={currentPhaseIdx} phases={phases}>
        {hasCircuit && isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        )}
        <Button size="sm" onClick={handleVerifyPhase} className="shrink-0">
          <CheckCircle2 size={14} /> Verificar
        </Button>
      </TopBar>

      {/* Error feedback */}
      {result && !result.success && (
        <div className="px-3 py-2 border-b border-border bg-card flex items-center gap-2 flex-wrap">
          <XCircle size={16} className="text-destructive" />
          <span className="text-xs font-medium text-foreground">Tente novamente</span>
          <span className="text-[10px] text-muted-foreground">
            {result.passed}/{result.total} testes • {result.score} pts
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop sidebar */}
        {hasCircuit && !isMobile && sidebarContent}

        {/* Circuit canvas */}
        {hasCircuit && (
          <div className="flex-1 min-w-0 min-h-0">
            <CircuitCanvas ref={canvasRef} />
          </div>
        )}

        {/* Fill table */}
        {hasFillTable && currentPhase.truthTable && (
          <div className="flex-1 flex items-center justify-center p-3 overflow-auto">
            <div className="w-full max-w-lg">
              <TruthTableGrid
                key={`${levelId}-${currentPhaseIdx}`}
                ref={tableRef}
                challenge={currentPhase.truthTable}
                mode="fill_table"
                disabled={false}
              />
            </div>
          </div>
        )}

        {/* Waveform */}
        {hasWaveform && currentPhase.waveform && (
          <div className="flex-1 flex items-center justify-center p-3 overflow-auto">
            <WaveformChallenge
              key={`${levelId}-${currentPhaseIdx}`}
              ref={waveformRef}
              challenge={currentPhase.waveform}
              disabled={false}
            />
          </div>
        )}

        {/* Bit weight */}
        {hasBitWeight && currentPhase.bitWeight && (
          <div className="flex-1 flex items-center justify-center p-3 overflow-auto">
            <BitWeightChallenge
              key={`${levelId}-${currentPhaseIdx}`}
              ref={bitWeightRef}
              challenge={currentPhase.bitWeight}
              disabled={false}
            />
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <Trophy className="h-10 w-10 text-primary mb-2" />
            <DialogTitle className="text-lg">Nível Concluído!</DialogTitle>
            <DialogDescription>
              {isTraining ? 'Modo Treino — pontuação não salva.' : 'Pontuação salva automaticamente.'}
            </DialogDescription>
          </DialogHeader>
          {result && (
            <div className="flex flex-col items-center gap-2 py-3">
              <span className="text-2xl font-bold text-foreground">{result.score} pts</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <Star key={s} size={20} className={s <= result.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'} />
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="flex-row gap-2 sm:justify-center">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); navigate('/levels'); }}>
              Voltar
            </Button>
            <Button size="sm" onClick={handleNext}>
              Próximo <ArrowRight size={14} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Top bar component
function TopBar({
  level,
  isTraining,
  navigate,
  currentPhaseIdx,
  phases,
  children,
}: {
  level: { id: number; title: string; objective: string };
  isTraining: boolean;
  navigate: (path: string) => void;
  currentPhaseIdx: number;
  phases: LevelPhase[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border bg-card shrink-0">
      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate('/levels')}>
        <ArrowLeft size={14} />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-primary">Nv.{level.id}</span>
          <span className="text-[10px] text-foreground font-medium truncate">{level.title}</span>
          {isTraining && (
            <span className="text-[8px] font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded">TREINO</span>
          )}
        </div>
        {/* Phase indicators */}
        {phases.length > 1 && (
          <div className="flex items-center gap-1 mt-0.5">
            {phases.map((p, i) => (
              <span
                key={i}
                className={cn(
                  'text-[8px] px-1.5 py-0.5 rounded-full font-medium',
                  i === currentPhaseIdx
                    ? 'bg-primary text-primary-foreground'
                    : i < currentPhaseIdx
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default Game;
