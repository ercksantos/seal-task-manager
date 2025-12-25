import React, { useState, useMemo, useCallback } from 'react';
import { TaskWithDetails } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskDetailModal } from './TaskDetailModal';
import { Loader2, ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: TaskWithDetails[];
  loading: boolean;
  filterType?: 'all' | 'my-tasks' | 'department-tasks';
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, loading, filterType = 'all', onTaskUpdate }: TaskListProps) {
  const { user, profile, isManager } = useAuth();
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    search: '',
  });

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply base filter based on view type
    if (filterType === 'my-tasks') {
      result = result.filter((task) => task.assigned_to_user_id === user?.id);
    } else if (filterType === 'department-tasks') {
      result = result.filter((task) => task.assigned_to_department === profile?.department);
    }

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={setSelectedTask}
            />
          ))}
        </div>
      )}

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={onTaskUpdate}
      />
    </div>
  );
}
