import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { Profile, DEPARTMENTS, AssignmentType, NewChecklistItem } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, X, Loader2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewTaskModal({ open, onClose, onSuccess }: NewTaskModalProps) {
  const { createTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('user');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (data) {
        setUsers(data as Profile[]);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Reset form when closing
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setDeadline(undefined);
      setAssignmentType('user');
      setAssignedUserId('');
      setAssignedDepartment('');
      setChecklistItems(['']);
    }
  }, [open]);

  const handleAddChecklistItem = () => {
    if (checklistItems.length < 20) {
      setChecklistItems([...checklistItems, '']);
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!deadline) {
      toast({
        title: 'Erro',
        description: 'A data de entrega é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    if (assignmentType === 'user' && !assignedUserId) {
      toast({
        title: 'Erro',
        description: 'Selecione um usuário para atribuir a tarefa.',
        variant: 'destructive',
      });
      return;
    }

    if (assignmentType === 'department' && !assignedDepartment) {
      toast({
        title: 'Erro',
        description: 'Selecione um setor para atribuir a tarefa.',
        variant: 'destructive',
      });
      return;
    }

    const validChecklistItems = checklistItems.filter((item) => item.trim());
    if (validChecklistItems.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um item ao checklist.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const success = await createTask(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: format(deadline, 'yyyy-MM-dd'),
        assignment_type: assignmentType,
        assigned_to_user_id: assignmentType === 'user' ? assignedUserId : undefined,
        assigned_to_department: assignmentType === 'department' ? assignedDepartment : undefined,
      },
      validChecklistItems.map((item, index) => ({
        description: item,
        item_order: index,
      }))
    );

    setLoading(false);

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nova Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              placeholder="Ex: Desenvolver módulo de relatórios"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes e objetivos da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Data de Entrega *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !deadline && 'text-muted-foreground'
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline
                    ? format(deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Assignment Type */}
          <div className="space-y-3">
            <Label>Tipo de Atribuição *</Label>
            <RadioGroup
              value={assignmentType}
              onValueChange={(value) => setAssignmentType(value as AssignmentType)}
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user" className="font-normal cursor-pointer">
                  Atribuir para usuário específico
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="department" id="department" />
                <Label htmlFor="department" className="font-normal cursor-pointer">
                  Atribuir para setor
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Assignment Selection */}
          {assignmentType === 'user' ? (
            <div className="space-y-2">
              <Label>Atribuir Para *</Label>
              <Select
                value={assignedUserId}
                onValueChange={setAssignedUserId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Atribuir Para *</Label>
              <Select
                value={assignedDepartment}
                onValueChange={setAssignedDepartment}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-3">
            <Label>Checklist de Subtarefas *</Label>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChecklistItem(index)}
                    disabled={loading || checklistItems.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {checklistItems.length < 20 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChecklistItem}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar item
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {checklistItems.length}/20 itens
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tarefa'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
