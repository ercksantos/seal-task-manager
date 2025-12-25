import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, User, Users, Settings, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTask?: () => void;
}

export function Sidebar({ isOpen, onClose, onNewTask }: SidebarProps) {
  const location = useLocation();
  const { isManager, profile } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  // Items de navegação dinâmicos baseados no role
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/my-tasks', icon: User, label: 'Minhas Tarefas' },
    // Colaboradores veem "Tarefas do Setor", gestores não (já veem tudo no Dashboard)
    ...(!isManager && profile?.department ? [
      { to: '/dashboard/department-tasks', icon: Users, label: `Tarefas - ${profile.department}` }
    ] : []),
    { to: '/dashboard/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
            <span className="text-lg font-semibold text-foreground">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Perfil do Usuário */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={getAvatarUrl(profile?.avatar_url || null) || undefined} alt={profile?.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isManager ? 'Gestor' : profile?.department || 'Colaborador'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'nav-link',
                    isActive && 'nav-link-active'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* New Task button for mobile */}
          {isManager && onNewTask && (
            <div className="border-t border-border p-4 lg:hidden">
              <Button
                onClick={() => {
                  onNewTask();
                  onClose();
                }}
                className="w-full btn-primary"
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
