
import React, { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/UserCard';
import { UserModal } from '@/components/UserModal';
import { User } from '@/types/user';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, addUser, updateUser, deleteUser } = useUsers();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<User | undefined>();

  const abrirModal = (usuario?: User) => {
    setUsuarioEditando(usuario);
    setModalAberto(true);
  };

  const salvarUsuario = (formData: Partial<User>) => {
    if (usuarioEditando) {
      updateUser(usuarioEditando.id, formData);
      toast({
        title: "Usuário atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });
    } else {
      const newUser = addUser(formData);
      toast({
        title: "Usuário criado",
        description: `${newUser.nome} foi criado com sucesso.`,
      });
    }
    setModalAberto(false);
  };

  const excluirUsuario = (id: string) => {
    const usuario = users.find(u => u.id === id);
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario?.nome}"?`)) {
      deleteUser(id);
      toast({
        title: "Usuário excluído",
        description: `${usuario?.nome} foi removido com sucesso.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
              <p className="text-slate-400">Gerencie usuários e suas permissões ({users.length} usuários)</p>
            </div>
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
          {users.map((usuario) => (
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
