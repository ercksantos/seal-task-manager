import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskWithDetails, ChecklistItem, NewTask, NewChecklistItem, TaskStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useTasks() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      if (tasksData) {
        const tasksWithDetails: TaskWithDetails[] = await Promise.all(
          (tasksData as Task[]).map(async (task) => {
            const [creatorResult, assigneeResult, checklistResult] = await Promise.all([
              supabase.from('profiles').select('*').eq('id', task.created_by).single(),
              task.assigned_to_user_id
                ? supabase.from('profiles').select('*').eq('id', task.assigned_to_user_id).single()
                : Promise.resolve({ data: null }),
              supabase
                .from('task_checklist_items')
                .select('*')
                .eq('task_id', task.id)
                .order('item_order', { ascending: true }),
            ]);

            return {
              ...task,
              creator: creatorResult.data || undefined,
              assignee: assigneeResult.data || undefined,
              checklist_items: (checklistResult.data as ChecklistItem[]) || [],
            };
          })
        );

        setTasks(tasksWithDetails);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_checklist_items' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTasks]);

  const createTask = async (
    taskData: NewTask,
    checklistItems: NewChecklistItem[]
  ): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description || null,
          deadline: taskData.deadline,
          assignment_type: taskData.assignment_type,
          assigned_to_user_id: taskData.assigned_to_user_id || null,
          assigned_to_department: taskData.assigned_to_department || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      if (newTask && checklistItems.length > 0) {
        const { error: checklistError } = await supabase
          .from('task_checklist_items')
          .insert(
            checklistItems.map((item, index) => ({
              task_id: newTask.id,
              description: item.description,
              item_order: index,
            }))
          );

        if (checklistError) throw checklistError;
      }

      toast({
        title: 'Sucesso!',
        description: 'Tarefa criada com sucesso!',
      });

      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Status atualizado com sucesso!',
      });

      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleChecklistItem = async (itemId: string, isCompleted: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('task_checklist_items')
        .update({ is_completed: isCompleted })
        .eq('id', itemId);

      if (error) throw error;

      if (isCompleted) {
        const item = tasks
          .flatMap((t) => t.checklist_items || [])
          .find((i) => i.id === itemId);

        if (item) {
          const task = tasks.find((t) => t.id === item.task_id);
          if (task) {
            const totalItems = task.checklist_items?.length || 0;
            const completedItems = (task.checklist_items?.filter((i) => i.is_completed).length || 0) + 1;

            if (completedItems === totalItems) {
              toast({
                title: 'Parabéns! 🎉',
                description: 'Tarefa concluída com sucesso!',
              });
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Tarefa excluída com sucesso!',
      });

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTaskStats = useCallback(() => {
    // Para gestores: mostrar estatísticas de todas as tarefas
    // Para colaboradores: apenas tarefas atribuídas a eles ou ao departamento
    const isManager = profile?.role === 'Manager';

    const relevantTasks = isManager
      ? tasks
      : tasks.filter(
        (task) =>
          task.assigned_to_user_id === user?.id ||
          (profile?.department && task.assigned_to_department === profile.department)
      );

    return {
      total: relevantTasks.length,
      inProgress: relevantTasks.filter((t) => t.status === 'Em Andamento').length,
      completed: relevantTasks.filter((t) => t.status === 'Concluída').length,
    };
  }, [tasks, user, profile]);

  return {
    tasks,
    loading,
    createTask,
    updateTaskStatus,
    toggleChecklistItem,
    deleteTask,
    refetch: fetchTasks,
    getTaskStats,
  };
}
