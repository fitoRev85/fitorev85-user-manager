
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, TrendingUp, DollarSign, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { LoadingState } from '@/components/ui/loading-state';
import { ReservaData } from '@/hooks/useReservationData';

interface ChannelRecommendationsProps {
  data: ReservaData[];
  loading: boolean;
  propertyId: string;
  period: string;
}

const ChannelRecommendations = ({ data, loading, propertyId, period }: ChannelRecommendationsProps) => {
  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-6">
          <LoadingState type="analysis" message="Gerando recomendações inteligentes..." />
        </CardContent>
      </Card>
    );
  }

  // Configurações de benchmark
  const channelBenchmarks = {
    'Booking.com': { commission: 0.15, adr_impact: 0.95, quality_score: 8.5 },
    'Expedia': { commission: 0.18, adr_impact: 0.92, quality_score: 8.0 },
    'Airbnb': { commission: 0.14, adr_impact: 1.1, quality_score: 7.5 },
    'Direto': { commission: 0.03, adr_impact: 1.2, quality_score: 9.0 },
    'Agoda': { commission: 0.17, adr_impact: 0.88, quality_score: 7.8 },
    'Hotels.com': { commission: 0.16, adr_impact: 0.93, quality_score: 8.2 }
  };

  // Analisar dados atuais
  const channelAnalysis = data.reduce((acc, reserva) => {
    const canal = reserva.canal || 'Direto';
    const noites = reserva.noites || 1;
    const adr = reserva.valor_total / noites;
    
    if (!acc[canal]) {
      acc[canal] = {
        canal,
        receita: 0,
        reservas: 0,
        adr_total: 0,
        participacao: 0
      };
    }
    
    acc[canal].receita += reserva.valor_total;
    acc[canal].reservas += 1;
    acc[canal].adr_total += adr;
    
    return acc;
  }, {} as Record<string, any>);

  const totalReceita = Object.values(channelAnalysis).reduce((sum: any, ch: any) => sum + ch.receita, 0);
  
  // Calcular participação e ADR médio
  Object.values(channelAnalysis).forEach((channel: any) => {
    channel.participacao = (channel.receita / totalReceita) * 100;
    channel.adr_medio = channel.adr_total / channel.reservas;
  });

  const channels = Object.values(channelAnalysis);

  // Gerar recomendações baseadas em análise
  const recommendations = [
    // Análise de concentração
    ...(function() {
      const topChannel = channels.sort((a: any, b: any) => b.participacao - a.participacao)[0] as any;
      if (topChannel && topChannel.participacao > 50) {
        return [{
          type: 'warning' as const,
          title: 'Alta Concentração de Canal',
          description: `${topChannel.canal} representa ${topChannel.participacao.toFixed(1)}% da receita. Considere diversificar para reduzir riscos.`,
          impact: 'Alto',
          priority: 1,
          actions: [
            'Investir em canais alternativos',
            'Fortalecer vendas diretas',
            'Negociar melhores condições com outros OTAs'
          ]
        }];
      }
      return [];
    })(),

    // Análise de canal direto
    ...(function() {
      const direto = channelAnalysis['Direto'];
      if (direto && direto.participacao < 20) {
        return [{
          type: 'info' as const,
          title: 'Oportunidade de Vendas Diretas',
          description: `Vendas diretas representam apenas ${direto.participacao.toFixed(1)}%. Há potencial para reduzir custos de comissão.`,
          impact: 'Médio',
          priority: 2,
          actions: [
            'Implementar programa de fidelidade',
            'Melhorar site institucional',
            'Campanhas de marketing direto',
            'Ofertas exclusivas para reservas diretas'
          ]
        }];
      }
      return [];
    })(),

    // Análise de ADR por canal
    ...(function() {
      const adrMedio = channels.reduce((sum: number, ch: any) => sum + ch.adr_medio, 0) / channels.length;
      const lowAdrChannels = channels.filter((ch: any) => ch.adr_medio < adrMedio * 0.85);
      
      if (lowAdrChannels.length > 0) {
        return [{
          type: 'warning' as const,
          title: 'Canais com ADR Abaixo da Média',
          description: `${lowAdrChannels.map((ch: any) => ch.canal).join(', ')} apresentam ADR significativamente menor.`,
          impact: 'Médio',
          priority: 3,
          actions: [
            'Revisar estratégia de preços por canal',
            'Implementar rate parity',
            'Negociar melhores condições',
            'Considerar reduzir exposição nesses canais'
          ]
        }];
      }
      return [];
    })(),

    // Análise de comissões altas
    ...(function() {
      const highCommissionChannels = channels.filter((ch: any) => {
        const benchmark = channelBenchmarks[ch.canal as keyof typeof channelBenchmarks];
        return benchmark && benchmark.commission > 0.16 && ch.participacao > 15;
      });
      
      if (highCommissionChannels.length > 0) {
        return [{
          type: 'forecast' as const,
          title: 'Otimização de Mix de Canais',
          description: 'Alguns canais com alta comissão têm participação significativa. Considere rebalanceamento.',
          impact: 'Alto',
          priority: 2,
          actions: [
            'Negociar redução de comissões',
            'Redistribuir inventário',
            'Investir em canais mais rentáveis',
            'Implementar estratégia de yield management'
          ]
        }];
      }
      return [];
    })(),

    // Recomendação geral de diversificação
    {
      type: 'info' as const,
      title: 'Estratégia de Diversificação',
      description: 'Mantenha um mix equilibrado de canais para maximizar receita e minimizar riscos.',
      impact: 'Médio',
      priority: 4,
      actions: [
        'Mix ideal: 25-30% vendas diretas',
        '40-50% OTAs principais (Booking, Expedia)',
        '20-25% canais alternativos',
        'Monitoramento contínuo de performance'
      ]
    }
  ].sort((a, b) => a.priority - b.priority);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'forecast':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'info':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto':
        return 'text-red-400';
      case 'Médio':
        return 'text-yellow-400';
      case 'Baixo':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumo executivo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Resumo Executivo
            <EnhancedTooltip 
              content="Análise geral da performance dos canais e principais oportunidades"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-400">Receita Total</span>
              </div>
              <p className="text-xl font-bold text-white">R$ {totalReceita.toLocaleString()}</p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">Canais Ativos</span>
              </div>
              <p className="text-xl font-bold text-white">{channels.length}</p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">Oportunidades</span>
              </div>
              <p className="text-xl font-bold text-white">{recommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Recomendações Inteligentes</CardTitle>
          <p className="text-slate-400 text-sm">
            Baseadas em análise de dados e benchmarks da indústria
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <Alert key={index} className="bg-slate-700/30 border-slate-600">
              <div className="flex items-start gap-4">
                {getRecommendationIcon(rec.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{rec.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${getImpactColor(rec.impact)} bg-slate-600/50`}>
                      Impacto: {rec.impact}
                    </span>
                  </div>
                  <AlertDescription className="text-slate-300 mb-3">
                    {rec.description}
                  </AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">Ações recomendadas:</p>
                    <ul className="space-y-1">
                      {rec.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-center gap-2 text-sm text-slate-300">
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Benchmark de mercado */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Benchmark de Mercado</CardTitle>
          <p className="text-slate-400 text-sm">
            Comparação com padrões da indústria hoteleira
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 p-3">Canal</th>
                  <th className="text-right text-slate-400 p-3">Sua Participação</th>
                  <th className="text-right text-slate-400 p-3">Comissão Padrão</th>
                  <th className="text-right text-slate-400 p-3">Impacto ADR</th>
                  <th className="text-right text-slate-400 p-3">Score Qualidade</th>
                  <th className="text-center text-slate-400 p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(channelBenchmarks).map(([canal, benchmark]) => {
                  const channelData = channelAnalysis[canal];
                  const participacao = channelData?.participacao || 0;
                  const isActive = participacao > 0;
                  
                  return (
                    <tr key={canal} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="text-white p-3 font-medium">{canal}</td>
                      <td className="text-slate-300 p-3 text-right">
                        {participacao > 0 ? `${participacao.toFixed(1)}%` : '-'}
                      </td>
                      <td className="text-yellow-400 p-3 text-right">
                        {(benchmark.commission * 100).toFixed(1)}%
                      </td>
                      <td className="text-slate-300 p-3 text-right">
                        {(benchmark.adr_impact * 100).toFixed(0)}%
                      </td>
                      <td className="text-slate-300 p-3 text-right">
                        {benchmark.quality_score.toFixed(1)}/10
                      </td>
                      <td className="p-3 text-center">
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelRecommendations;
