
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Minus, Settings2, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';
import { useMLForecasting } from '@/hooks/useMLForecasting';
import { useToast } from '@/hooks/use-toast';

interface MLForecastingProps {
  propertyId?: string;
}

const MLForecasting = ({ propertyId = '1' }: MLForecastingProps) => {
  const { toast } = useToast();
  const {
    historical,
    forecast,
    seasonalPatterns,
    model,
    accuracy,
    trend,
    loading,
    forecastDays,
    setForecastDays,
    selectedMetric,
    setSelectedMetric,
    manualAdjustments,
    addManualAdjustment,
    removeManualAdjustment
  } = useMLForecasting(propertyId);

  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Combinar dados históricos e previsões para o gráfico
  const combinedData = [
    ...historical.map(point => ({
      date: point.date,
      historical: point.y,
      type: 'historical'
    })),
    ...forecast.map(point => ({
      date: point.date,
      forecast: point.y,
      type: 'forecast'
    }))
  ];

  const handleManualAdjustment = () => {
    if (!adjustmentDate || !adjustmentValue || !adjustmentReason) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para o ajuste manual",
        variant: "destructive"
      });
      return;
    }

    const originalPoint = forecast.find(p => p.date === adjustmentDate);
    if (!originalPoint) {
      toast({
        title: "Data inválida",
        description: "Selecione uma data válida da previsão",
        variant: "destructive"
      });
      return;
    }

    addManualAdjustment({
      date: adjustmentDate,
      originalValue: originalPoint.y,
      adjustedValue: Number(adjustmentValue),
      reason: adjustmentReason
    });

    setAdjustmentValue('');
    setAdjustmentDate('');
    setAdjustmentReason('');

    toast({
      title: "Ajuste aplicado",
      description: "A previsão foi ajustada manualmente",
    });
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'crescente':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decrescente':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'occupancy':
        return 'Ocupação (%)';
      case 'revenue':
        return 'Receita (R$)';
      case 'adr':
        return 'ADR (R$)';
      default:
        return 'Valor';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="w-8 h-8 animate-pulse text-blue-400" />
        <span className="ml-2 text-white">Processando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Machine Learning Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Métrica</label>
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="occupancy">Ocupação</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="adr">ADR (Diária Média)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período de Previsão</label>
              <Select value={forecastDays.toString()} onValueChange={(value) => setForecastDays(Number(value))}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon()}
                <span className="text-slate-300">Tendência: {trend}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas do Modelo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-blue-300">R² (Precisão)</div>
            <div className="text-2xl font-bold text-blue-400">{(model.r2 * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-green-300">MAE</div>
            <div className="text-2xl font-bold text-green-400">{accuracy.mae.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-purple-300">MAPE</div>
            <div className="text-2xl font-bold text-purple-400">{accuracy.mape.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-orange-300">Dados</div>
            <div className="text-2xl font-bold text-orange-400">{historical.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal: Histórico vs Previsão */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Previsão vs Dados Históricos</CardTitle>
          <p className="text-slate-400">Modelo: {model.equation}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }} 
                labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
              />
              <Line 
                type="monotone" 
                dataKey="historical" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                name={`${getMetricLabel()} (Histórico)`}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                name={`${getMetricLabel()} (Previsão)`}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ajustes Manuais e Sazonalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ajustes Manuais */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Ajustes Manuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                placeholder="Data"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Input
                type="number"
                placeholder="Novo valor"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Input
              placeholder="Motivo do ajuste"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
            <Button 
              onClick={handleManualAdjustment}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Aplicar Ajuste
            </Button>

            {/* Lista de ajustes */}
            {manualAdjustments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Ajustes Aplicados:</h4>
                {manualAdjustments.map((adjustment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <div>
                      <div className="text-sm text-white">{new Date(adjustment.date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-slate-400">{adjustment.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">{adjustment.adjustedValue.toFixed(1)}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeManualAdjustment(adjustment.date)}
                        className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise de Sazonalidade */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Padrões Sazonais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8"
                  tickFormatter={(month) => {
                    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    return months[month - 1];
                  }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }} 
                />
                <Bar dataKey="seasonMultiplier" fill="#3b82f6" name="Multiplicador Sazonal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MLForecasting;
