
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { getUserByEmail } = useUsers();

  const login = (email: string, password: string): boolean => {
    console.log('Tentando login com:', email);
    
    // Buscar usuário no sistema
    const foundUser = getUserByEmail(email);
    
    if (foundUser) {
      console.log('Usuário encontrado:', foundUser);
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
    
    console.log('Usuário não encontrado ou inativo');
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
