import React from 'react';
import { TaskWithDetails, TaskStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, User, Users, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  task: TaskWithDetails | null;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Em Andamento', label: 'Em Andamento' },
  { value: 'Concluída', label: 'Concluída' },
];

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const { isManager } = useAuth();
  const { updateTaskStatus, toggleChecklistItem, deleteTask } = useTasks();

  if (!task) return null;

  const completedItems = task.checklist_items?.filter((item) => item.is_completed).length || 0;
  const totalItems = task.checklist_items?.length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTaskStatus(task.id, status);
    onUpdate();
  };

  const handleChecklistToggle = async (itemId: string, isCompleted: boolean) => {
    await toggleChecklistItem(itemId, isCompleted);
    onUpdate();
  };

  const handleDelete = async () => {
    const success = await deleteTask(task.id);
    if (success) {
      onClose();
      onUpdate();
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold">
              {task.title}
            </DialogTitle>
            <Select
              value={task.status}
              onValueChange={(value) => handleStatusChange(value as TaskStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Meta info */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Criada por: <span className="text-foreground">{task.creator?.full_name}</span></span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              {task.assigned_to_user_id ? (
                <>
                  <User className="h-4 w-4" />
                  <span>Atribuída para: <span className="text-foreground">{task.assignee?.full_name}</span></span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>Setor: <span className="text-foreground">{task.assigned_to_department}</span></span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Prazo: <span className="text-foreground">{format(new Date(task.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span></span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Criada em: <span className="text-foreground">{format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Progress */}
          {totalItems > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">Progresso</h4>
                <span className="text-sm text-muted-foreground">
                  {completedItems}/{totalItems} itens ({Math.round(progress)}%)
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-warning to-success rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist_items && task.checklist_items.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Checklist</h4>
              <div className="space-y-2">
                {task.checklist_items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={item.is_completed}
                      onCheckedChange={(checked) =>
                        handleChecklistToggle(item.id, checked as boolean)
                      }
                    />
                    <span
                      className={cn(
                        'text-sm transition-all',
                        item.is_completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {item.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>

            {isManager && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Tarefa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A tarefa será permanentemente excluída.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
