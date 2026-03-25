import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { levels } from '@/game/levels';
import { Lock, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressEntry {
  level_number: number;
  score: number;
  stars: number;
  completed: boolean;
}

const LevelMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from('user_progress')
      .select('level_number, score, stars, completed')
      .eq('user_id', user.id)
      .then(({ data }: any) => {
        setProgress(data || []);
        setLoading(false);
      });
  }, [user]);

  const getProgress = (levelId: number): ProgressEntry | undefined =>
    progress.find(p => p.level_number === levelId);

  const isUnlocked = (levelId: number): boolean => {
    if (levelId === 0) return true;
    const prev = getProgress(levelId - 1);
    return !!prev && prev.score >= 90;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/menu')}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Mapa de Níveis</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {levels.map(level => {
            const prog = getProgress(level.id);
            const unlocked = isUnlocked(level.id);
            const stars = prog?.stars || 0;
            const isTraining = prog?.completed;

            return (
              <button
                key={level.id}
                disabled={!unlocked}
                onClick={() => navigate(`/game/${level.id}`)}
                className={`relative p-4 rounded-lg border text-left transition-colors ${
                  unlocked
                    ? 'bg-card border-border hover:bg-accent cursor-pointer'
                    : 'bg-muted/30 border-border/50 cursor-not-allowed opacity-60'
                }`}
              >
                {!unlocked && (
                  <Lock size={14} className="absolute top-2 right-2 text-muted-foreground" />
                )}
                {isTraining && (
                  <span className="absolute top-2 right-2 text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    TREINO
                  </span>
                )}

                <div className="text-xs text-muted-foreground mb-1">Nível {level.id}</div>
                <div className="text-sm font-medium text-foreground mb-1">{level.title}</div>
                <div className="text-xs text-muted-foreground mb-2">{level.description}</div>

                {unlocked && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}
                      />
                    ))}
                  </div>
                )}

                {prog && <div className="text-[10px] text-muted-foreground mt-1">{prog.score} pts</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
