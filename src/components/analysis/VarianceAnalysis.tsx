
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useReservationData } from '@/hooks/useReservationData';

const VarianceAnalysis = () => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  // Carregar dados das propriedades selecionadas
  const propertyIds = selectedProperty === 'all' ? properties.map(p => p.id) : [selectedProperty];
  const reservationData = propertyIds.map(id => ({
    propertyId: id,
    data: useReservationData(id).data
  }));

  // Metas simuladas (normalmente viriam de uma API ou configuração)
  const budgetTargets = useMemo(() => ({
    revenue: 150000,
    reservations: 120,
    adr: 1250,
    occupancy: 75
  }), []);

  const analysisData = useMemo(() => {
    const allReservations = reservationData.flatMap(pd => pd.data);
    
    if (allReservations.length === 0) return null;

    // Calcular realizados do mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthReservations = allReservations.filter(r => {
      const reservationDate = new Date(r.data_checkin);
      return reservationDate.getMonth() === currentMonth && 
             reservationDate.getFullYear() === currentYear;
    });

    const realized = {
      revenue: currentMonthReservations.reduce((sum, r) => sum + (r.valor_total || 0), 0),
      reservations: currentMonthReservations.length,
      adr: currentMonthReservations.length > 0 ? 
           currentMonthReservations.reduce((sum, r) => sum + (r.valor_total || 0), 0) / currentMonthReservations.length : 0,
      occupancy: Math.min(100, (currentMonthReservations.length / 30) * 100) // Simulado
    };

    // Calcular variações
    const getVariance = (realized: number, budget: number) => {
      const variance = realized - budget;
      const percentageVariance = budget > 0 ? (variance / budget) * 100 : 0;
      return {
        absolute: variance,
        percentage: percentageVariance,
        status: percentageVariance >= -5 ? 'good' : percentageVariance >= -15 ? 'warning' : 'critical'
      };
    };

    const variances = {
      revenue: getVariance(realized.revenue, budgetTargets.revenue),
      reservations: getVariance(realized.reservations, budgetTargets.reservations),
      adr: getVariance(realized.adr, budgetTargets.adr),
      occupancy: getVariance(realized.occupancy, budgetTargets.occupancy)
    };

    // Dados para gráfico
    const chartData = [
      {
        metric: 'Receita',
        orçado: budgetTargets.revenue,
        realizado: realized.revenue,
        variance: variances.revenue.percentage
      },
      {
        metric: 'Reservas',
        orçado: budgetTargets.reservations,
        realizado: realized.reservations,
        variance: variances.reservations.percentage
      },
      {
        metric: 'ADR',
        orçado: budgetTargets.adr,
        realizado: realized.adr,
        variance: variances.adr.percentage
      },
      {
        metric: 'Ocupação',
        orçado: budgetTargets.occupancy,
        realizado: realized.occupancy,
        variance: variances.occupancy.percentage
      }
    ];

    return {
      realized,
      budget: budgetTargets,
      variances,
      chartData
    };
  }, [reservationData, budgetTargets]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatVariance = (variance: any, isPercentage = false) => {
    const isPositive = variance.percentage >= 0;
    const color = variance.status === 'good' ? 'text-green-400' : 
                  variance.status === 'warning' ? 'text-yellow-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {variance.status === 'good' ? <CheckCircle className="w-4 h-4" /> : 
         variance.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> : 
         <XCircle className="w-4 h-4" />}
        <span>
          {isPositive ? '+' : ''}{isPercentage ? 
            `${variance.percentage.toFixed(1)}%` : 
            variance.absolute.toLocaleString()}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      good: 'bg-green-500/20 text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      critical: 'bg-red-500/20 text-red-400'
    };
    
    const labels = {
      good: 'Meta Atingida',
      warning: 'Atenção',
      critical: 'Crítico'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (!analysisData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Dados insuficientes</h3>
          <p className="text-slate-400">Não há dados suficientes para análise de variance</p>
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
            <Target className="w-5 h-5 text-purple-400" />
            Análise Orçado vs Realizado
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

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="reservations">Reservas</SelectItem>
                <SelectItem value="adr">ADR</SelectItem>
                <SelectItem value="occupancy">Ocupação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Variance por Métrica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Receita
              {getStatusBadge(analysisData.variances.revenue.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {formatCurrency(analysisData.realized.revenue)}
              </div>
              <div className="text-sm text-slate-400">
                Meta: {formatCurrency(analysisData.budget.revenue)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Variance:</span>
                {formatVariance(analysisData.variances.revenue, true)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Reservas
              {getStatusBadge(analysisData.variances.reservations.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {analysisData.realized.reservations.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                Meta: {analysisData.budget.reservations.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Variance:</span>
                {formatVariance(analysisData.variances.reservations, true)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              ADR
              {getStatusBadge(analysisData.variances.adr.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {formatCurrency(analysisData.realized.adr)}
              </div>
              <div className="text-sm text-slate-400">
                Meta: {formatCurrency(analysisData.budget.adr)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Variance:</span>
                {formatVariance(analysisData.variances.adr, true)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              Ocupação
              {getStatusBadge(analysisData.variances.occupancy.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white">
                {analysisData.realized.occupancy.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">
                Meta: {analysisData.budget.occupancy}%
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Variance:</span>
                {formatVariance(analysisData.variances.occupancy, true)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Variance */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Comparação Orçado vs Realizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analysisData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="metric" stroke="#9CA3AF" />
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
                <Bar dataKey="orçado" fill="#6B7280" name="Orçado" />
                <Bar dataKey="realizado" fill="#3B82F6" name="Realizado" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VarianceAnalysis;
