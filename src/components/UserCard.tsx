
import React from 'react';
import { User, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType, categoriaUsuarios } from '@/types/user';

interface UserCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (id: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{user.nome}</h3>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <p className="text-slate-500 text-xs">{user.cargo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoriaUsuarios[user.categoria].cor} text-white`}>
            {categoriaUsuarios[user.categoria].nome}
          </div>
          
          <div className={`w-3 h-3 rounded-full ${user.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user.id)}
              className="text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Telefone:</span>
          <p className="text-white">{user.telefone}</p>
        </div>
        <div>
          <span className="text-slate-400">Data Criação:</span>
          <p className="text-white">{user.dataCriacao.toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <span className="text-slate-400">Último Acesso:</span>
          <p className="text-white">
            {user.ultimoAcesso ? user.ultimoAcesso.toLocaleDateString('pt-BR') : 'Nunca'}
          </p>
        </div>
      </div>
    </div>
  );
}
