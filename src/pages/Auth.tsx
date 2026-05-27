import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Conta criada! Verifique seu email para confirmar.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Link de recuperação enviado! Verifique seu email.');
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    mode === 'login'
      ? 'Entre na sua conta'
      : mode === 'signup'
      ? 'Crie sua conta'
      : 'Recuperar senha';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto p-8 rounded-xl border border-border bg-card shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground">⚡ Logic Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <Input
              placeholder="Nome de exibição"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode !== 'forgot' && (
            <>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary hover:underline font-medium self-end -mt-2"
                >
                  Esqueceu sua senha?
                </button>
              )}
            </>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Carregando...'
              : mode === 'login'
              ? 'Entrar'
              : mode === 'signup'
              ? 'Criar conta'
              : 'Enviar link de recuperação'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === 'forgot' ? (
            <>
              Lembrou sua senha?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </button>
            </>
          ) : mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
