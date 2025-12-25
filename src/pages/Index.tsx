import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SealTask</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="btn-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <ClipboardList className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bem-vindo ao <span className="text-primary">SealTask</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Sistema interno de gerenciamento de tarefas da Seal Store
          </p>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/login">
              <Button size="lg" className="btn-primary text-base px-8 w-full sm:w-auto">
                <LogIn className="h-5 w-5 mr-2" />
                Acessar Sistema
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="text-base px-8 w-full sm:w-auto">
                <UserPlus className="h-5 w-5 mr-2" />
                Primeiro Acesso
              </Button>
            </Link>
          </div>

          {/* Instruções rápidas */}
          <div className="bg-muted/50 rounded-xl p-6 text-left">
            <h2 className="font-semibold text-foreground mb-4 text-center">
              Como usar o SealTask
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
                <p><strong className="text-foreground">Primeiro acesso?</strong> Clique em "Primeiro Acesso" e cadastre-se com seu email corporativo, nome, setor e função.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
                <p><strong className="text-foreground">Gestores</strong> podem criar tarefas e atribuí-las para colaboradores específicos ou setores inteiros.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
                <p><strong className="text-foreground">Colaboradores</strong> visualizam suas tarefas, marcam itens do checklist e atualizam o status.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">4</span>
                <p><strong className="text-foreground">Acompanhe em tempo real</strong> o progresso de todas as tarefas no Dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SealTask - Seal Store</p>
        </div>
      </footer>
    </div>
  );
}
