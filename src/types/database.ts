export type AppRole = 'Manager' | 'Member';
export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type AssignmentType = 'user' | 'department';

export const DEPARTMENTS = [
  'Desenvolvimento',
  'Vendas',
  'Logística',
  'Marketing',
  'Financeiro',
  'Recursos Humanos',
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  role: AppRole;
  created_at: string;
}

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
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  creator?: Profile;
  assignee?: Profile;
  checklist_items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  description: string;
  is_completed: boolean;
  item_order: number;
  created_at: string;
}

export interface NewTask {
  title: string;
  description?: string;
  deadline: string;
  assignment_type: AssignmentType;
  assigned_to_user_id?: string;
  assigned_to_department?: string;
}

export interface NewChecklistItem {
  description: string;
  item_order: number;
}
