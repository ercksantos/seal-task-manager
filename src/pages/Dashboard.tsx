import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskList } from '@/components/dashboard/TaskList';
import { NewTaskModal } from '@/components/dashboard/NewTaskModal';
import { Loader2 } from 'lucide-react';

function DashboardHome() {
  const { tasks, loading, getTaskStats, refetch } = useTasks();
  const stats = getTaskStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das suas tarefas e atividades
        </p>
      </div>

      <StatsCards
        total={stats.total}
        inProgress={stats.inProgress}
        completed={stats.completed}
      />

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Todas as Tarefas
        </h2>
        <TaskList
          tasks={tasks}
          loading={loading}
          filterType="all"
          onTaskUpdate={refetch}
        />
      </div>
    </div>
  );
}

function MyTasks() {
  const { tasks, loading, refetch } = useTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
        <p className="text-muted-foreground mt-1">
          Tarefas atribuídas diretamente a você
        </p>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        filterType="my-tasks"
        onTaskUpdate={refetch}
      />
    </div>
  );
}

function DepartmentTasks() {
  const { profile } = useAuth();
  const { tasks, loading, refetch } = useTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tarefas do Setor</h1>
        <p className="text-muted-foreground mt-1">
          Tarefas atribuídas ao setor {profile?.department}
        </p>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        filterType="department-tasks"
        onTaskUpdate={refetch}
      />
    </div>
  );
}

function Profile() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Informações da sua conta
        </p>
      </div>

      <div className="card-elevated p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome</label>
            <p className="text-foreground">{profile?.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-foreground">{profile?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Setor</label>
            <p className="text-foreground">{profile?.department}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Função</label>
            <p className="text-foreground">
              {profile?.role === 'Manager' ? 'Gestor' : 'Colaborador'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { refetch } = useTasks();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onNewTask={() => setNewTaskModalOpen(true)}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewTask={() => setNewTaskModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-0">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="department-tasks" element={<DepartmentTasks />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>

      <NewTaskModal
        open={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
