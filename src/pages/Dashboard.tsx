
import React from 'react';
import { Building2, LogOut, Home, Users, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { categoriaUsuarios } from '@/types/user';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  FitoRev85
                </h1>
                <p className="text-xs text-slate-400">Revenue Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.nome}</p>
                <p className="text-xs text-slate-400">{categoriaUsuarios[user.categoria]?.nome}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="text-center text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao FitoRev85</h2>
          <p className="text-slate-400">Sistema de Revenue Management</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div 
            onClick={() => navigate('/users')}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Gestão de Usuários</h3>
                <p className="text-slate-400 text-sm">Gerencie usuários e permissões</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/properties')}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Gestão de Propriedades</h3>
                <p className="text-slate-400 text-sm">Cadastre e gerencie propriedades</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/hotels')}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Sistema Hoteleiro</h3>
                <p className="text-slate-400 text-sm">Dashboard e reservas hoteleiras</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
