import React, { useState, useMemo, useCallback } from 'react';
import { TaskWithDetails } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { ExpandableTaskCard } from './ExpandableTaskCard';
import { TaskFilters } from './TaskFilters';
import { Loader2, ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: TaskWithDetails[];
  loading: boolean;
  filterType?: 'all' | 'my-tasks' | 'department-tasks' | 'all-tasks';
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, loading, filterType = 'all', onTaskUpdate }: TaskListProps) {
  const { user, profile, isManager } = useAuth();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    search: '',
  });

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleToggleExpand = useCallback((taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply base filter based on view type
    if (filterType === 'my-tasks') {
      result = result.filter((task) => task.assigned_to_user_id === user?.id);
    } else if (filterType === 'department-tasks') {
      // Para colaboradores: filtrar por seu departamento
      // Para gestores: este filtro não deve ser usado (gestores não têm departamento)
      if (profile?.department) {
        result = result.filter((task) => task.assigned_to_department === profile?.department);
      }
    }
    // filterType === 'all-tasks' ou 'all' não filtra por atribuição

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter((task) => task.status === filters.status);
    }

    // Apply department filter (managers only)
    if (isManager && filters.department !== 'all') {
      result = result.filter(
        (task) =>
          task.assigned_to_department === filters.department ||
          task.assignee?.department === filters.department
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [tasks, filters, filterType, user, profile, isManager]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskFilters onFilterChange={handleFilterChange} />

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground">Nenhuma tarefa encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.search || filters.status !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'As tarefas atribuídas a você aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {(() => {
            // Se há um card expandido, reorganizar para que ele apareça no início de sua "linha"
            if (expandedTaskId) {
              const expandedIndex = filteredTasks.findIndex(t => t.id === expandedTaskId);
              if (expandedIndex !== -1) {
                // Calcular qual linha o card está (considerando 3 cards por linha em lg)
                const cardsPerRow = 3;
                const rowStart = Math.floor(expandedIndex / cardsPerRow) * cardsPerRow;

                // Cards antes da linha do expandido
                const beforeRow = filteredTasks.slice(0, rowStart);
                // Card expandido
                const expandedCard = filteredTasks[expandedIndex];
                // Cards na mesma linha (exceto o expandido)
                const sameRowCards = filteredTasks
                  .slice(rowStart, rowStart + cardsPerRow)
                  .filter(t => t.id !== expandedTaskId);
                // Cards depois da linha do expandido
                const afterRow = filteredTasks.slice(rowStart + cardsPerRow);

                // Nova ordem: antes da linha -> expandido -> mesma linha -> depois da linha
                const reorderedTasks = [...beforeRow, expandedCard, ...sameRowCards, ...afterRow];

                return reorderedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={task.id === expandedTaskId ? 'col-span-full' : ''}
                  >
                    <ExpandableTaskCard
                      task={task}
                      isExpanded={task.id === expandedTaskId}
                      onToggle={() => handleToggleExpand(task.id)}
                      onUpdate={onTaskUpdate}
                    />
                  </div>
                ));
              }
            }

            // Sem card expandido, renderizar normalmente
            return filteredTasks.map((task) => (
              <div key={task.id}>
                <ExpandableTaskCard
                  task={task}
                  isExpanded={false}
                  onToggle={() => handleToggleExpand(task.id)}
                  onUpdate={onTaskUpdate}
                />
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
