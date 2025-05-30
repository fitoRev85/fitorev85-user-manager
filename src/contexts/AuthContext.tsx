
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { getUserByEmail } = useUsers();

  const login = (email: string, password: string): boolean => {
    console.log('Tentando login com:', email, 'senha:', password);
    
    // Buscar usuário no sistema
    const foundUser = getUserByEmail(email);
    console.log('Usuário encontrado:', foundUser);
    
    if (foundUser && foundUser.senha === password) {
      console.log('Login bem-sucedido para:', foundUser.nome);
      const authUser: AuthUser = {
        id: foundUser.id,
        nome: foundUser.nome,
        email: foundUser.email,
        categoria: foundUser.categoria,
        permissoes: foundUser.permissoes
      };
      setUser(authUser);
      return true;
    }
    
    console.log('Login falhou - senha incorreta ou usuário não encontrado');
    return false;
  };

  const skipAuth = () => {
    // Logar automaticamente como admin para desenvolvimento
    const authUser: AuthUser = {
      id: '1',
      nome: 'Administrador (Dev)',
      email: 'admin@fitorev85.com',
      categoria: 'admin',
      permissoes: ['*']
    };
    setUser(authUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, skipAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
