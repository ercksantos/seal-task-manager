import React from 'react';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  inProgress: number;
  completed: number;
}

export function StatsCards({ total, inProgress, completed }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="stat-card stat-card-blue animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Minhas Tarefas
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">{total}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-card-yellow animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Em Andamento
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">{inProgress}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
            <Clock className="h-6 w-6 text-warning" />
          </div>
        </div>
      </div>

      <div className="stat-card stat-card-green animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Concluídas
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">{completed}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>
    </div>
  );
}
