
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const KPITrending = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('6-months');
  const [selectedKPI, setSelectedKPI] = useState('all');
  
  // Carregar dados das propriedades selecionadas
  const propertyIds = selectedProperty === 'all' ? properties.map(p => p.id) : [selectedProperty];
  const reservationData = propertyIds.map(id => ({
    propertyId: id,
    data: useReservationData(id).data
  }));

  const trendingData = useMemo(() => {
    const allReservations = reservationData.flatMap(pd => pd.data);
    
    if (allReservations.length === 0) return null;

    const currentDate = new Date();
    const monthsToAnalyze = selectedPeriod === '6-months' ? 6 : 
                           selectedPeriod === '12-months' ? 12 : 3;
    
    const startDate = startOfMonth(subMonths(currentDate, monthsToAnalyze - 1));
    const endDate = endOfMonth(currentDate);
    
    const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });

    const monthlyData = monthsInterval.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthReservations = allReservations.filter(r => {
        const reservationDate = new Date(r.data_checkin);
        return reservationDate >= monthStart && reservationDate <= monthEnd;
      });

      const revenue = monthReservations.reduce((sum, r) => sum + (r.valor_total || 0), 0);
      const reservations = monthReservations.length;
      const adr = reservations > 0 ? revenue / reservations : 0;
      const occupancy = Math.min(100, (reservations / 30) * 100); // Simulado

      return {
        month: format(month, 'MMM/yy'),
        monthFull: format(month, 'MMMM yyyy'),
        revenue,
        reservations,
        adr,
        occupancy
      };
    });

    // Calcular tendências
    const calculateTrend = (data: number[]) => {
      if (data.length < 2) return 0;
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    };

    const trends = {
      revenue: calculateTrend(monthlyData.map(d => d.revenue)),
      reservations: calculateTrend(monthlyData.map(d => d.reservations)),
      adr: calculateTrend(monthlyData.map(d => d.adr)),
      occupancy: calculateTrend(monthlyData.map(d => d.occupancy))
    };

    return {
      monthlyData,
      trends
    };
  }, [reservationData, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0;
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  const getTrendBadge = (trend: number) => {
    if (trend > 5) return <Badge className="bg-green-500/20 text-green-400">Crescimento</Badge>;
    if (trend < -5) return <Badge className="bg-red-500/20 text-red-400">Declínio</Badge>;
    return <Badge className="bg-yellow-500/20 text-yellow-400">Estável</Badge>;
  };

  if (!trendingData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Dados insuficientes</h3>
          <p className="text-slate-400">Não há dados suficientes para análise de tendências</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Trending de KPIs
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

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="12-months">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedKPI} onValueChange={setSelectedKPI}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os KPIs</SelectItem>
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="adr">ADR</SelectItem>
                <SelectItem value="occupancy">Ocupação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Tendência */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Receita
              {getTrendBadge(trendingData.trends.revenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {formatCurrency(trendingData.monthlyData[trendingData.monthlyData.length - 1]?.revenue || 0)}
              </div>
              <div className="text-sm text-slate-400">
                Último mês
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Tendência:</span>
                {formatTrend(trendingData.trends.revenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Reservas
              {getTrendBadge(trendingData.trends.reservations)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {trendingData.monthlyData[trendingData.monthlyData.length - 1]?.reservations || 0}
              </div>
              <div className="text-sm text-slate-400">
                Último mês
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Tendência:</span>
                {formatTrend(trendingData.trends.reservations)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              ADR
              {getTrendBadge(trendingData.trends.adr)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {formatCurrency(trendingData.monthlyData[trendingData.monthlyData.length - 1]?.adr || 0)}
              </div>
              <div className="text-sm text-slate-400">
                Último mês
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Tendência:</span>
                {formatTrend(trendingData.trends.adr)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Ocupação
              {getTrendBadge(trendingData.trends.occupancy)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {trendingData.monthlyData[trendingData.monthlyData.length - 1]?.occupancy.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-slate-400">
                Último mês
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Tendência:</span>
                {formatTrend(trendingData.trends.occupancy)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha dos KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendingData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Evolução do ADR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendingData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="adr" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Multi-KPI */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Comparação Multi-KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendingData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Reservas"
                />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Ocupação %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPITrending;
