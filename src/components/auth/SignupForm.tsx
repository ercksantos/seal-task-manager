import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Building2, Shield } from 'lucide-react';
import { z } from 'zod';
import { DEPARTMENTS, AppRole } from '@/types/database';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirm_password: z.string(),
  department: z.string().min(1, 'Selecione um setor'),
  role: z.enum(['Manager', 'Member']),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
});

export function SignupForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: '',
    role: 'Member' as AppRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = signupSchema.parse(formData);

      const { error } = await signUp(validatedData.email, validatedData.password, {
        full_name: validatedData.full_name,
        department: validatedData.department,
        role: validatedData.role,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Erro',
            description: 'Este email já está cadastrado.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
          Nome Completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Seu nome completo"
            value={formData.full_name}
            onChange={handleChange}
            className="pl-10"
            disabled={loading}
          />
        </div>
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              disabled={loading}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
            Confirmar Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              className="pl-10"
              disabled={loading}
            />
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{errors.confirm_password}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Setor
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Select
              value={formData.department}
              onValueChange={(value) => handleSelectChange('department', value)}
              disabled={loading}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Selecione" />
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
          {errors.department && (
            <p className="text-xs text-destructive">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Função
          </Label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
              disabled={loading}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Gestor</SelectItem>
                <SelectItem value="Member">Colaborador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar Conta'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
