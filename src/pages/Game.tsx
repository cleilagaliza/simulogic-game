import { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CircuitCanvas, { type CircuitCanvasRef } from '@/circuit/CircuitCanvas';
import CircuitSidebar from '@/circuit/CircuitSidebar';
import { levels } from '@/game/levels';
import { verifyCircuit, type VerifyResult } from '@/game/verifyCircuit';
import TruthTableGrid, { type TruthTableGridRef } from '@/game/TruthTableGrid';
import WaveformChallenge, { type WaveformChallengeRef } from '@/game/WaveformChallenge';
import BitWeightChallenge, { type BitWeightChallengeRef } from '@/game/BitWeightChallenge';
import FormulaQuiz from '@/game/FormulaQuiz';
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
  const tableRef = useRef<TruthTableGridRef>(null);
  const waveformRef = useRef<WaveformChallengeRef>(null);
  const bitWeightRef = useRef<BitWeightChallengeRef>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tableError, setTableError] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const level = levels.find(l => l.id === Number(levelId));

  useEffect(() => {
    setResult(null);
    setTableError(false);
    setShowModal(false);
    setIsTraining(false);
    setQuizPassed(false);
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

  // Show formula quiz gate before starting
  const needsQuiz = !!level.formulaQuiz && !quizPassed;

  const isFillOnly = level.challengeType === 'fill_table';
  const isWaveform = level.challengeType === 'waveform';
  const isBitWeight = level.challengeType === 'bit_weight';
  const hasTable = level.challengeType === 'fill_table' || level.challengeType === 'interpret_table';
  const hasCircuit = level.challengeType === 'circuit' || level.challengeType === 'interpret_table';

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
    let circuitOk = true;
    let tableOk = true;
    let circuitResult: VerifyResult | null = null;

    // Verify circuit if needed
    if (hasCircuit && canvasRef.current) {
      const { nodes, edges } = canvasRef.current.getState();
      circuitResult = verifyCircuit(nodes, edges, level.testCases);
      circuitOk = circuitResult.success;
    }

    // Verify truth table if needed
    if (hasTable && tableRef.current) {
      tableOk = tableRef.current.verify();
    }

    // Verify waveform
    if (isWaveform && waveformRef.current) {
      const ok = waveformRef.current.verify();
      const finalResult: VerifyResult = ok
        ? { passed: 1, total: 1, score: 100, stars: 3, success: true }
        : { passed: 0, total: 1, score: 0, stars: 0, success: false };
      setResult(finalResult);
      if (!isTraining) await saveScore(finalResult);
      if (finalResult.success) setShowModal(true);
      return;
    }

    // Verify bit weight
    if (isBitWeight && bitWeightRef.current) {
      const ok = bitWeightRef.current.verify();
      const finalResult: VerifyResult = ok
        ? { passed: 1, total: 1, score: 100, stars: 3, success: true }
        : { passed: 0, total: 1, score: 0, stars: 0, success: false };
      setResult(finalResult);
      if (!isTraining) await saveScore(finalResult);
      if (finalResult.success) setShowModal(true);
      return;
    }

    setTableError(!tableOk);

    // Build final result
    let finalResult: VerifyResult;
    if (isFillOnly) {
      finalResult = tableOk
        ? { passed: 1, total: 1, score: 100, stars: 3, success: true }
        : { passed: 0, total: 1, score: 0, stars: 0, success: false };
    } else if (level.challengeType === 'interpret_table') {
      const bothOk = circuitOk && tableOk;
      if (circuitResult) {
        finalResult = {
          ...circuitResult,
          success: bothOk,
          score: bothOk ? circuitResult.score : Math.min(circuitResult.score, 50),
          stars: bothOk ? circuitResult.stars : 0,
        };
      } else {
        finalResult = { passed: 0, total: 1, score: 0, stars: 0, success: false };
      }
    } else {
      finalResult = circuitResult || { passed: 0, total: 1, score: 0, stars: 0, success: false };
    }

    setResult(finalResult);

    if (!isTraining) {
      await saveScore(finalResult);
    }

    if (finalResult.success) {
      setShowModal(true);
    }
  };

  const handleNext = () => {
    const nextLevel = level.id + 1;
    setShowModal(false);
    setResult(null);
    setTableError(false);
    if (nextLevel < levels.length) {
      navigate(`/game/${nextLevel}`);
    } else {
      toast.success('Parabéns! Você completou todos os níveis!');
      navigate('/levels');
    }
  };

  const canAdvance = result && result.success;

  // Show formula quiz gate
  if (needsQuiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => navigate('/levels')} title="Voltar ao Menu">
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-primary">Nível {level.id}</span>
            <span className="text-xs text-foreground font-medium ml-2">{level.title}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <FormulaQuiz
            numInputs={level.formulaQuiz!.numInputs}
            onCorrect={() => setQuizPassed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {hasCircuit && <CircuitSidebar availableComponents={level.availableComponents} />}
      <div className="flex-1 flex flex-col min-w-0">
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
            {!isFillOnly && !isWaveform && !isBitWeight && (
              <span className="text-xs text-muted-foreground">
                {result.passed}/{result.total} testes • {result.score} pts
              </span>
            )}
            {tableError && hasTable && (
              <span className="text-xs text-destructive">Tabela Verdade incorreta</span>
            )}
            <div className="flex gap-0.5">
              {[1, 2, 3].map(s => (
                <Star
                  key={s}
                  size={14}
                  className={s <= (result?.stars ?? 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Waveform challenge */}
          {isWaveform && level.waveform && (
            <div className="flex-1 flex items-center justify-center p-6">
              <WaveformChallenge
                key={levelId}
                ref={waveformRef}
                challenge={level.waveform}
                disabled={!!(result && result.success)}
              />
            </div>
          )}

          {/* Bit weight challenge */}
          {isBitWeight && level.bitWeight && (
            <div className="flex-1 flex items-center justify-center p-6">
              <BitWeightChallenge
                key={levelId}
                ref={bitWeightRef}
                challenge={level.bitWeight}
                disabled={!!(result && result.success)}
              />
            </div>
          )}

          {/* Circuit canvas */}
          {hasCircuit && (
            <div className={hasTable ? 'flex-1 min-w-0' : 'flex-1'}>
              <CircuitCanvas ref={canvasRef} />
            </div>
          )}

          {/* Truth table */}
          {hasTable && level.truthTable && (
            <div className={hasCircuit ? 'w-72 border-l border-border overflow-auto p-2' : 'flex-1 flex items-center justify-center p-6'}>
              <div className={hasCircuit ? '' : 'w-full max-w-lg'}>
                <TruthTableGrid
                  key={levelId}
                  ref={tableRef}
                  challenge={level.truthTable}
                  mode={level.challengeType as 'fill_table' | 'interpret_table'}
                  disabled={!!(result && result.success)}
                />
              </div>
            </div>
          )}
        </div>
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
                {isFillOnly ? 'Tabela Verdade completa!' :
                 isWaveform ? 'Forma de onda correta!' :
                 isBitWeight ? 'Conversão correta!' :
                 `${result.passed}/${result.total} testes aprovados`}
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
