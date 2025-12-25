import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { ClipboardList } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <ClipboardList className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">SealTask</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Entre na sua conta para continuar
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            Gerencie suas tarefas com eficiência
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            O SealTask ajuda você e sua equipe a organizar e acompanhar todas as tarefas da empresa em um único lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
