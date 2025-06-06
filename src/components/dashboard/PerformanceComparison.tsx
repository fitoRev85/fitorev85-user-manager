
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, Building2 } from 'lucide-react';
import { useReservationData } from '@/hooks/useReservationData';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface PerformanceComparisonProps {
  propertyId: string;
}

const PerformanceComparison = ({ propertyId }: PerformanceComparisonProps) => {
  const { data: reservations } = useReservationData(propertyId);

  const performanceData = React.useMemo(() => {
    if (reservations.length === 0) return null;

    const currentDate = new Date();
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));

    // Filtrar reservas por período
    const currentPeriod = reservations.filter(r => 
      isWithinInterval(new Date(r.data_checkin), { start: currentMonthStart, end: currentMonthEnd })
    );
    
    const previousPeriod = reservations.filter(r => 
      isWithinInterval(new Date(r.data_checkin), { start: lastMonthStart, end: lastMonthEnd })
    );

    // Calcular métricas
    const calculateMetrics = (reservas: any[]) => {
      const totalReceita = reservas.reduce((sum, r) => sum + (r.valor_total || 0), 0);
      const totalReservas = reservas.length;
      const totalNoites = reservas.reduce((sum, r) => sum + (r.noites || 1), 0);
      const adr = totalNoites > 0 ? totalReceita / totalNoites : 0;
      // Ocupação simulada baseada nas reservas
      const ocupacao = Math.min(75 + (totalReservas * 2), 100);
      
      return {
        receita: totalReceita,
        reservas: totalReservas,
        adr,
        ocupacao
      };
    };

    const current = calculateMetrics(currentPeriod);
    const previous = calculateMetrics(previousPeriod);

    // Calcular variações
    const getVariation = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const variations = {
      receita: getVariation(current.receita, previous.receita),
      reservas: getVariation(current.reservas, previous.reservas),
      adr: getVariation(current.adr, previous.adr),
      ocupacao: getVariation(current.ocupacao, previous.ocupacao)
    };

    // Encontrar maior alta e maior queda
    const variationEntries = Object.entries(variations);
    const maiorAlta = variationEntries.reduce((max, [key, value]) => 
      value > max.value ? { key, value } : max, { key: '', value: -Infinity });
    const maiorQueda = variationEntries.reduce((min, [key, value]) => 
      value < min.value ? { key, value } : min, { key: '', value: Infinity });

    return {
      current,
      previous,
      variations,
      maiorAlta: maiorAlta.value > 0 ? maiorAlta : null,
      maiorQueda: maiorQueda.value < 0 ? maiorQueda : null,
      periodoAtual: format(currentMonthStart, 'MMM/yyyy'),
      periodoAnterior: format(lastMonthStart, 'MMM/yyyy')
    };
  }, [reservations]);

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (variation < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return 'text-green-400';
    if (variation < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const formatValue = (key: string, value: number) => {
    switch (key) {
      case 'receita':
        return `R$ ${value.toLocaleString()}`;
      case 'reservas':
        return value.toString();
      case 'adr':
        return `R$ ${value.toFixed(0)}`;
      case 'ocupacao':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getMetricName = (key: string) => {
    const names: Record<string, string> = {
      receita: 'Receita',
      reservas: 'Reservas',
      adr: 'ADR',
      ocupacao: 'Ocupação'
    };
    return names[key] || key;
  };

  const getMetricIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      receita: <DollarSign className="w-5 h-5 text-green-400" />,
      reservas: <Users className="w-5 h-5 text-blue-400" />,
      adr: <TrendingUp className="w-5 h-5 text-purple-400" />,
      ocupacao: <Target className="w-5 h-5 text-cyan-400" />
    };
    return icons[key] || <Building2 className="w-5 h-5" />;
  };

  if (!performanceData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Dados insuficientes</h3>
          <p className="text-slate-400">Não há dados suficientes para comparação de períodos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Performance vs Período Anterior
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{performanceData.periodoAtual} vs {performanceData.periodoAnterior}</span>
            {performanceData.maiorAlta && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Maior alta: {getMetricName(performanceData.maiorAlta.key)} (+{performanceData.maiorAlta.value.toFixed(1)}%)
              </Badge>
            )}
            {performanceData.maiorQueda && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Maior queda: {getMetricName(performanceData.maiorQueda.key)} ({performanceData.maiorQueda.value.toFixed(1)}%)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(performanceData.variations).map(([key, variation]) => {
              const currentValue = performanceData.current[key as keyof typeof performanceData.current];
              const isHighlight = 
                (performanceData.maiorAlta?.key === key && variation > 0) ||
                (performanceData.maiorQueda?.key === key && variation < 0);

              return (
                <Card 
                  key={key} 
                  className={`bg-slate-700/50 border-slate-600/50 ${
                    isHighlight ? 'ring-2 ring-blue-400/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(key)}
                        <span className="text-slate-300 text-sm font-medium">
                          {getMetricName(key)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getVariationIcon(variation)}
                        <span className={`text-sm font-medium ${getVariationColor(variation)}`}>
                          {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-white text-lg font-bold">
                        {formatValue(key, currentValue)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Anterior: {formatValue(key, performanceData.previous[key as keyof typeof performanceData.previous])}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceComparison;
