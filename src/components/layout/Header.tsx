import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Plus, ClipboardList } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onNewTask?: () => void;
}

export function Header({ onMenuClick, onNewTask }: HeaderProps) {
  const { profile, signOut, isManager } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              SealTask
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden md:inline">
            {profile?.full_name}
          </span>
          <span className="hidden md:inline text-border">•</span>
          <span className="hidden md:inline text-primary font-medium">
            {profile?.department}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isManager && onNewTask && (
            <Button onClick={onNewTask} className="btn-primary hidden sm:flex">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
