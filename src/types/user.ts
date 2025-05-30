export type UserCategory = 'super_admin' | 'admin' | 'gerente_geral' | 'revenue_manager' | 'financeiro' | 'operacional';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  categoria: UserCategory;
  permissoes: string[];
  propriedadesAcesso: string[];
  ativo: boolean;
  dataCriacao: Date;
  ultimoAcesso?: Date;
  senha?: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  categoria: UserCategory;
  permissoes: string[];
}

export const categoriaUsuarios = {
  super_admin: {
    nome: 'Super Administrador',
    cor: 'from-purple-600 to-indigo-600',
    permissoes: ['*']
  },
  admin: {
    nome: 'Administrador',
    cor: 'from-blue-600 to-cyan-600',
    permissoes: ['gerenciar_usuarios', 'gerenciar_propriedades', 'visualizar_relatorios', 'gerenciar_forecast']
  },
  gerente_geral: {
    nome: 'Gerente Geral',
    cor: 'from-emerald-600 to-teal-600',
    permissoes: ['visualizar_dashboard', 'gerenciar_forecast', 'visualizar_relatorios']
  },
  revenue_manager: {
    nome: 'Revenue Manager',
    cor: 'from-amber-600 to-orange-600',
    permissoes: ['gerenciar_forecast', 'gerenciar_taxas', 'visualizar_relatorios', 'analises_receita']
  },
  financeiro: {
    nome: 'Financeiro',
    cor: 'from-green-600 to-emerald-600',
    permissoes: ['visualizar_relatorios', 'gerenciar_taxas', 'relatorios_financeiros']
  },
  operacional: {
    nome: 'Operacional',
    cor: 'from-slate-600 to-gray-600',
    permissoes: ['visualizar_dashboard', 'atualizar_ocupacao']
  }
};
