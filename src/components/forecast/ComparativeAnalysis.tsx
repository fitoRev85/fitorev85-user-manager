
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Brain } from 'lucide-react';

interface ComparativeData {
  period: string;
  atual: number;
  anoAnterior: number;
  mesAnterior: number;
  mlForecast: number;
}

interface ComparativeAnalysisProps {
  data: ComparativeData[];
  title: string;
  type: 'revenue' | 'adr' | 'occupancy';
}

const ComparativeAnalysis = ({ data, title, type }: ComparativeAnalysisProps) => {
  const formatValue = (value: number) => {
    switch (type) {
      case 'revenue':
        return `R$ ${value.toLocaleString('pt-BR')}`;
      case 'adr':
        return `R$ ${value.toFixed(2)}`;
      case 'occupancy':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calcular médias para comparações
  const averages = data.reduce((acc, item) => {
    acc.atual += item.atual;
    acc.anoAnterior += item.anoAnterior;
    acc.mesAnterior += item.mesAnterior;
    acc.mlForecast += item.mlForecast;
    return acc;
  }, { atual: 0, anoAnterior: 0, mesAnterior: 0, mlForecast: 0 });

  Object.keys(averages).forEach(key => {
    averages[key as keyof typeof averages] /= data.length;
  });

  const yearVariation = calculateVariation(averages.atual, averages.anoAnterior);
  const monthVariation = calculateVariation(averages.atual, averages.mesAnterior);
  const forecastAccuracy = calculateVariation(averages.atual, averages.mlForecast);

  return (
    <div className="space-y-6">
      {/* Métricas Comparativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">vs Ano Anterior</p>
                <p className="text-white text-lg font-bold">{formatValue(averages.atual)}</p>
              </div>
              <div className={`flex items-center gap-1 ${yearVariation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {yearVariation >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(yearVariation).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Anterior: {formatValue(averages.anoAnterior)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">vs Mês Anterior</p>
                <p className="text-white text-lg font-bold">{formatValue(averages.atual)}</p>
              </div>
              <div className={`flex items-center gap-1 ${monthVariation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthVariation >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(monthVariation).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Anterior: {formatValue(averages.mesAnterior)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">vs ML Forecast</p>
                <p className="text-white text-lg font-bold">{formatValue(averages.atual)}</p>
              </div>
              <div className={`flex items-center gap-1 ${Math.abs(forecastAccuracy) <= 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">{Math.abs(forecastAccuracy).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Forecast: {formatValue(averages.mlForecast)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha Comparativo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">{title} - Análise Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={formatValue} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatValue(value), name]}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="atual" stroke="#3b82f6" strokeWidth={3} name="Atual" />
              <Line type="monotone" dataKey="anoAnterior" stroke="#10b981" strokeWidth={2} name="Ano Anterior" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="mesAnterior" stroke="#f59e0b" strokeWidth={2} name="Mês Anterior" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="mlForecast" stroke="#8b5cf6" strokeWidth={2} name="ML Forecast" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras Comparativo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Comparação por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={formatValue} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatValue(value), name]}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              />
              <Bar dataKey="atual" fill="#3b82f6" name="Atual" />
              <Bar dataKey="anoAnterior" fill="#10b981" name="Ano Anterior" />
              <Bar dataKey="mesAnterior" fill="#f59e0b" name="Mês Anterior" />
              <Bar dataKey="mlForecast" fill="#8b5cf6" name="ML Forecast" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparativeAnalysis;
