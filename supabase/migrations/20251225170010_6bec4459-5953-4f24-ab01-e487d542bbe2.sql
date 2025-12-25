-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('Manager', 'Member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('Pendente', 'Em Andamento', 'Concluída');

-- Create assignment type enum
CREATE TYPE public.assignment_type AS ENUM ('user', 'department');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  status task_status NOT NULL DEFAULT 'Pendente',
  assignment_type assignment_type NOT NULL,
  assigned_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_department TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task checklist items table
CREATE TABLE public.task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  item_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for RLS helper
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Create function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department FROM public.profiles WHERE id = _user_id
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Tasks RLS Policies
CREATE POLICY "Managers can view all tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'Manager'));

CREATE POLICY "Members can view tasks assigned to them"
ON public.tasks FOR SELECT
TO authenticated
USING (assigned_to_user_id = auth.uid());

CREATE POLICY "Members can view tasks assigned to their department"
ON public.tasks FOR SELECT
TO authenticated
USING (assigned_to_department = public.get_user_department(auth.uid()));

CREATE POLICY "Managers can create tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'Manager'));

CREATE POLICY "Managers can update any task"
ON public.tasks FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'Manager'));

CREATE POLICY "Members can update their assigned tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  assigned_to_user_id = auth.uid() OR 
  assigned_to_department = public.get_user_department(auth.uid())
);

CREATE POLICY "Managers can delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'Manager'));

-- Task checklist items RLS Policies
CREATE POLICY "Users can view checklist items for visible tasks"
ON public.task_checklist_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id
    AND (
      public.has_role(auth.uid(), 'Manager')
      OR t.assigned_to_user_id = auth.uid()
      OR t.assigned_to_department = public.get_user_department(auth.uid())
    )
  )
);

CREATE POLICY "Managers can create checklist items"
ON public.task_checklist_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'Manager'));

CREATE POLICY "Users can update checklist items for their tasks"
ON public.task_checklist_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id
    AND (
      public.has_role(auth.uid(), 'Manager')
      OR t.assigned_to_user_id = auth.uid()
      OR t.assigned_to_department = public.get_user_department(auth.uid())
    )
  )
);

CREATE POLICY "Managers can delete checklist items"
ON public.task_checklist_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'Manager'));

-- User roles RLS Policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, department, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Desenvolvimento'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'Member')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to update task progress
CREATE OR REPLACE FUNCTION public.update_task_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  new_progress INTEGER;
  new_status task_status;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_items, completed_items
  FROM public.task_checklist_items
  WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);

  IF total_items > 0 THEN
    new_progress := (completed_items * 100) / total_items;
  ELSE
    new_progress := 0;
  END IF;

  IF new_progress = 0 THEN
    new_status := 'Pendente';
  ELSIF new_progress = 100 THEN
    new_status := 'Concluída';
  ELSE
    new_status := 'Em Andamento';
  END IF;

  UPDATE public.tasks
  SET progress_percentage = new_progress,
      status = new_status,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for checklist item changes
CREATE TRIGGER on_checklist_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.task_checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_task_progress();

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_checklist_items;