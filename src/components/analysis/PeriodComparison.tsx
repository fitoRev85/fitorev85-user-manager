
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const PeriodComparison = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [comparisonType, setComparisonType] = useState('month-over-month');
  
  // Carregar dados das propriedades selecionadas
  const propertyIds = selectedProperty === 'all' ? properties.map(p => p.id) : [selectedProperty];
  const reservationData = propertyIds.map(id => ({
    propertyId: id,
    data: useReservationData(id).data
  }));

  const analysisData = useMemo(() => {
    const allReservations = reservationData.flatMap(pd => pd.data);
    
    if (allReservations.length === 0) return null;

    const currentDate = new Date();
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));

    // Filtrar reservas por período
    const currentPeriod = allReservations.filter(r => 
      isWithinInterval(new Date(r.data_checkin), { start: currentMonthStart, end: currentMonthEnd })
    );
    
    const previousPeriod = allReservations.filter(r => 
      isWithinInterval(new Date(r.data_checkin), { start: lastMonthStart, end: lastMonthEnd })
    );

    // Calcular métricas
    const calculateMetrics = (reservations: any[]) => {
      const totalRevenue = reservations.reduce((sum, r) => sum + (r.valor_total || 0), 0);
      const totalReservations = reservations.length;
      const avgADR = totalReservations > 0 ? totalRevenue / totalReservations : 0;
      
      return {
        revenue: totalRevenue,
        reservations: totalReservations,
        adr: avgADR
      };
    };

    const current = calculateMetrics(currentPeriod);
    const previous = calculateMetrics(previousPeriod);

    // Calcular variações percentuais
    const getVariation = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current,
      previous,
      variations: {
        revenue: getVariation(current.revenue, previous.revenue),
        reservations: getVariation(current.reservations, previous.reservations),
        adr: getVariation(current.adr, previous.adr)
      },
      chartData: [
        {
          period: format(lastMonthStart, 'MMM/yyyy'),
          revenue: previous.revenue,
          reservations: previous.reservations,
          adr: previous.adr
        },
        {
          period: format(currentMonthStart, 'MMM/yyyy'),
          revenue: current.revenue,
          reservations: current.reservations,
          adr: current.adr
        }
      ]
    };
  }, [reservationData, comparisonType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatVariation = (variation: number) => {
    const isPositive = variation >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{Math.abs(variation).toFixed(1)}%</span>
      </div>
    );
  };

  if (!analysisData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Dados insuficientes</h3>
          <p className="text-slate-400">Não há dados suficientes para comparação de períodos</p>
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
            <Calendar className="w-5 h-5 text-blue-400" />
            Comparação Período a Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Select value={comparisonType} onValueChange={setComparisonType}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month-over-month">Mês vs Mês Anterior</SelectItem>
                <SelectItem value="year-over-year">Ano vs Ano Anterior</SelectItem>
                <SelectItem value="quarter-over-quarter">Trimestre vs Anterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Comparativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(analysisData.current.revenue)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">vs período anterior</span>
                {formatVariation(analysisData.variations.revenue)}
              </div>
              <div className="text-xs text-slate-500">
                Anterior: {formatCurrency(analysisData.previous.revenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Total de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {analysisData.current.reservations.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">vs período anterior</span>
                {formatVariation(analysisData.variations.reservations)}
              </div>
              <div className="text-xs text-slate-500">
                Anterior: {analysisData.previous.reservations.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">ADR Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(analysisData.current.adr)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">vs período anterior</span>
                {formatVariation(analysisData.variations.adr)}
              </div>
              <div className="text-xs text-slate-500">
                Anterior: {formatCurrency(analysisData.previous.adr)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Receita por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">ADR por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
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
    </div>
  );
};

export default PeriodComparison;
