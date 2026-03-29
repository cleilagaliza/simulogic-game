import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  numInputs: number;
  onCorrect: () => void;
}

const FormulaQuiz = ({ numInputs, onCorrect }: Props) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const correctAnswer = Math.pow(2, numInputs);

  const handleSubmit = () => {
    const parsed = parseInt(answer, 10);
    if (parsed === correctAnswer) {
      onCorrect();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-8 bg-card border border-border rounded-xl max-w-sm mx-auto">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wide">
        Pergunta Rápida
      </h3>

      <div className="text-center space-y-2">
        <p className="text-sm text-foreground">
          Com <span className="font-bold text-primary">{numInputs}</span> entrada{numInputs > 1 ? 's' : ''}, quantas combinações
          possíveis existem na Tabela Verdade?
        </p>
        <p className="text-[10px] text-muted-foreground">
          Dica: pense na fórmula 2<sup>n</sup>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-24 h-10 text-center text-lg font-bold font-mono border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
          placeholder="?"
          min={1}
        />
        <Button size="sm" onClick={handleSubmit} disabled={!answer}>
          <CheckCircle2 size={14} /> Confirmar
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-destructive text-xs font-medium animate-pulse">
          <XCircle size={14} />
          <span>Resposta incorreta. Tente novamente!</span>
        </div>
      )}
    </div>
  );
};

export default FormulaQuiz;
