
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
import { useBudgetMetas } from '@/hooks/useBudgetMetas';
import { useReservationData } from '@/hooks/useReservationData';
import { LoadingState } from '@/components/ui/loading-state';

interface BudgetDashboardProps {
  propertyId: string;
  year: number;
}

export function BudgetDashboard({ propertyId, year }: BudgetDashboardProps) {
  const { metas, loading: loadingMetas } = useBudgetMetas();
  const { data: reservationData, loading: loadingData } = useReservationData(propertyId);

  if (loadingMetas || loadingData) {
    return <LoadingState message="Carregando dados de budget..." />;
  }

  const metasAno = metas.filter(m => 
    m.propriedadeId === propertyId && m.mesAno.startsWith(year.toString())
  );

  const hoje = new Date();
  const mesAtual = `${year}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  // Calcular totais anuais
  const totalMetaReceita = metasAno.reduce((sum, m) => sum + m.receitaMeta, 0);
  const totalMetaOcupacao = metasAno.length > 0 ? metasAno.reduce((sum, m) => sum + m.ocupacaoMeta, 0) / metasAno.length : 0;

  // Calcular realizados até agora
  const dadosAno = reservationData.filter(d => {
    const dataCheckin = new Date(d.data_checkin);
    return dataCheckin.getFullYear() === year;
  });

  const receitaRealizada = dadosAno.reduce((sum, d) => sum + (d.valor_total || 0), 0);
  const progressoReceita = totalMetaReceita > 0 ? (receitaRealizada / totalMetaReceita) * 100 : 0;

  const mesesComMetas = metasAno.filter(m => {
    const [metaAno, metaMes] = m.mesAno.split('-').map(Number);
    const dataMeta = new Date(metaAno, metaMes - 1, 1);
    return dataMeta <= hoje;
  });

  const statusCards = [
    {
      title: 'Receita Anual',
      value: `R$ ${receitaRealizada.toLocaleString('pt-BR')}`,
      meta: `R$ ${totalMetaReceita.toLocaleString('pt-BR')}`,
      progress: progressoReceita,
      status: progressoReceita >= 95 ? 'success' : progressoReceita >= 80 ? 'warning' : 'error',
      icon: TrendingUp
    },
    {
      title: 'Metas Definidas',
      value: metasAno.length.toString(),
      meta: '12 meses',
      progress: (metasAno.length / 12) * 100,
      status: metasAno.length >= 12 ? 'success' : metasAno.length >= 6 ? 'warning' : 'error',
      icon: Target
    },
    {
      title: 'Metas Atingidas',
      value: mesesComMetas.filter(m => {
        const mesData = m.mesAno;
        const dadosMes = dadosAno.filter(d => {
          const dataCheckin = new Date(d.data_checkin);
          const mesReserva = `${dataCheckin.getFullYear()}-${String(dataCheckin.getMonth() + 1).padStart(2, '0')}`;
          return mesReserva === mesData;
        });
        const receitaMes = dadosMes.reduce((sum, d) => sum + (d.valor_total || 0), 0);
        return receitaMes >= m.receitaMeta;
      }).length.toString(),
      meta: mesesComMetas.length.toString(),
      progress: mesesComMetas.length > 0 ? (mesesComMetas.filter(m => {
        const mesData = m.mesAno;
        const dadosMes = dadosAno.filter(d => {
          const dataCheckin = new Date(d.data_checkin);
          const mesReserva = `${dataCheckin.getFullYear()}-${String(dataCheckin.getMonth() + 1).padStart(2, '0')}`;
          return mesReserva === mesData;
        });
        const receitaMes = dadosMes.reduce((sum, d) => sum + (d.valor_total || 0), 0);
        return receitaMes >= m.receitaMeta;
      }).length / mesesComMetas.length) * 100 : 0,
      status: 'info',
      icon: AlertCircle
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ótimo</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Atenção</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>;
      default: return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${getStatusColor(card.status)}`} />
                    {card.title}
                  </CardTitle>
                  {getStatusBadge(card.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Realizado:</span>
                    <span className="text-white font-medium">{card.value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Meta:</span>
                    <span className="text-slate-300">{card.meta}</span>
                  </div>
                </div>
                <Progress 
                  value={card.progress} 
                  className="h-2"
                />
                <div className="text-xs text-slate-400 text-center">
                  {card.progress.toFixed(1)}% atingido
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Mensal */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Performance Mensal vs Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metasAno.map((meta) => {
              const dadosMes = dadosAno.filter(d => {
                const dataCheckin = new Date(d.data_checkin);
                const mesReserva = `${dataCheckin.getFullYear()}-${String(dataCheckin.getMonth() + 1).padStart(2, '0')}`;
                return mesReserva === meta.mesAno;
              });

              const receitaMes = dadosMes.reduce((sum, d) => sum + (d.valor_total || 0), 0);
              const progressoMes = (receitaMes / meta.receitaMeta) * 100;
              const statusMes = progressoMes >= 100 ? 'success' : progressoMes >= 90 ? 'warning' : 'error';

              const [ano, mes] = meta.mesAno.split('-').map(Number);
              const nomesMeses = [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
              ];

              return (
                <div key={meta.mesAno} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {nomesMeses[mes - 1]} {ano}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">
                        R$ {receitaMes.toLocaleString('pt-BR')} / R$ {meta.receitaMeta.toLocaleString('pt-BR')}
                      </span>
                      {progressoMes >= 100 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(progressoMes, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-slate-400 text-right">
                    {progressoMes.toFixed(1)}% da meta
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
