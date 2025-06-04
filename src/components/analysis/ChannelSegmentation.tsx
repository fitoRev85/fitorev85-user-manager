
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { PieChart as PieChartIcon, BarChart3, Target, TrendingUp } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

const ChannelSegmentation = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('reservations');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  // Carregar dados das propriedades selecionadas
  const propertyIds = selectedProperty === 'all' ? properties.map(p => p.id) : [selectedProperty];
  const reservationData = propertyIds.map(id => ({
    propertyId: id,
    data: useReservationData(id).data
  }));

  const channelData = useMemo(() => {
    const allReservations = reservationData.flatMap(pd => pd.data);
    
    if (allReservations.length === 0) return null;

    // Filtrar por período
    const currentDate = new Date();
    let filteredReservations = allReservations;
    
    if (selectedPeriod === 'current-month') {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      filteredReservations = allReservations.filter(r => {
        const reservationDate = new Date(r.data_checkin);
        return reservationDate.getMonth() === currentMonth && 
               reservationDate.getFullYear() === currentYear;
      });
    }

    // Agrupar por canal
    const channelStats = filteredReservations.reduce((acc, reservation) => {
      const channel = reservation.canal || 'Direto';
      
      if (!acc[channel]) {
        acc[channel] = {
          channel,
          reservations: 0,
          revenue: 0,
          adr: 0,
          guests: 0
        };
      }
      
      acc[channel].reservations += 1;
      acc[channel].revenue += reservation.valor_total || 0;
      acc[channel].guests += 1; // Assumindo 1 hóspede por reserva para simplificação
      
      return acc;
    }, {} as Record<string, any>);

    // Calcular ADR para cada canal
    Object.values(channelStats).forEach((stats: any) => {
      stats.adr = stats.reservations > 0 ? stats.revenue / stats.reservations : 0;
    });

    const channelArray = Object.values(channelStats);
    
    // Calcular totais
    const totals = {
      reservations: channelArray.reduce((sum: number, channel: any) => sum + channel.reservations, 0),
      revenue: channelArray.reduce((sum: number, channel: any) => sum + channel.revenue, 0),
      guests: channelArray.reduce((sum: number, channel: any) => sum + channel.guests, 0)
    };

    // Adicionar percentuais
    const channelWithPercentages = channelArray.map((channel: any) => ({
      ...channel,
      reservationPercentage: totals.reservations > 0 ? (channel.reservations / totals.reservations) * 100 : 0,
      revenuePercentage: totals.revenue > 0 ? (channel.revenue / totals.revenue) * 100 : 0,
      performance: channel.adr > (totals.revenue / totals.reservations || 0) ? 'above' : 'below'
    }));

    // Ordenar por métrica selecionada
    channelWithPercentages.sort((a, b) => {
      switch (selectedMetric) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'adr':
          return b.adr - a.adr;
        default:
          return b.reservations - a.reservations;
      }
    });

    return {
      channels: channelWithPercentages,
      totals,
      topChannel: channelWithPercentages[0] || null
    };
  }, [reservationData, selectedPeriod, selectedMetric]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getChannelBadge = (performance: string) => {
    return performance === 'above' ? 
      <Badge className="bg-green-500/20 text-green-400">Alto Desempenho</Badge> :
      <Badge className="bg-yellow-500/20 text-yellow-400">Desempenho Padrão</Badge>;
  };

  if (!channelData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <PieChartIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Dados insuficientes</h3>
          <p className="text-slate-400">Não há dados suficientes para segmentação por canal</p>
        </CardContent>
      </Card>
    );
  }

  const pieData = channelData.channels.map((channel, index) => ({
    name: channel.channel,
    value: selectedMetric === 'revenue' ? channel.revenue : 
           selectedMetric === 'adr' ? channel.adr : channel.reservations,
    percentage: selectedMetric === 'revenue' ? channel.revenuePercentage : channel.reservationPercentage,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-orange-400" />
            Segmentação por Canal de Reserva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Selecione a propriedade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as propriedades</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reservations">Número de Reservas</SelectItem>
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="adr">ADR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mês Atual</SelectItem>
                <SelectItem value="all-time">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Total de Canais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {channelData.channels.length}
            </div>
            <div className="text-sm text-slate-400">canais ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Canal Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {channelData.topChannel?.channel || 'N/A'}
            </div>
            <div className="text-sm text-slate-400">
              {channelData.topChannel?.reservationPercentage.toFixed(1)}% das reservas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {formatCurrency(channelData.totals.revenue)}
            </div>
            <div className="text-sm text-slate-400">
              {channelData.totals.reservations} reservas
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">ADR Médio Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {formatCurrency(channelData.totals.revenue / channelData.totals.reservations || 0)}
            </div>
            <div className="text-sm text-slate-400">
              média entre canais
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Distribuição por Canal - {selectedMetric === 'revenue' ? 'Receita' : 
                                         selectedMetric === 'adr' ? 'ADR' : 'Reservas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData.channels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="channel" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="adr" fill="#3B82F6" name="ADR" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Detalhamento por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left p-3 text-slate-300">Canal</th>
                  <th className="text-right p-3 text-slate-300">Reservas</th>
                  <th className="text-right p-3 text-slate-300">% Reservas</th>
                  <th className="text-right p-3 text-slate-300">Receita</th>
                  <th className="text-right p-3 text-slate-300">% Receita</th>
                  <th className="text-right p-3 text-slate-300">ADR</th>
                  <th className="text-center p-3 text-slate-300">Performance</th>
                </tr>
              </thead>
              <tbody>
                {channelData.channels.map((channel, index) => (
                  <tr key={channel.channel} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="p-3 text-white font-medium">{channel.channel}</td>
                    <td className="p-3 text-right text-white">{channel.reservations}</td>
                    <td className="p-3 text-right text-slate-300">{channel.reservationPercentage.toFixed(1)}%</td>
                    <td className="p-3 text-right text-white">{formatCurrency(channel.revenue)}</td>
                    <td className="p-3 text-right text-slate-300">{channel.revenuePercentage.toFixed(1)}%</td>
                    <td className="p-3 text-right text-white">{formatCurrency(channel.adr)}</td>
                    <td className="p-3 text-center">{getChannelBadge(channel.performance)}</td>
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

export default ChannelSegmentation;
