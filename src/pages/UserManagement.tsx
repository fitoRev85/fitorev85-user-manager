
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/UserCard';
import { UserModal } from '@/components/UserModal';
import { User, categoriaUsuarios } from '@/types/user';

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<User[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@fitorev85.com',
      telefone: '(11) 99999-9999',
      cargo: 'Diretor Geral',
      categoria: 'admin',
      permissoes: categoriaUsuarios.admin.permissoes,
      propriedadesAcesso: ['prop1', 'prop2'],
      ativo: true,
      dataCriacao: new Date('2024-01-15'),
      ultimoAcesso: new Date()
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@fitorev85.com',
      telefone: '(11) 88888-8888',
      cargo: 'Revenue Manager',
      categoria: 'revenue_manager',
      permissoes: categoriaUsuarios.revenue_manager.permissoes,
      propriedadesAcesso: ['prop1'],
      ativo: true,
      dataCriacao: new Date('2024-02-01'),
      ultimoAcesso: new Date()
    }
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<User | undefined>();

  const abrirModal = (usuario?: User) => {
    setUsuarioEditando(usuario);
    setModalAberto(true);
  };

  const salvarUsuario = (formData: Partial<User>) => {
    if (usuarioEditando) {
      setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? 
        { ...u, ...formData, permissoes: categoriaUsuarios[formData.categoria!].permissoes } : u
      ));
    } else {
      const novoUsuario: User = {
        ...formData as User,
        id: Date.now().toString(),
        permissoes: categoriaUsuarios[formData.categoria!].permissoes,
        propriedadesAcesso: [],
        dataCriacao: new Date(),
        ultimoAcesso: undefined
      };
      setUsuarios([...usuarios, novoUsuario]);
    }
    setModalAberto(false);
  };

  const excluirUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
            <p className="text-slate-400">Gerencie usuários e suas permissões</p>
          </div>
          <Button
            onClick={() => abrirModal()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid gap-4">
          {usuarios.map((usuario) => (
            <UserCard
              key={usuario.id}
              user={usuario}
              onEdit={abrirModal}
              onDelete={excluirUsuario}
            />
          ))}
        </div>

        <UserModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onSave={salvarUsuario}
          user={usuarioEditando}
        />
      </div>
    </div>
  );
}
