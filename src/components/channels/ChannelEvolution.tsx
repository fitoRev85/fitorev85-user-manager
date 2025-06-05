
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { LoadingState } from '@/components/ui/loading-state';
import { ReservaData } from '@/hooks/useReservationData';

interface ChannelEvolutionProps {
  data: ReservaData[];
  loading: boolean;
  propertyId: string;
  period: string;
}

const ChannelEvolution = ({ data, loading, propertyId, period }: ChannelEvolutionProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <LoadingState type="analysis" message="Analisando evolução dos canais..." />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Agrupar dados por mês e canal
  const monthlyData = data.reduce((acc, reserva) => {
    const date = new Date(reserva.data_checkin);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const canal = reserva.canal || 'Direto';
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        monthLabel: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      };
    }
    
    if (!acc[monthKey][canal]) {
      acc[monthKey][canal] = { receita: 0, reservas: 0 };
    }
    
    acc[monthKey][canal].receita += reserva.valor_total;
    acc[monthKey][canal].reservas += 1;
    
    return acc;
  }, {} as Record<string, any>);

  // Converter para array e calcular participações
  const evolutionData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .map((monthData: any) => {
      const totalReceita = Object.keys(monthData)
        .filter(key => key !== 'month' && key !== 'monthLabel')
        .reduce((sum, canal) => sum + monthData[canal].receita, 0);
      
      const result = { ...monthData };
      
      // Calcular participações percentuais
      Object.keys(monthData)
        .filter(key => key !== 'month' && key !== 'monthLabel')
        .forEach(canal => {
          result[`${canal}_participacao`] = totalReceita > 0 
            ? (monthData[canal].receita / totalReceita) * 100 
            : 0;
        });
      
      return result;
    });

  // Obter lista de canais únicos
  const canais = Array.from(new Set(
    data.map(r => r.canal || 'Direto')
  )).sort();

  const colors = {
    'Booking.com': '#3b82f6',
    'Expedia': '#10b981',
    'Airbnb': '#f59e0b',
    'Direto': '#ef4444',
    'Agoda': '#8b5cf6',
    'Hotels.com': '#06b6d4',
    'Despegar': '#84cc16',
    'Decolar': '#f97316'
  };

  const getChannelColor = (canal: string) => {
    return colors[canal as keyof typeof colors] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name.includes('participacao') ? 
                entry.value.toFixed(1) + '%' : 
                'R$ ' + entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gráfico de evolução da receita */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução da Receita por Canal
            <EnhancedTooltip 
              content="Evolução mensal da receita gerada por cada canal de distribuição"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="monthLabel" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {canais.map((canal) => (
                <Line
                  key={canal}
                  type="monotone"
                  dataKey={`${canal}.receita`}
                  stroke={getChannelColor(canal)}
                  strokeWidth={2}
                  name={canal}
                  connectNulls={false}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de participação no mix */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Evolução da Participação no Mix
            <EnhancedTooltip 
              content="Evolução percentual da participação de cada canal na receita total"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="monthLabel" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`, 
                  name.replace('_participacao', '')
                ]}
                labelStyle={{ color: '#fff' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px'
                }}
              />
              {canais.map((canal) => (
                <Area
                  key={`${canal}_participacao`}
                  type="monotone"
                  dataKey={`${canal}_participacao`}
                  stackId="1"
                  stroke={getChannelColor(canal)}
                  fill={getChannelColor(canal)}
                  name={canal}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de tendências */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tendências por Canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 p-3">Canal</th>
                  <th className="text-right text-slate-400 p-3">Primeiro Período</th>
                  <th className="text-right text-slate-400 p-3">Último Período</th>
                  <th className="text-right text-slate-400 p-3">Variação %</th>
                  <th className="text-center text-slate-400 p-3">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {canais.map((canal) => {
                  const firstPeriod = evolutionData[0]?.[`${canal}_participacao`] || 0;
                  const lastPeriod = evolutionData[evolutionData.length - 1]?.[`${canal}_participacao`] || 0;
                  const variacao = lastPeriod - firstPeriod;
                  const isPositive = variacao > 0;
                  
                  return (
                    <tr key={canal} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="text-white p-3 font-medium">{canal}</td>
                      <td className="text-slate-300 p-3 text-right">{firstPeriod.toFixed(1)}%</td>
                      <td className="text-slate-300 p-3 text-right">{lastPeriod.toFixed(1)}%</td>
                      <td className={`p-3 text-right font-medium ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{variacao.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-400 mx-auto rotate-180" />
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

export default ChannelEvolution;
