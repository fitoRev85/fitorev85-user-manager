
import React, { useState } from 'react';
import { Building2, Eye, EyeOff, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('admin@fitorev85.com');
  const [senha, setSenha] = useState('senha123');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, skipAuth } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Tentando fazer login com:', email, senha);
    
    const loginSuccess = login(email, senha);
    
    if (!loginSuccess) {
      console.log('Login failed');
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao FitoRev85!",
      });
    }
    
    setLoading(false);
  };

  const handleSkipAuth = () => {
    skipAuth();
    toast({
      title: "Modo Desenvolvimento",
      description: "Acesso liberado sem autenticação.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              FitoRev85
            </h1>
            <p className="text-slate-400 mt-2">Sistema de Revenue Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha" className="text-slate-300">Senha</Label>
              <div className="relative mt-2">
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              type="button"
              onClick={handleSkipAuth}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Pular Autenticação (Dev)
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Demo: admin@fitorev85.com / senha123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
