// Re-exportar tipos do Supabase para manter compatibilidade
export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';

// Tipos de Enum
export type AppRole = 'Manager' | 'Member';
export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type AssignmentType = 'user' | 'department';

// Departamentos disponíveis
export const DEPARTMENTS = [
  'Desenvolvimento',
  'Vendas',
  'Logística',
  'Marketing',
  'Financeiro',
  'Recursos Humanos',
] as const;

export type Department = typeof DEPARTMENTS[number];

// Tipo de perfil de usuário
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string | null; // NULL para gestores (Managers)
  role: AppRole;
  avatar_url: string | null;
  created_at: string | null;
}

// Tipo de tarefa
export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  status: TaskStatus;
  assignment_type: AssignmentType;
  assigned_to_user_id: string | null;
  assigned_to_department: string | null;
  created_by: string;
  progress_percentage: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Tipo de item do checklist
export interface ChecklistItem {
  id: string;
  task_id: string;
  description: string;
  is_completed: boolean | null;
  item_order: number;
  created_at: string | null;
}

// Tarefa com detalhes completos
export interface TaskWithDetails extends Task {
  creator?: Profile;
  assignee?: Profile;
  checklist_items?: ChecklistItem[];
}

// Para criação de nova tarefa
export interface NewTask {
  title: string;
  description?: string;
  deadline: string;
  assignment_type: AssignmentType;
  assigned_to_user_id?: string;
  assigned_to_department?: string;
}

// Para criação de novo item de checklist
export interface NewChecklistItem {
  description: string;
  item_order: number;
}
