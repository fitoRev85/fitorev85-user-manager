
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, LineChart } from 'recharts';
import { DollarSign, TrendingDown, AlertTriangle, Calculator } from 'lucide-react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { LoadingState } from '@/components/ui/loading-state';
import { ReservaData } from '@/hooks/useReservationData';

interface ChannelCostsProps {
  data: ReservaData[];
  loading: boolean;
  propertyId: string;
  period: string;
}

const ChannelCosts = ({ data, loading, propertyId, period }: ChannelCostsProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <LoadingState type="analysis" message="Calculando custos e comissões..." />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Configurações de comissão por canal (dados simulados baseados em padrões do mercado)
  const channelCommissions = {
    'Booking.com': { rate: 0.15, type: 'percentage' },
    'Expedia': { rate: 0.18, type: 'percentage' },
    'Airbnb': { rate: 0.14, type: 'percentage' },
    'Direto': { rate: 0.03, type: 'percentage' }, // Custos de processamento
    'Agoda': { rate: 0.17, type: 'percentage' },
    'Hotels.com': { rate: 0.16, type: 'percentage' },
    'Despegar': { rate: 0.15, type: 'percentage' },
    'Decolar': { rate: 0.15, type: 'percentage' }
  };

  // Processar dados por canal com cálculo de custos
  const channelCostData = data.reduce((acc, reserva) => {
    const canal = reserva.canal || 'Direto';
    const commission = channelCommissions[canal as keyof typeof channelCommissions] || { rate: 0.10, type: 'percentage' };
    const comissao = reserva.valor_total * commission.rate;
    const receitaLiquida = reserva.valor_total - comissao;
    
    if (!acc[canal]) {
      acc[canal] = {
        canal,
        receita: 0,
        comissao: 0,
        receitaLiquida: 0,
        reservas: 0,
        taxaComissao: commission.rate
      };
    }
    
    acc[canal].receita += reserva.valor_total;
    acc[canal].comissao += comissao;
    acc[canal].receitaLiquida += receitaLiquida;
    acc[canal].reservas += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const channelArray = Object.values(channelCostData);
  const totalReceita = channelArray.reduce((sum: number, channel: any) => sum + channel.receita, 0);
  const totalComissao = channelArray.reduce((sum: number, channel: any) => sum + channel.comissao, 0);
  const totalReceitaLiquida = channelArray.reduce((sum: number, channel: any) => sum + channel.receitaLiquida, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: R$ ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métricas de custo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <EnhancedTooltip content="Receita bruta total antes das comissões">
                  <p className="text-slate-400 text-sm">Receita Bruta</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">R$ {totalReceita.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <EnhancedTooltip content="Total de comissões pagas aos canais">
                  <p className="text-slate-400 text-sm">Total Comissões</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">R$ {totalComissao.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <EnhancedTooltip content="Receita líquida após dedução das comissões">
                  <p className="text-slate-400 text-sm">Receita Líquida</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">R$ {totalReceitaLiquida.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <EnhancedTooltip content="Percentual médio de comissão sobre a receita total">
                  <p className="text-slate-400 text-sm">% Comissão Média</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">
                  {((totalComissao / totalReceita) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de custos por canal */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Análise de Custos por Canal
            <EnhancedTooltip 
              content="Comparação entre receita bruta, comissões e receita líquida por canal"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={channelArray} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="canal" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="receita" fill="#3b82f6" name="Receita Bruta" radius={[2, 2, 0, 0]} />
              <Bar dataKey="comissao" fill="#ef4444" name="Comissão" radius={[2, 2, 0, 0]} />
              <Bar dataKey="receitaLiquida" fill="#10b981" name="Receita Líquida" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de taxa de comissão */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Taxa de Comissão por Canal
            <EnhancedTooltip 
              content="Percentual de comissão cobrado por cada canal"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelArray} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="canal" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Taxa de Comissão']}
                labelStyle={{ color: '#fff' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="taxaComissao" 
                fill="#f59e0b" 
                name="Taxa de Comissão" 
                radius={[2, 2, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela detalhada de custos */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Análise Detalhada de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 p-3">Canal</th>
                  <th className="text-right text-slate-400 p-3">Receita Bruta</th>
                  <th className="text-right text-slate-400 p-3">Taxa Comissão</th>
                  <th className="text-right text-slate-400 p-3">Comissão</th>
                  <th className="text-right text-slate-400 p-3">Receita Líquida</th>
                  <th className="text-right text-slate-400 p-3">Margem Líquida</th>
                </tr>
              </thead>
              <tbody>
                {channelArray
                  .sort((a: any, b: any) => b.receita - a.receita)
                  .map((channel: any) => (
                    <tr key={channel.canal} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="text-white p-3 font-medium">{channel.canal}</td>
                      <td className="text-slate-300 p-3 text-right">R$ {channel.receita.toLocaleString()}</td>
                      <td className="text-yellow-400 p-3 text-right">
                        {(channel.taxaComissao * 100).toFixed(1)}%
                      </td>
                      <td className="text-red-400 p-3 text-right">R$ {channel.comissao.toLocaleString()}</td>
                      <td className="text-green-400 p-3 text-right">R$ {channel.receitaLiquida.toLocaleString()}</td>
                      <td className="text-slate-300 p-3 text-right">
                        {((channel.receitaLiquida / channel.receita) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelCosts;
