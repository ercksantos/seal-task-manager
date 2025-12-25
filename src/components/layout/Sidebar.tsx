import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, User, Users, Settings, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTask?: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/my-tasks', icon: User, label: 'Minhas Tarefas' },
  { to: '/dashboard/department-tasks', icon: Users, label: 'Tarefas do Setor' },
  { to: '/dashboard/profile', icon: Settings, label: 'Perfil' },
];

export function Sidebar({ isOpen, onClose, onNewTask }: SidebarProps) {
  const location = useLocation();
  const { isManager } = useAuth();

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
