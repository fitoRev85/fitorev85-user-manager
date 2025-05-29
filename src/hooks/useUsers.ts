
import { useState, useEffect } from 'react';
import { User, categoriaUsuarios } from '@/types/user';

const STORAGE_KEY = 'fitorev85_users';

const defaultUsers: User[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@fitorev85.com',
    telefone: '(11) 99999-9999',
    cargo: 'Diretor Geral',
    categoria: 'admin',
    permissoes: categoriaUsuarios.admin.permissoes,
    propriedadesAcesso: ['1', '2', '3'],
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
    propriedadesAcesso: ['1'],
    ativo: true,
    dataCriacao: new Date('2024-02-01'),
    ultimoAcesso: new Date()
  }
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedUsers = JSON.parse(stored);
        // Convert date strings back to Date objects
        const usersWithDates = parsedUsers.map((user: any) => ({
          ...user,
          dataCriacao: new Date(user.dataCriacao),
          ultimoAcesso: user.ultimoAcesso ? new Date(user.ultimoAcesso) : undefined
        }));
        setUsers(usersWithDates);
      } catch {
        setUsers(defaultUsers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } else {
      setUsers(defaultUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
  };

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      ...userData as User,
      id: Date.now().toString(),
      permissoes: categoriaUsuarios[userData.categoria!].permissoes,
      propriedadesAcesso: [],
      dataCriacao: new Date(),
      ultimoAcesso: undefined
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return newUser;
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? 
      { ...u, ...userData, permissoes: categoriaUsuarios[userData.categoria!].permissoes } : u
    );
    saveUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
  };

  const getUserByEmail = (email: string) => {
    return users.find(u => u.email === email && u.ativo);
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserByEmail
  };
}
