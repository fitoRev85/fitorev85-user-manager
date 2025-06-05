import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { LoadingState } from '@/components/ui/loading-state';

interface OccupancyChartProps {
  propertyId: string;
  selectedYear: number;
  selectedMonth: number;
  isLoading?: boolean;
}

const OccupancyChart = ({ propertyId, selectedYear, selectedMonth, isLoading = false }: OccupancyChartProps) => {
  // Gerar dados simulados baseados no período selecionado
  const generateOccupancyData = () => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    // Simular dados de ocupação baseados em padrões realistas
    const baseOccupancy = [65, 70, 75, 80, 85, 90, 95, 90, 85, 80, 75, 70];
    
    return months.map((month, index) => {
      const currentYear = baseOccupancy[index] + (Math.random() * 10 - 5);
      const previousYear = baseOccupancy[index] * 0.9 + (Math.random() * 8 - 4);
      const mlForecast = baseOccupancy[index] * 1.05 + (Math.random() * 6 - 3);
      
      return {
        month,
        atual: Math.max(0, Math.min(100, currentYear)),
        anoAnterior: Math.max(0, Math.min(100, previousYear)),
        mlForecast: Math.max(0, Math.min(100, mlForecast)),
        isSelected: index === selectedMonth - 1
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <LoadingState type="data" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <LoadingState type="analysis" message="Processando dados de ocupação..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = generateOccupancyData();
  const selectedData = data[selectedMonth - 1];

  const formatTooltip = (value: number, name: string) => {
    const labels = {
      atual: 'Atual',
      anoAnterior: 'Ano Anterior',
      mlForecast: 'ML Forecast'
    };
    return [`${value.toFixed(1)}%`, labels[name as keyof typeof labels] || name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl animate-fade-in">
          <p className="text-white font-medium mb-2">{`${label} ${selectedYear}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Métricas do mês selecionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <EnhancedTooltip 
                  content="Taxa de ocupação atual baseada nos dados mais recentes disponíveis"
                  type="info"
                >
                  <p className="text-slate-400 text-xs">Ocupação Atual</p>
                </EnhancedTooltip>
                <p className="text-white text-lg font-bold">{selectedData.atual.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <EnhancedTooltip 
                  content="Taxa de ocupação do mesmo período no ano anterior para comparação"
                  type="trend"
                >
                  <p className="text-slate-400 text-xs">Ano Anterior</p>
                </EnhancedTooltip>
                <p className="text-white text-lg font-bold">{selectedData.anoAnterior.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">
                  {((selectedData.atual - selectedData.anoAnterior) / selectedData.anoAnterior * 100).toFixed(1)}% vs anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-glow smooth-transition">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <EnhancedTooltip 
                  content="Previsão gerada por algoritmos de machine learning baseada em dados históricos e tendências"
                  type="forecast"
                >
                  <p className="text-slate-400 text-xs">ML Forecast</p>
                </EnhancedTooltip>
                <p className="text-white text-lg font-bold">{selectedData.mlForecast.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">
                  {((selectedData.mlForecast - selectedData.atual) / selectedData.atual * 100).toFixed(1)}% vs atual
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras comparativo */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover-lift">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Ocupação Mensal - Análise Comparativa {selectedYear}
            <EnhancedTooltip 
              content="Gráfico comparativo mostrando ocupação atual, ano anterior e previsões ML para todos os meses"
              showIcon
            >
              <span></span>
            </EnhancedTooltip>
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Comparação entre ocupação atual, ano anterior e previsão ML
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
              />
              <Bar 
                dataKey="atual" 
                fill="#3b82f6" 
                name="Atual"
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 smooth-transition"
              />
              <Bar 
                dataKey="anoAnterior" 
                fill="#10b981" 
                name="Ano Anterior"
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 smooth-transition"
              />
              <Bar 
                dataKey="mlForecast" 
                fill="#8b5cf6" 
                name="ML Forecast"
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 smooth-transition"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OccupancyChart;
