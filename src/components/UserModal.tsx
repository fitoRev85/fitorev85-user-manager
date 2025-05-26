
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, UserCategory, categoriaUsuarios } from '@/types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  user?: User;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  categoria: UserCategory;
  ativo: boolean;
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    categoria: 'operacional',
    ativo: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cargo: user.cargo,
        categoria: user.categoria,
        ativo: user.ativo
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        categoria: 'operacional',
        ativo: true
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-slate-300">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone" className="text-slate-300">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
            <Input
              id="cargo"
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Ex: Gerente, Diretor, etc."
            />
          </div>

          <div>
            <Label htmlFor="categoria" className="text-slate-300">Categoria</Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value as UserCategory})}
              className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(categoriaUsuarios).map(([key, config]) => (
                <option key={key} value={key}>{config.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
            />
            <Label htmlFor="ativo" className="text-slate-300">Usuário ativo</Label>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
