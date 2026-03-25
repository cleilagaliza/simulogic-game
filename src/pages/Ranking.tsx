import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RankEntry {
  display_name: string;
  total_score: number;
  avatar_url: string | null;
}

const Ranking = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('get_ranking' as any).then(({ data }: any) => {
      setEntries(data || []);
      setLoading(false);
    });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/menu')}>
            <ArrowLeft size={18} />
          </Button>
          <Trophy size={20} className="text-primary" />
          <h1 className="text-xl font-bold text-foreground">Ranking — Top 10</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum jogador no ranking ainda.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead className="text-right">Pontuação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {i < 3 ? medals[i] : i + 1}
                    </TableCell>
                    <TableCell>{entry.display_name}</TableCell>
                    <TableCell className="text-right font-mono">{entry.total_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
