import React, { useState, useRef, useEffect } from 'react';
import { TaskWithDetails, TaskStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import {
    Calendar,
    User,
    Users,
    Clock,
    Trash2,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpandableTaskCardProps {
    task: TaskWithDetails;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string; bgClass: string }> = {
    'Pendente': {
        label: 'Pendente',
        className: 'status-badge status-pending',
        bgClass: 'bg-muted/50'
    },
    'Em Andamento': {
        label: 'Em Andamento',
        className: 'status-badge status-in-progress',
        bgClass: 'bg-warning/5'
    },
    'Concluída': {
        label: 'Concluída',
        className: 'status-badge status-completed',
        bgClass: 'bg-success/5'
    },
};

const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Concluída', label: 'Concluída' },
];

export function ExpandableTaskCard({ task, isExpanded, onToggle, onUpdate }: ExpandableTaskCardProps) {
    const { user, profile, isManager } = useAuth();
    const { updateTaskStatus, toggleChecklistItem, deleteTask } = useTasks();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAssignedToMe = task.assigned_to_user_id === user?.id;
    const isMyDepartment = task.assigned_to_department === profile?.department;

    const completedItems = task.checklist_items?.filter((item) => item.is_completed).length || 0;
    const totalItems = task.checklist_items?.length || 0;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const deadlineDate = new Date(task.deadline);
    const isOverdue = deadlineDate < new Date() && task.status !== 'Concluída';

    // Scroll para o card quando expandir
    useEffect(() => {
        if (isExpanded && cardRef.current) {
            setTimeout(() => {
                cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isExpanded]);

    const handleStatusChange = async (status: TaskStatus) => {
        await updateTaskStatus(task.id, status);
        onUpdate();
    };

    const handleChecklistToggle = async (itemId: string, isCompleted: boolean) => {
        await toggleChecklistItem(itemId, isCompleted);
        onUpdate();
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const success = await deleteTask(task.id);
        if (success) {
            onUpdate();
        }
        setIsDeleting(false);
    };

    return (
        <div
            ref={cardRef}
            className={cn(
                'rounded-xl border border-border bg-card transition-all duration-500 ease-in-out overflow-hidden',
                isExpanded
                    ? 'shadow-xl ring-2 ring-primary/20'
                    : 'shadow-sm hover:shadow-md',
                statusConfig[task.status].bgClass
            )}
        >
            {/* Cabeçalho do Card - sempre visível */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h3 className={cn(
                                'font-semibold text-foreground',
                                !isExpanded && 'truncate'
                            )}>
                                {task.title}
                            </h3>
                            {isExpanded && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {task.description && (
                            <p className={cn(
                                'mt-1 text-sm text-muted-foreground',
                                !isExpanded && 'line-clamp-2'
                            )}>
                                {task.description}
                            </p>
                        )}
                    </div>
                    <span className={statusConfig[task.status].className}>
                        {statusConfig[task.status].label}
                    </span>
                </div>

                {/* Meta info - compacto quando não expandido */}
                {!isExpanded && (
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
                                {task.assigned_to_department}
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
                )}

                {/* Botão de expandir - quando não expandido */}
                {!isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5"
                            onClick={onToggle}
                        >
                            Abrir detalhes
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Conteúdo expandido */}
            <div
                className={cn(
                    'transition-all duration-500 ease-in-out',
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="px-5 pb-5 space-y-6">
                    {/* Seletor de Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Alterar Status:</span>
                        <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(value as TaskStatus)}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
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

                    {/* Meta info - expandido */}
                    <div className="grid gap-3 text-sm bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Criada por: <span className="text-foreground font-medium">{task.creator?.full_name}</span></span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            {task.assigned_to_user_id ? (
                                <>
                                    <User className="h-4 w-4" />
                                    <span>Atribuída para: <span className="text-foreground font-medium">{task.assignee?.full_name ?? 'Usuário'}</span></span>
                                </>
                            ) : (
                                <>
                                    <Users className="h-4 w-4" />
                                    <span>Setor: <span className="text-foreground font-medium">{task.assigned_to_department}</span></span>
                                </>
                            )}
                        </div>

                        <div className={cn(
                            "flex items-center gap-2",
                            isOverdue ? "text-destructive" : "text-muted-foreground"
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>
                                Prazo: <span className="font-medium">{format(deadlineDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                {isOverdue && <span className="ml-2 text-xs">(Atrasada)</span>}
                            </span>
                        </div>

                        {task.created_at && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Criada em: <span className="text-foreground">{format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
                            </div>
                        )}
                    </div>

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
                                            checked={item.is_completed ?? false}
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

                    {/* Barra de Progresso - no final do card expandido */}
                    {totalItems > 0 && (
                        <div className="pt-4 border-t border-border">
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

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={onToggle} className="w-full sm:w-auto">
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Recolher
                        </Button>

                        {/* Apenas gestores podem excluir */}
                        {isManager && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting} className="w-full sm:w-auto">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir Tarefa
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[95vw] max-w-md">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. A tarefa "{task.title}" será permanentemente excluída.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                        <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">
                                            Excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra de progresso compacta - quando não expandido */}
            {!isExpanded && totalItems > 0 && (
                <div className="px-5 pb-4">
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
        </div>
    );
}
