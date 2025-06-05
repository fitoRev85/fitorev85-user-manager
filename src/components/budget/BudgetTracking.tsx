
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { useBudgetMetas } from '@/hooks/useBudgetMetas';
import { useReservationData } from '@/hooks/useReservationData';
import { LoadingState } from '@/components/ui/loading-state';

interface BudgetTrackingProps {
  propertyId: string;
  year: number;
}

export function BudgetTracking({ propertyId, year }: BudgetTrackingProps) {
  const { metas, calcularResultadoVsMeta, calcularProjecaoMeta } = useBudgetMetas();
  const { data: reservationData, loading } = useReservationData(propertyId);

  if (loading) {
    return <LoadingState message="Carregando acompanhamento..." />;
  }

  const metasAno = metas.filter(m => 
    m.propriedadeId === propertyId && m.mesAno.startsWith(year.toString())
  );

  const hoje = new Date();
  const mesAtual = `${year}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  const resultados = metasAno.map(meta => {
    const resultado = calcularResultadoVsMeta(propertyId, meta.mesAno, reservationData);
    const projecao = calcularProjecaoMeta(propertyId, meta.mesAno, reservationData);
    return { meta, resultado, projecao };
  }).filter(item => item.resultado);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Meta Atingida</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Atenção</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Abaixo da Meta</Badge>;
      default: return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em Análise</Badge>;
    }
  };

  const getProjecaoStatus = (status: string) => {
    switch (status) {
      case 'on-track': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">No Caminho</Badge>;
      case 'risk': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Risco</Badge>;
      case 'critical': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>;
      default: return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Análise</Badge>;
    }
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Metas Atingidas</p>
                <p className="text-2xl font-bold text-white">
                  {resultados.filter(r => r.resultado?.statusGeral === 'success').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Em Atenção</p>
                <p className="text-2xl font-bold text-white">
                  {resultados.filter(r => r.resultado?.statusGeral === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-slate-400">Abaixo da Meta</p>
                <p className="text-2xl font-bold text-white">
                  {resultados.filter(r => r.resultado?.statusGeral === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acompanhamento Detalhado */}
      <div className="space-y-4">
        {resultados.map(({ meta, resultado, projecao }) => {
          if (!resultado) return null;

          const [ano, mes] = meta.mesAno.split('-').map(Number);
          const nomeMes = meses[mes - 1];
          const isMesAtual = meta.mesAno === mesAtual;

          return (
            <Card key={meta.mesAno} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    {getStatusIcon(resultado.statusGeral)}
                    {nomeMes} {year}
                    {isMesAtual && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Mês Atual
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {getStatusBadge(resultado.statusGeral)}
                    {projecao && getProjecaoStatus(projecao.statusProjecao)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Receita */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Receita</span>
                      <span className={`text-sm font-medium ${
                        resultado.desvioReceita >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {resultado.desvioReceita >= 0 ? '+' : ''}
                        {resultado.desvioReceita.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((resultado.receitaRealizada / resultado.receitaMeta) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-white">
                        R$ {resultado.receitaRealizada.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-slate-400">
                        R$ {resultado.receitaMeta.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Ocupação */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Ocupação</span>
                      <span className={`text-sm font-medium ${
                        resultado.desvioOcupacao >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {resultado.desvioOcupacao >= 0 ? '+' : ''}
                        {resultado.desvioOcupacao.toFixed(1)}pp
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((resultado.ocupacaoRealizada / resultado.ocupacaoMeta) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-white">
                        {resultado.ocupacaoRealizada.toFixed(1)}%
                      </span>
                      <span className="text-slate-400">
                        {resultado.ocupacaoMeta.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* ADR */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">ADR</span>
                      <span className={`text-sm font-medium ${
                        resultado.desvioAdr >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {resultado.desvioAdr >= 0 ? '+' : ''}
                        {resultado.desvioAdr.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((resultado.adrRealizado / resultado.adrMeta) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-white">
                        R$ {resultado.adrRealizado.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-slate-400">
                        R$ {resultado.adrMeta.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Projeção (apenas para mês atual) */}
                {isMesAtual && projecao && (
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Projeção para o Mês
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Projeção Receita:</span>
                        <div className="text-white font-medium">
                          R$ {projecao.projecaoReceita.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Probabilidade Meta:</span>
                        <div className="text-white font-medium">
                          {projecao.probabilidadeAtingirMeta.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Receita Diária Necessária:</span>
                        <div className="text-white font-medium">
                          R$ {projecao.receitaNecessariaDiaria.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {metasAno.length === 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">
              Nenhuma meta definida para {year}. 
              <br />
              Vá para a aba "Definir Metas" para configurar as metas mensais.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
