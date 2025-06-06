
import { useState, useEffect } from 'react';
import { User, categoriaUsuarios } from '@/types/user';
import { LocalStorageManager } from '@/utils/localStorage';

const STORAGE_KEY = 'fitorev85_users';

const defaultUsers: User[] = [
  {
    id: '1',
    nome: 'Administrador',
    email: 'admin@fitorev85.com',
    telefone: '(11) 99999-9999',
    cargo: 'Administrador',
    categoria: 'admin',
    permissoes: categoriaUsuarios.admin.permissoes,
    propriedadesAcesso: ['1', '2', '3'],
    ativo: true,
    dataCriacao: new Date('2024-01-15'),
    ultimoAcesso: new Date(),
    senha: 'senha123'
  },
  {
    id: '2',
    nome: 'João Silva',
    email: 'joao@fitorev85.com',
    telefone: '(11) 99999-9999',
    cargo: 'Diretor Geral',
    categoria: 'admin',
    permissoes: categoriaUsuarios.admin.permissoes,
    propriedadesAcesso: ['1', '2', '3'],
    ativo: true,
    dataCriacao: new Date('2024-01-15'),
    ultimoAcesso: new Date(),
    senha: 'senha123'
  },
  {
    id: '3',
    nome: 'Maria Santos',
    email: 'maria@fitorev85.com',
    telefone: '(11) 88888-8888',
    cargo: 'Revenue Manager',
    categoria: 'revenue_manager',
    permissoes: categoriaUsuarios.revenue_manager.permissoes,
    propriedadesAcesso: ['1'],
    ativo: true,
    dataCriacao: new Date('2024-02-01'),
    ultimoAcesso: new Date(),
    senha: 'senha123'
  }
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = () => {
      const loadedUsers = LocalStorageManager.safeGet(STORAGE_KEY, defaultUsers);
      setUsers(loadedUsers);
      setLoading(false);
      console.log('Usuários carregados:', loadedUsers.length);
    };

    loadUsers();
  }, []);

  const saveUsers = (newUsers: User[]): boolean => {
    const success = LocalStorageManager.safeSet(STORAGE_KEY, newUsers);
    if (success) {
      setUsers(newUsers);
      console.log('Usuários salvos:', newUsers.length);
    }
    return success;
  };

  const addUser = (userData: Partial<User>): User | null => {
    try {
      const newUser: User = {
        ...userData as User,
        id: Date.now().toString(),
        permissoes: categoriaUsuarios[userData.categoria!].permissoes,
        propriedadesAcesso: userData.propriedadesAcesso || [],
        dataCriacao: new Date(),
        ultimoAcesso: undefined
      };
      
      const updatedUsers = [...users, newUser];
      return saveUsers(updatedUsers) ? newUser : null;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      return null;
    }
  };

  const updateUser = (userId: string, userData: Partial<User>): boolean => {
    try {
      const updatedUsers = users.map(u => u.id === userId ? 
        { 
          ...u, 
          ...userData, 
          permissoes: userData.categoria ? categoriaUsuarios[userData.categoria].permissoes : u.permissoes
        } : u
      );
      return saveUsers(updatedUsers);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  };

  const deleteUser = (userId: string): boolean => {
    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      return saveUsers(updatedUsers);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false;
    }
  };

  const getUserByEmail = (email: string): User | undefined => {
    const user = users.find(u => u.email === email && u.ativo);
    console.log('Buscando usuário:', email, 'Encontrado:', !!user);
    return user;
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    getUserByEmail
  };
}
