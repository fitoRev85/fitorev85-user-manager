
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';
import { useReservationData } from '@/hooks/useReservationData';

interface ChannelAnalyticsProps {
  propertyId?: string;
}

const ChannelAnalytics = ({ propertyId = 'all' }: ChannelAnalyticsProps) => {
  const { data: reservations } = useReservationData(propertyId);

  // Processar dados por canal
  const channelData = React.useMemo(() => {
    if (reservations.length === 0) return [];

    const channelMap = new Map();
    
    reservations.forEach(reservation => {
      const canal = reservation.canal || 'Direto';
      
      if (!channelMap.has(canal)) {
        channelMap.set(canal, {
          canal,
          reservas: 0,
          receita: 0,
          noites: 0
        });
      }
      
      const data = channelMap.get(canal);
      data.reservas += 1;
      data.receita += reservation.valor_total || 0;
      data.noites += reservation.noites || 1;
    });

    // Calcular métricas
    const channels = Array.from(channelMap.values()).map(channel => ({
      ...channel,
      adr: channel.noites > 0 ? channel.receita / channel.noites : 0
    }));

    const totalReceita = channels.reduce((sum, channel) => sum + channel.receita, 0);
    
    return channels
      .map(channel => ({
        ...channel,
        participacao: totalReceita > 0 ? (channel.receita / totalReceita) * 100 : 0
      }))
      .sort((a, b) => b.receita - a.receita);
  }, [reservations]);

  // Dados para gráfico de pizza (top 5)
  const pieData = channelData.slice(0, 5).map((channel, index) => ({
    name: channel.canal,
    value: channel.receita,
    participacao: channel.participacao,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]
  }));

  // Cores para a tabela
  const getRowColor = (index: number) => {
    const colors = ['bg-blue-500/10', 'bg-green-500/10', 'bg-yellow-500/10', 'bg-red-500/10', 'bg-purple-500/10'];
    return index < 5 ? colors[index] : 'bg-slate-700/30';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-slate-300">Receita: R$ {data.value.toLocaleString()}</p>
          <p className="text-slate-300">Participação: {data.participacao.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (channelData.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Sem dados de canais</h3>
          <p className="text-slate-400">Importe dados de reservas para ver a análise</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos canais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total de Canais</p>
                <p className="text-white text-xl font-bold">{channelData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Canal Principal</p>
                <p className="text-white text-lg font-bold">{channelData[0]?.canal || 'N/A'}</p>
                <p className="text-slate-400 text-xs">{channelData[0]?.participacao.toFixed(1)}% da receita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Receita Total</p>
                <p className="text-white text-lg font-bold">
                  R$ {channelData.reduce((sum, c) => sum + c.receita, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela detalhada */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance por Canal
            </CardTitle>
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
                    <th className="text-right text-slate-400 p-3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((channel, index) => (
                    <tr 
                      key={channel.canal} 
                      className={`border-b border-slate-700/50 ${getRowColor(index)} hover:bg-slate-600/30 transition-colors`}
                    >
                      <td className="text-white p-3 font-medium">
                        <div className="flex items-center gap-2">
                          {index < 5 && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: pieData[index]?.color || '#64748B' }}
                            />
                          )}
                          {channel.canal}
                        </div>
                      </td>
                      <td className="text-slate-300 p-3 text-right">{channel.reservas}</td>
                      <td className="text-slate-300 p-3 text-right">
                        R$ {channel.receita.toLocaleString()}
                      </td>
                      <td className="text-slate-300 p-3 text-right">
                        R$ {channel.adr.toFixed(2)}
                      </td>
                      <td className="text-slate-300 p-3 text-right font-medium">
                        {channel.participacao.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de pizza */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Top 5 Canais por Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, participacao }) => `${participacao.toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legenda adicional com valores */}
            <div className="mt-4 space-y-2">
              {pieData.map((channel, index) => (
                <div key={channel.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: channel.color }}
                    />
                    <span className="text-slate-300">{channel.name}</span>
                  </div>
                  <span className="text-white font-medium">
                    R$ {channel.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelAnalytics;
