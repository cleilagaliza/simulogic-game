import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PhaseType } from '@/game/levels';
import { Cpu, Table, Activity, Binary, Sigma } from 'lucide-react';

const STORAGE_PREFIX = 'tutorial_visto_';

type TutorialContent = {
  title: string;
  icon: JSX.Element;
  intro: string;
  rules: string[];
  tip?: string;
};

const TUTORIALS: Record<PhaseType, TutorialContent> = {
  circuit: {
    title: 'Montagem de Circuito',
    icon: <Cpu className="h-6 w-6 text-primary" />,
    intro:
      'Neste tipo de desafio, você monta um circuito lógico usando os componentes da barra lateral.',
    rules: [
      'Arraste os componentes (portas, entradas, saídas) para a área de trabalho.',
      'Conecte os pinos clicando e arrastando de uma saída até uma entrada.',
      'Clique nas entradas para alternar entre 0 e 1 e ver o circuito funcionar em tempo real.',
      'Pressione "Verificar" para testar se sua montagem atende a todos os casos de teste.',
    ],
    tip: 'Acerte de primeira para conquistar 3 estrelas!',
  },
  fill_table: {
    title: 'Tabela Verdade',
    icon: <Table className="h-6 w-6 text-primary" />,
    intro:
      'Preencha a tabela verdade com a saída correta para cada combinação de entradas.',
    rules: [
      'Cada linha representa uma combinação possível das entradas (A, B, ...).',
      'Clique nas células da coluna de saída para alternar entre 0 e 1.',
      'A tabela só é aceita quando TODAS as linhas estiverem corretas.',
    ],
    tip: 'Lembre-se da regra da porta lógica em estudo antes de marcar.',
  },
  waveform: {
    title: 'Forma de Onda',
    icon: <Activity className="h-6 w-6 text-primary" />,
    intro:
      'Analise o gráfico de tempo dos sinais de entrada e desenhe a forma de onda da saída.',
    rules: [
      'As linhas A e B mostram os sinais de entrada variando ao longo do tempo.',
      'Clique nos segmentos da linha de saída (S) para alternar entre nível alto (1) e baixo (0).',
      'A saída deve refletir a operação lógica em cada instante do tempo.',
    ],
    tip: 'Compare instante a instante: para cada coluna, aplique a regra da porta.',
  },
  bit_weight: {
    title: 'Peso de Bits (Binário)',
    icon: <Binary className="h-6 w-6 text-primary" />,
    intro:
      'Converta números entre binário e decimal usando o peso de cada bit (potências de 2).',
    rules: [
      'Cada posição binária tem um peso: 1, 2, 4, 8, 16... (2ⁿ).',
      'O bit mais à direita é o LSB (menos significativo); o mais à esquerda é o MSB.',
      'Some os pesos das posições marcadas como 1 para obter o valor decimal.',
    ],
    tip: 'Ex: 1011 = 8 + 0 + 2 + 1 = 11.',
  },
  formula_quiz: {
    title: 'Quiz de Fórmula Lógica',
    icon: <Sigma className="h-6 w-6 text-primary" />,
    intro:
      'Identifique a expressão booleana correta que representa o comportamento da porta.',
    rules: [
      'Leia as alternativas com atenção e selecione a fórmula correspondente.',
      'Cada erro conta no contador de tentativas e pode reduzir suas estrelas.',
    ],
    tip: 'Revise os símbolos: · (AND), + (OR), ¯ (NOT).',
  },
};

interface Props {
  phaseType: PhaseType;
}

const PhaseTutorial = ({ phaseType }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `${STORAGE_PREFIX}${phaseType}`;
    if (!localStorage.getItem(key)) {
      setOpen(true);
    }
  }, [phaseType]);

  const handleClose = () => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${phaseType}`, 'true');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const content = TUTORIALS[phaseType];
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {content.icon}
            <DialogTitle>{content.title}</DialogTitle>
          </div>
          <DialogDescription>{content.intro}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <ul className="list-disc pl-5 space-y-1 text-foreground">
            {content.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          {content.tip && (
            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
              💡 {content.tip}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Entendi, vamos jogar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseTutorial;
