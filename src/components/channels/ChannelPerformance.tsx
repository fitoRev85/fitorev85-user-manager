
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { LoadingState } from '@/components/ui/loading-state';
import { ReservaData } from '@/hooks/useReservationData';

interface ChannelPerformanceProps {
  data: ReservaData[];
  loading: boolean;
  propertyId: string;
  period: string;
}

const ChannelPerformance = ({ data, loading, propertyId, period }: ChannelPerformanceProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6">
              <LoadingState type="analysis" message="Analisando performance dos canais..." />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Processar dados por canal
  const channelData = data.reduce((acc, reserva) => {
    const canal = reserva.canal || 'Direto';
    if (!acc[canal]) {
      acc[canal] = {
        canal,
        reservas: 0,
        receita: 0,
        adr: 0,
        noites: 0
      };
    }
    
    acc[canal].reservas += 1;
    acc[canal].receita += reserva.valor_total;
    acc[canal].noites += reserva.noites || 1;
    
    return acc;
  }, {} as Record<string, any>);

  // Calcular ADR por canal
  Object.values(channelData).forEach((channel: any) => {
    channel.adr = channel.noites > 0 ? channel.receita / channel.noites : 0;
  });

  const channelArray = Object.values(channelData);
  const totalReceita = channelArray.reduce((sum: number, channel: any) => sum + channel.receita, 0);
  const totalReservas = channelArray.reduce((sum: number, channel: any) => sum + channel.reservas, 0);

  // Cores para os gráficos
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  const pieData = channelArray.map((channel: any, index) => ({
    ...channel,
    participacao: (channel.receita / totalReceita) * 100,
    color: colors[index % colors.length]
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name.includes('ADR') ? 'R$ ' + entry.value.toFixed(2) : 
                entry.name.includes('Receita') ? 'R$ ' + entry.value.toLocaleString() : 
                entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métricas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <EnhancedTooltip content="Total de reservas no período selecionado">
                  <p className="text-slate-400 text-sm">Total Reservas</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">{totalReservas.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <EnhancedTooltip content="Receita total gerada por todos os canais">
                  <p className="text-slate-400 text-sm">Receita Total</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">R$ {totalReceita.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <EnhancedTooltip content="Número de canais ativos com reservas">
                  <p className="text-slate-400 text-sm">Canais Ativos</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">{channelArray.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <EnhancedTooltip content="ADR médio geral considerando todos os canais">
                  <p className="text-slate-400 text-sm">ADR Médio</p>
                </EnhancedTooltip>
                <p className="text-white text-xl font-bold">
                  R$ {(totalReceita / data.reduce((sum, r) => sum + (r.noites || 1), 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Performance por canal */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance por Canal
              <EnhancedTooltip 
                content="Comparação de receita e número de reservas por canal de distribuição"
                showIcon
              >
                <span></span>
              </EnhancedTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelArray} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="canal" 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receita" fill="#3b82f6" name="Receita (R$)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="reservas" fill="#10b981" name="Reservas" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Participação por receita */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Participação na Receita
              <EnhancedTooltip 
                content="Distribuição percentual da receita por canal"
                showIcon
              >
                <span></span>
              </EnhancedTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="participacao"
                  label={({ canal, participacao }) => `${canal}: ${participacao.toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela detalhada */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white">Detalhamento por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 p-3">Canal</th>
                  <th className="text-right text-slate-400 p-3">Reservas</th>
                  <th className="text-right text-slate-400 p-3">Receita</th>
                  <th className="text-right text-slate-400 p-3">ADR</th>
                  <th className="text-right text-slate-400 p-3">Participação</th>
                </tr>
              </thead>
              <tbody>
                {channelArray
                  .sort((a: any, b: any) => b.receita - a.receita)
                  .map((channel: any, index) => (
                    <tr key={channel.canal} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="text-white p-3 font-medium">{channel.canal}</td>
                      <td className="text-slate-300 p-3 text-right">{channel.reservas.toLocaleString()}</td>
                      <td className="text-slate-300 p-3 text-right">R$ {channel.receita.toLocaleString()}</td>
                      <td className="text-slate-300 p-3 text-right">R$ {channel.adr.toFixed(2)}</td>
                      <td className="text-slate-300 p-3 text-right">
                        {((channel.receita / totalReceita) * 100).toFixed(1)}%
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

export default ChannelPerformance;
