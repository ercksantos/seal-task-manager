import React from 'react';
import { TaskWithDetails, TaskStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, User, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: TaskWithDetails;
  onOpen: (task: TaskWithDetails) => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  'Pendente': { label: 'Pendente', className: 'status-badge status-pending' },
  'Em Andamento': { label: 'Em Andamento', className: 'status-badge status-in-progress' },
  'Concluída': { label: 'Concluída', className: 'status-badge status-completed' },
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { user, profile } = useAuth();
  
  const isAssignedToMe = task.assigned_to_user_id === user?.id;
  const isMyDepartment = task.assigned_to_department === profile?.department;
  
  const completedItems = task.checklist_items?.filter((item) => item.is_completed).length || 0;
  const totalItems = task.checklist_items?.length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate < new Date() && task.status !== 'Concluída';

  return (
    <div className="card-elevated p-5 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <span className={statusConfig[task.status].className}>
          {statusConfig[task.status].label}
        </span>
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progresso</span>
            <span>{completedItems}/{totalItems} itens ({Math.round(progress)}%)</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className={cn(
          "flex items-center gap-1",
          isOverdue && "text-destructive"
        )}>
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {format(deadlineDate, "dd 'de' MMM", { locale: ptBR })}
          </span>
        </div>

        {isAssignedToMe ? (
          <Badge variant="secondary" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Atribuída a mim
          </Badge>
        ) : isMyDepartment ? (
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Setor: {task.assigned_to_department}
          </Badge>
        ) : task.assignee ? (
          <Badge variant="outline" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            {task.assignee.full_name}
          </Badge>
        ) : task.assigned_to_department ? (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {task.assigned_to_department}
          </Badge>
        ) : null}
      </div>

      {/* Action */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5"
          onClick={() => onOpen(task)}
        >
          Abrir tarefa
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
